import { Schema, model, type HydratedDocument, Types } from 'mongoose'

export type TShopStatus = 'draft' | 'pending' | 'approved' | 'rejected'

export interface IShopLocation {
  type: 'Point'
  coordinates: [number, number]
}

export interface IShop {
  name: string
  slug: string

  description: string

  address: string
  city: string
  district: string

  phone?: string
  website?: string

  openingHours?: string

  coverImage?: string
  images: string[]

  status: TShopStatus

  createdBy: Types.ObjectId

  createdAt: Date
  updatedAt: Date

  location?: IShopLocation
}

export type ShopDocument = HydratedDocument<IShop>

const schema = new Schema<IShop>(
  {
    name: {
      type: String,
      required: [true, '店家名稱必填'],
      trim: true,
      maxlength: [100, '店家名稱最多 100 個字'],
    },

    slug: {
      type: String,
      required: [true, '店家 slug 必填'],
      trim: true,
      lowercase: true,
      unique: true,
    },

    description: {
      type: String,
      required: [true, '店家介紹必填'],
      trim: true,
      maxlength: [5000, '店家介紹最多 5000 個字'],
    },

    address: {
      type: String,
      required: [true, '店家地址必填'],
      trim: true,
    },

    city: {
      type: String,
      required: [true, '縣市必填'],
      trim: true,
      index: true,
    },

    district: {
      type: String,
      required: [true, '行政區必填'],
      trim: true,
      index: true,
    },

    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: undefined,
      },

      coordinates: {
        type: [Number],
        default: undefined,

        validate: {
          validator: (value?: number[]) => {
            if (!value) {
              return true
            }

            if (value.length !== 2) {
              return false
            }

            const [longitude, latitude] = value

            if (longitude === undefined || latitude === undefined) {
              return false
            }

            return longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90
          },

          message: '店家座標格式錯誤',
        },
      },
    },

    phone: {
      type: String,
      trim: true,
      default: '',
    },

    website: {
      type: String,
      trim: true,
      default: '',
    },

    openingHours: {
      type: String,
      trim: true,
      default: '',
    },

    coverImage: {
      type: String,
      trim: true,
      default: '',
    },

    images: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: {
        values: ['draft', 'pending', 'approved', 'rejected'],
        message: '店家狀態錯誤',
      },
      default: 'draft',
      index: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: [true, '建立者必填'],
      index: true,
    },
  },
  {
    timestamps: true,
  },
)

// 公開店家列表
schema.index({
  status: 1,
  createdAt: -1,
})

// 依地區查詢
schema.index({
  city: 1,
  district: 1,
  status: 1,
})

// 店名搜尋 / 排序的基礎 index
schema.index({
  name: 1,
})

// Admin / 建立者管理自己的店家
schema.index({
  createdBy: 1,
  createdAt: -1,
})

schema.index({
  location: '2dsphere',
})

export default model<IShop>('shops', schema)
