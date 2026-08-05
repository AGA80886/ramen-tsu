import type { Request, Response } from 'express'
import * as yup from 'yup'
import bcrypt from 'bcrypt'
import validator from 'validator'
import { StatusCodes } from 'http-status-codes'
import { Types } from 'mongoose'
import User, { type UserDocument } from '../models/user'
import Product from '../models/product'
import cloudinary from '../configs/cloudinary'
import EmailVerificationToken from '../models/emailVerificationToken'
import { createRandomToken, hashToken } from '../utils/token'
import { sendVerificationEmail } from '../services/mail'

const toProfileResponse = (user: UserDocument) => ({
  _id: user._id.toString(),
  account: user.account,
  email: user.email ?? '',
  emailVerified: user.emailVerified ?? false,
  emailVerifiedAt: user.emailVerifiedAt ?? null,
  nickname: user.nickname ?? '',
  avatar: user.avatar ?? '',
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
})

export const getMe = async (req: Request, res: Response) => {
  const user = await User.findById(req.user!._id).orFail(new Error('USER_NOT_FOUND'))

  res.status(StatusCodes.OK).json({
    success: true,
    message: '',
    result: toProfileResponse(user),
  })
}

export const updateMe = async (req: Request, res: Response) => {
  const schema = yup
    .object({
      nickname: yup.string().typeError('資料格式錯誤').trim().max(30, '暱稱最多 30 個字'),
      email: yup
        .string()
        .typeError('資料格式錯誤')
        .trim()
        .lowercase()
        .test('isEmail', 'Email 格式錯誤', (value) => !value || validator.isEmail(value)),
    })
    .test(
      'hasEditableField',
      '沒有可更新的會員資料',
      (value) => value.nickname !== undefined || value.email !== undefined,
    )

  const parsedBody = await schema.validate(req.body, { stripUnknown: true })

  const user = await User.findById(req.user!._id).orFail(new Error('USER_NOT_FOUND'))

  const { email, nickname } = parsedBody

  if (email !== undefined) {
    user.email = email
  }

  if (nickname !== undefined) {
    user.nickname = nickname
  }
  await user.save()

  res.status(StatusCodes.OK).json({
    success: true,
    message: '會員資料更新成功',
    result: toProfileResponse(user),
  })
}

export const updateAvatar = async (req: Request, res: Response) => {
  if (!req.file) {
    throw new Error('AVATAR_REQUIRED')
  }

  try {
    const user = await User.findById(req.user!._id)
      .select('+avatarPublicId')
      .orFail(new Error('USER_NOT_FOUND'))

    const oldAvatarPublicId = user.avatarPublicId

    user.avatar = req.file.path
    user.avatarPublicId = req.file.filename

    await user.save()

    if (oldAvatarPublicId) {
      void cloudinary.uploader.destroy(oldAvatarPublicId).catch((error) => {
        console.error('刪除舊頭像失敗', error)
      })
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: '頭像更新成功',
      result: toProfileResponse(user),
    })
  } catch (error) {
    void cloudinary.uploader.destroy(req.file.filename).catch((cleanupError) => {
      console.error('清理新頭像失敗', cleanupError)
    })

    throw error
  }
}

export const cart = async (req: Request, res: Response) => {
  const schema = yup.object({
    product: yup
      .string()
      .typeError('資料格式錯誤')
      .required('商品必填')
      .trim()
      .test('isMongoId', '資料格式錯誤', (value) => validator.isMongoId(value)),
    quantity: yup.number().typeError('資料格式錯誤').required('數量必填'),
    replace: yup.boolean().typeError('資料格式錯誤').required('取代必填'),
  })
  const parsedBody = await schema.validate(req.body, { stripUnknown: true })

  await Product.findById(parsedBody.product).orFail(new Error('PRODUCT NOT FOUND'))

  const idx = req.user!.cart.findIndex((item) => {
    return item.product.toString() === parsedBody.product
  })

  if (idx > -1) {
    if (parsedBody.replace) {
      req.user!.cart[idx]!.quantity = parsedBody.quantity
    } else {
      req.user!.cart[idx]!.quantity += parsedBody.quantity
    }

    if (req.user!.cart[idx]!.quantity <= 0) {
      req.user!.cart.splice(idx, 1)
    }
  } else if (parsedBody.quantity > 0) {
    req.user!.cart.push({
      product: new Types.ObjectId(parsedBody.product),
      quantity: parsedBody.quantity,
    })
  }

  await req.user!.save()

  res.status(StatusCodes.OK).json({
    success: true,
    message: '',
    result: req.user!.cart.length,
  })
}

