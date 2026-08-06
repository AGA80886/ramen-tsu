import { Schema, model, type HydratedDocument, Types } from 'mongoose'

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled'

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded'

export interface IOrderItem {
  product: Types.ObjectId
  name: string
  image: string
  price: number
  quantity: number
  subtotal: number
}

export interface IOrder {
  _id: Types.ObjectId
  user: Types.ObjectId
  items: IOrderItem[]
  totalPrice: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  createdAt: Date
  updatedAt: Date
}

export type OrderDocument = HydratedDocument<IOrder>

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'products',
      required: [true, '商品必填'],
    },

    name: {
      type: String,
      required: [true, '商品名稱必填'],
      trim: true,
    },

    image: {
      type: String,
      required: [true, '商品圖片必填'],
    },

    price: {
      type: Number,
      required: [true, '商品價格必填'],
      min: [0, '商品價格錯誤'],
    },

    quantity: {
      type: Number,
      required: [true, '數量必填'],
      min: [1, '數量最少是 1'],
    },

    subtotal: {
      type: Number,
      required: [true, '商品小計必填'],
      min: [0, '商品小計錯誤'],
    },
  },
  {
    _id: false,
  },
)

const schema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: [true, '使用者必填'],
      index: true,
    },

    items: {
      type: [orderItemSchema],
      required: [true, '訂單商品必填'],
      validate: {
        validator: (items: IOrderItem[]): boolean => items.length > 0,
        message: '訂單至少需要一項商品',
      },
    },

    totalPrice: {
      type: Number,
      required: [true, '訂單總金額必填'],
      min: [0, '訂單總金額錯誤'],
    },

    status: {
      type: String,
      enum: {
        values: ['pending', 'processing', 'shipped', 'completed', 'cancelled'],
        message: '訂單狀態錯誤',
      },
      default: 'pending',
    },

    paymentStatus: {
      type: String,
      enum: {
        values: ['unpaid', 'paid', 'refunded'],
        message: '付款狀態錯誤',
      },
      default: 'unpaid',
    },
  },
  {
    timestamps: true,
  },
)

schema.index({
  user: 1,
  createdAt: -1,
})

export default model<IOrder>('orders', schema)
