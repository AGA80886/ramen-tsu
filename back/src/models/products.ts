import { Schema, model, type HydratedDocument } from 'mongoose'
import cloudinary from '../configs/cloudinary'

export const categoryOptions = ['泡麵／即食麵', '拉麵食材', '餐具', '周邊商品', '其他'] as const

export type TCategoryOptions = (typeof categoryOptions)[number]

export interface IProduct {
  name: string
  price: number
  description: string
  category: TCategoryOptions
  sell: boolean
  image: string
}

export type ProductDocument = HydratedDocument<IProduct>

const schema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, '名稱必填'],
      trim: true,
      maxlength: [100, '商品名稱過長'],
    },

    price: {
      type: Number,
      required: [true, '價格必填'],
      min: [0, '價格錯誤'],
      validate: {
        validator: Number.isInteger,
        message: '價格必須為整數',
      },
    },

    description: {
      type: String,
      required: [true, '說明必填'],
      trim: true,
    },

    category: {
      type: String,
      required: [true, '分類必填'],
      enum: {
        values: categoryOptions,
        message: '分類錯誤',
      },
    },

    sell: {
      type: Boolean,
      required: [true, '上下架必填'],
      default: false,
    },

    image: {
      type: String,
      required: [true, '圖片必填'],
    },
  },
  {
    timestamps: true,

    toJSON: {
      virtuals: true,
    },

    toObject: {
      virtuals: true,
    },

    id: false,
  },
)

schema.virtual('imageUrl').get(function () {
  return cloudinary.url(this.image)
})

export default model('products', schema)