export const getCart = async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id).populate('cart.product')
  res.status(StatusCodes.OK).json({
    success: true,
    message: '',
    result: user!.cart,
  })
}

const updatePasswordSchema = yup.object({
  currentPassword: yup.string().required('請輸入目前密碼'),

  newPassword: yup
    .string()
    .required('請輸入新密碼')
    .min(4, '新密碼至少需要 4 個字')
    .max(20, '新密碼最多 20 個字')
    .test('different-password', '新密碼不可與目前密碼相同', function (value) {
      return value !== this.parent.currentPassword
    }),
})

export const updatePassword = async (req: Request, res: Response): Promise<void> => {
  const body = await updatePasswordSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  })

  const user = await User.findById(req.user!._id)
    .select('+password')
    .orFail(new Error('USER_NOT_FOUND'))

  const isPasswordCorrect = await bcrypt.compare(body.currentPassword, user.password)

  if (!isPasswordCorrect) {
    throw new Error('CURRENT_PASSWORD_INCORRECT')
  }

  const isSamePassword = await bcrypt.compare(body.newPassword, user.password)

  if (isSamePassword) {
    throw new Error('PASSWORD_NOT_CHANGED')
  }

  // 只指派明文密碼。
  // User Model 的 pre('save') 會負責驗證與 bcrypt hash。
  user.password = body.newPassword

  await user.save()

  res.status(StatusCodes.OK).json({
    success: true,
    message: '密碼修改成功',
  })
}

export const requestEmailVerification = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findById(req.user!._id).orFail(new Error('USER_NOT_FOUND'))

  if (!user.email) {
    throw new Error('EMAIL_REQUIRED')
  }

  if (user.emailVerified) {
    throw new Error('EMAIL_ALREADY_VERIFIED')
  }

  await EmailVerificationToken.deleteMany({
    user: user._id,
  })

  const rawToken = createRandomToken()
  const tokenHash = hashToken(rawToken)

  await EmailVerificationToken.create({
    user: user._id,
    tokenHash,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
  })

  try {
    await sendVerificationEmail({
      email: user.email,
      token: rawToken,
    })
  } catch (error) {
    await EmailVerificationToken.deleteOne({
      tokenHash,
    })

    throw error
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: '驗證信已寄出',
  })
}
const verifyEmailSchema = yup.object({
  token: yup.string().trim().required('缺少驗證 Token'),
})

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  const body = await verifyEmailSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  })

  const tokenHash = hashToken(body.token)

  const verificationToken = await EmailVerificationToken.findOne({
    tokenHash,
  })

  if (!verificationToken) {
    throw new Error('EMAIL_VERIFICATION_TOKEN_INVALID')
  }

  if (verificationToken.expiresAt.getTime() <= Date.now()) {
    await verificationToken.deleteOne()

    throw new Error('EMAIL_VERIFICATION_TOKEN_EXPIRED')
  }

  const user = await User.findById(verificationToken.user)

  if (!user) {
    await verificationToken.deleteOne()

    throw new Error('USER_NOT_FOUND')
  }

  if (user.emailVerified) {
    await EmailVerificationToken.deleteMany({
      user: user._id,
    })

    throw new Error('EMAIL_ALREADY_VERIFIED')
  }

  user.emailVerified = true
  user.emailVerifiedAt = new Date()

  await user.save()

  console.log('Email verification saved:', {
    userId: user._id.toString(),
    emailVerified: user.emailVerified,
    emailVerifiedAt: user.emailVerifiedAt,
  })

  await EmailVerificationToken.deleteMany({
    user: user._id,
  })

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Email 驗證成功',
  })
}
