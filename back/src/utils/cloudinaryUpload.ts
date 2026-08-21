import type { UploadApiOptions, UploadApiResponse } from 'cloudinary'

import cloudinary from '../configs/cloudinary'

export const uploadImageBuffer = (
  buffer: Buffer,
  options: UploadApiOptions = {},
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        ...options,
      },
      (error, result) => {
        if (error) {
          reject(error)
          return
        }

        if (!result) {
          reject(new Error('UPLOAD_FAILED'))
          return
        }

        resolve(result)
      },
    )

    stream.end(buffer)
  })
}
