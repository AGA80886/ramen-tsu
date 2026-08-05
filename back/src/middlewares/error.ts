import type { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import * as yup from 'yup'
import { Error as MongooseError } from 'mongoose'
import { MongoServerError } from 'mongodb'
import cloudinary from '../configs/cloudinary'

export default async (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  console.error(error)

  // 如果有錯誤，刪除已上傳但尚未成功寫入資料庫的圖片。
  if (req.file?.filename) {
    await cloudinary.uploader.destroy(req.file.filename).catch((cleanupError) => {
      console.error('清理上傳圖片失敗', cleanupError)
    })
  }

  if (error instanceof SyntaxError && error.message.includes('JSON')) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: '格式錯誤',
    })
    return
  }

  if (error instanceof yup.ValidationError) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message,
    })
    return
  }

  if (error instanceof MongooseError.ValidationError) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: Object.values(error.errors)[0]!.message,
    })
    return
  }

  if (error instanceof MongoServerError && error.code === 11000) {
    const duplicatedField = Object.keys(error.keyPattern ?? {})[0]

    res.status(StatusCodes.CONFLICT).json({
      success: false,
      message: duplicatedField === 'email' ? 'Email 已被使用' : '帳號重複',
    })
    return
  }

  if (error instanceof Error) {
    switch (error.message) {
      case 'LOGIN':
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: '帳號或密碼錯誤',
        })
        return

      case 'TOKEN':
      case 'RT':
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: '認證錯誤',
        })
        return

      case 'CURRENT_PASSWORD_INCORRECT':
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: '目前密碼錯誤',
        })
        return

      case 'PASSWORD_NOT_CHANGED':
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: '新密碼不可與目前密碼相同',
        })
        return

      case 'ADMIN':
        res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: '權限不足',
        })
        return

      case 'CORS':
        res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: '不允許的請求來源',
        })
        return

      case 'UPLOAD_FAILED':
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: '上傳錯誤',
        })
        return

      case 'AVATAR_REQUIRED':
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: '請選擇頭像檔案',
        })
        return

      case 'AVATAR_TYPE':
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: '頭像只支援 JPG、PNG 或 WebP',
        })
        return

      case 'AVATAR_SIZE':
        res.status(413).json({
          success: false,
          message: '頭像大小不可超過 2MB',
        })
        return

      case 'USER_NOT_FOUND':
        res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: '找不到會員資料',
        })
        return

      case 'PRODUCT NOT FOUND':
        res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: '找不到商品',
        })
        return

      case 'CART EMPTY':
        res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: '購物車是空的',
        })
        return

      case 'CART SELL':
        res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: '購物車包含下架商品',
        })
        return

      default:
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: '伺服器錯誤',
        })
        return
    }
  }

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: '伺服器錯誤',
  })
}
