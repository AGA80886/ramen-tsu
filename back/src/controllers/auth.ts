import type { Request, Response } from 'express'
import * as yup from 'yup'
import validator from 'validator'
import { StatusCodes } from 'http-status-codes'
import jsonwebtoken from 'jsonwebtoken'

import User, { type IUser } from '../models/user'
import RefreshToken from '../models/refreshToken'
import PasswordResetToken from '../models/passwordResetToken'
import { random, cookieOptions, hash, createRandomToken, hashToken } from '../utils/token'
import { sendPasswordResetEmail } from '../services/mail'

const registerSchema = yup.object({
  account: yup
    .string()
    .typeError('資料格式錯誤')
    .required('帳號必填')
    .min(4, '帳號必需是 4 個字以上')
    .max(20, '帳號必需是 20 個字以下')
    .test('isAlphanumeric', '帳號只能是英數字', (value) => validator.isAlphanumeric(value)),

  password: yup
    .string()
    .typeError('資料格式錯誤')
    .required('密碼必填')
    .min(4, '密碼最少 4 個字')
    .max(20, '密碼最長 20 個字'),
})

const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .typeError('資料格式錯誤')
    .trim()
    .lowercase()
    .required('Email 必填')
    .test('isEmail', 'Email 格式錯誤', (value) => validator.isEmail(value)),
})

const resetPasswordSchema = yup.object({
  token: yup.string().typeError('資料格式錯誤').trim().required('缺少重設密碼 Token'),

  password: yup
    .string()
    .typeError('資料格式錯誤')
    .required('新密碼必填')
    .min(4, '新密碼至少需要 4 個字')
    .max(20, '新密碼最多 20 個字'),

  confirmPassword: yup
    .string()
    .typeError('資料格式錯誤')
    .required('確認密碼必填')
    .oneOf([yup.ref('password')], '兩次輸入的密碼不一致'),
})

export const register = async (req: Request, res: Response): Promise<void> => {
  const parsedBody = await registerSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  })

  await User.create(parsedBody)

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: '',
    result: {},
  })
}

export const login = async (req: Request, res: Response): Promise<void> => {
  const accessToken = jsonwebtoken.sign({ _id: req.user!._id }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  })

  const refreshToken = random()

  await RefreshToken.create({
    user: req.user!._id,
    refreshToken,
  })

  res
    .status(StatusCodes.OK)
    .cookie('refresh', refreshToken, cookieOptions)
    .json({
      success: true,
      message: '',
      result: {
        accessToken,
        account: req.user!.account,
        role: req.user!.role,
        cart: req.user!.cart.length,
      },
    })
}

export const refresh = async (req: Request, res: Response): Promise<void> => {
  if (!req.cookies.refresh) {
    throw new Error('RT')
  }

  const hashedToken = hash(req.cookies.refresh)

  const deletedRT = await RefreshToken.findOneAndDelete({
    refreshToken: hashedToken,
  })
    .populate<{ user: IUser }>('user')
    .orFail(new Error('RT'))

  const accessToken = jsonwebtoken.sign({ _id: deletedRT.user._id }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  })

  const refreshToken = random()

  await RefreshToken.create({
    user: deletedRT.user._id,
    refreshToken,
  })

  res
    .status(StatusCodes.OK)
    .cookie('refresh', refreshToken, cookieOptions)
    .json({
      success: true,
      message: '',
      result: {
        accessToken,
        account: deletedRT.user.account,
        role: deletedRT.user.role,
        cart: deletedRT.user.cart.length,
      },
    })
}

export const logout = async (req: Request, res: Response): Promise<void> => {
  if (!req.cookies.refresh) {
    throw new Error('RT')
  }

  const hashedToken = hash(req.cookies.refresh)

  await RefreshToken.findOneAndDelete({
    refreshToken: hashedToken,
  }).orFail(new Error('RT'))

  res.status(StatusCodes.OK).clearCookie('refresh', cookieOptions).json({
    success: true,
    message: '',
    result: {},
  })
}

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const body = await forgotPasswordSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  })

  const successResponse = {
    success: true,
    message: '如果此 Email 已註冊，將收到密碼重設連結',
  }

  const user = await User.findOne({
    email: body.email,
  })

  if (!user) {
    res.status(StatusCodes.OK).json(successResponse)
    return
  }

  await PasswordResetToken.deleteMany({
    user: user._id,
  })

  const rawToken = createRandomToken()
  const tokenHash = hashToken(rawToken)

  await PasswordResetToken.create({
    user: user._id,
    tokenHash,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
  })

  try {
    await sendPasswordResetEmail({
      email: user.email!,
      token: rawToken,
    })
  } catch {
    await PasswordResetToken.deleteOne({
      tokenHash,
    })

    throw new Error('PASSWORD_RESET_EMAIL_SEND_FAILED')
  }

  res.status(StatusCodes.OK).json(successResponse)
}

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const body = await resetPasswordSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  })

  const tokenHash = hashToken(body.token)

  const resetToken = await PasswordResetToken.findOne({
    tokenHash,
  })

  if (!resetToken) {
    throw new Error('PASSWORD_RESET_TOKEN_INVALID')
  }

  if (resetToken.expiresAt.getTime() <= Date.now()) {
    await resetToken.deleteOne()

    throw new Error('PASSWORD_RESET_TOKEN_EXPIRED')
  }

  const user = await User.findById(resetToken.user)

  if (!user) {
    await resetToken.deleteOne()

    throw new Error('USER_NOT_FOUND')
  }

  // 只指派明文密碼，由 User Model 的 pre('save') 負責 bcrypt hash。
  user.password = body.password

  await user.save()

  await Promise.all([
    PasswordResetToken.deleteMany({
      user: user._id,
    }),

    // 重設密碼後撤銷既有 Refresh Token，要求重新登入。
    RefreshToken.deleteMany({
      user: user._id,
    }),
  ])

  res.status(StatusCodes.OK).json({
    success: true,
    message: '密碼重設成功',
  })
}
