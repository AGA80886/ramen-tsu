import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import type { Request, Response, NextFunction } from 'express'
import cloudinary from '../configs/cloudinary'

const upload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: async () => ({
      folder: 'ramen-tsu/avatars',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [
        {
          width: 512,
          height: 512,
          crop: 'fill',
          gravity: 'face',
        },
      ],
    }),
  }),
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (['image/png', 'image/jpeg', 'image/webp'].includes(file.mimetype)) {
      callback(null, true)
    } else {
      callback(new Error('AVATAR_TYPE'))
    }
  },
})

export default (req: Request, res: Response, next: NextFunction) => {
  upload.single('avatar')(req, res, (error) => {
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      next(new Error('AVATAR_SIZE'))
      return
    }

    if (error) {
      next(error)
      return
    }

    next()
  })
}
