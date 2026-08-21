import type { Request, Response, NextFunction } from 'express'
import multer from 'multer'

import { uploadImageBuffer } from '../utils/cloudinaryUpload'

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 1024 * 1024,
  },

  fileFilter: (_req, file, callback) => {
    if (['image/png', 'image/jpeg'].includes(file.mimetype)) {
      callback(null, true)
      return
    }

    callback(null, false)
  },
})

export default (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  upload.single('image')(req, res, async (error) => {
    if (error) {
      next(new Error('UPLOAD_FAILED'))
      return
    }

    if (!req.file) {
      next()
      return
    }

    try {
      const result = await uploadImageBuffer(req.file.buffer)

      req.file.filename = result.public_id
      req.file.path = result.secure_url

      next()
    } catch (uploadError) {
      console.error('Cloudinary 圖片上傳失敗', uploadError)
      next(new Error('UPLOAD_FAILED'))
    }
  })
}
