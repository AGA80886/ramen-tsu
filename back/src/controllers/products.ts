import type { Request, Response } from 'express'
import Product, { categoryOptions, IProduct } from '../models/products'
import * as yup from 'yup'
import validator from 'validator'
import { StatusCodes } from 'http-status-codes'
import cloudinary from '../configs/cloudinary'

type ProductBody = Pick<IProduct, 'name' | 'price' | 'description' | 'category' | 'sell'>

type CreateProductBody = ProductBody & Pick<IProduct, 'image'>

const paramsSchema = yup.object({
  id: yup
    .string()
    .typeError('資料格式錯誤')
    .required('ID 必填')
    .trim()
    .test('isMongoId', '資料格式錯誤', (value) => validator.isMongoId(value)),
})

const productBodySchema: yup.ObjectSchema<ProductBody> = yup.object({
  name: yup.string().typeError('資料格式錯誤').required('名稱必填').trim(),

  price: yup
    .number()
    .typeError('資料格式錯誤')
    .required('價格必填')
    .integer('價格必須為整數')
    .min(0, '價格錯誤'),

  description: yup.string().typeError('資料格式錯誤').required('說明必填').trim(),

  category: yup
    .mixed<IProduct['category']>()
    .oneOf(categoryOptions, '分類錯誤')
    .required('分類必填'),

  sell: yup.boolean().typeError('資料格式錯誤').required('上下架必填'),
})

const createProductSchema: yup.ObjectSchema<CreateProductBody> = productBodySchema.shape({
  image: yup.string().typeError('資料格式錯誤').required('圖片必填'),
})

export const create = async (req: Request, res: Response) => {
  const parsedBody = await createProductSchema.validate(
    {
      ...req.body,
      image: req.file?.filename,
    },
    {
      stripUnknown: true,
    },
  )

  const result = await Product.create(parsedBody)

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: '',
    result,
  })
}

export const update = async (req: Request, res: Response) => {
  const parsedParams = await paramsSchema.validate(req.params, {
    stripUnknown: true,
  })

  const parsedBody = await productBodySchema.validate(req.body, {
    stripUnknown: true,
  })

  const product = await Product.findById(parsedParams.id).orFail(new Error('PRODUCT NOT FOUND'))

  const oldImage = product.image

  product.name = parsedBody.name
  product.price = parsedBody.price
  product.description = parsedBody.description
  product.category = parsedBody.category
  product.sell = parsedBody.sell

  if (req.file) {
    product.image = req.file.filename
  }

  await product.save()

  if (req.file && oldImage !== product.image) {
    await cloudinary.uploader.destroy(oldImage)
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: '',
    result: product,
  })
}

export const getAll = async (req: Request, res: Response) => {
  const result = await Product.find()

  res.status(StatusCodes.OK).json({
    success: true,
    message: '',
    result,
  })
}

export const get = async (req: Request, res: Response) => {
  const result = await Product.find({ sell: true })

  res.status(StatusCodes.OK).json({
    success: true,
    message: '',
    result,
  })
}

export const getId = async (req: Request, res: Response) => {
  const parsedParams = await paramsSchema.validate(req.params, {
    stripUnknown: true,
  })

  const result = await Product.findOne({
    _id: parsedParams.id,
    sell: true,
  }).orFail(new Error('PRODUCT NOT FOUND'))

  res.status(StatusCodes.OK).json({
    success: true,
    message: '',
    result,
  })
}

export const getAdminId = async (req: Request, res: Response) => {
  const parsedParams = await paramsSchema.validate(req.params, {
    stripUnknown: true,
  })

  const result = await Product.findById(parsedParams.id).orFail(new Error('PRODUCT NOT FOUND'))

  res.status(StatusCodes.OK).json({
    success: true,
    message: '',
    result,
  })
}
