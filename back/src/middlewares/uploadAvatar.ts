import type { Request, Response, NextFunction } from 'express'
import multer from 'multer'

import { uploadImageBuffer } from '../utils/cloudinaryUpload'

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 2 * 1024 * 1024,
  },

  fileFilter: (_req, file, callback) => {
    if (['image/png', 'image/jpeg', 'image/webp'].includes(file.mimetype)) {
      callback(null, true)
      return
    }

    callback(new Error('AVATAR_TYPE'))
  },
})

export default (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  upload.single('avatar')(req, res, async (error) => {
    if (
      error instanceof multer.MulterError
      && error.code === 'LIMIT_FILE_SIZE'
    ) {
      next(new Error('AVATAR_SIZE'))
      return
    }

    if (error) {
      next(error)
      return
    }

    if (!req.file) {
      next()
      return
    }

    try {
      const result = await uploadImageBuffer(
        req.file.buffer,
        {
          folder: 'ramen-tsu/avatars',
          transformation: [
            {
              width: 512,
              height: 512,
              crop: 'fill',
              gravity: 'face',
            },
          ],
        },
      )

      req.file.filename = result.public_id
      req.file.path = result.secure_url

      next()
    } catch (uploadError) {
      console.error('Cloudinary 頭像上傳失敗', uploadError)
      next(new Error('UPLOAD_FAILED'))
    }
  })
}
