import { Schema, model, type HydratedDocument, Types } from 'mongoose'
import cloudinary from '../configs/cloudinary'

export const articleCategoryOptions = [
  '公告',
  '拉麵科普',
  '食記分享',
  '最新情報',
  '議題討論',
  '即食拉麵',
  '其他',
] as const

export type TArticleCategory = (typeof articleCategoryOptions)[number]

// 文章狀態
export const articleStatusOptions = ['draft', 'pending', 'approved', 'rejected'] as const

export type TArticleStatus = (typeof articleStatusOptions)[number]

export interface IArticle {
  title: string
  slug: string
  summary: string
  content: string
  coverImage: string
  category: TArticleCategory
  status: TArticleStatus
  author: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

export type ArticleDocument = HydratedDocument<IArticle>

const schema = new Schema<IArticle>(
  {
    title: {
      type: String,
      required: [true, '文章標題必填'],
      trim: true,
      maxlength: [100, '文章標題最多 100 個字'],
    },

    slug: {
      type: String,
      required: [true, '文章網址必填'],
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },

    summary: {
      type: String,
      required: [true, '文章摘要必填'],
      trim: true,
      maxlength: [300, '文章摘要最多 300 個字'],
    },

    content: {
      type: String,
      required: [true, '文章內容必填'],
    },

    coverImage: {
      type: String,
      required: [true, '文章封面圖片必填'],
    },

    category: {
      type: String,
      required: [true, '文章分類必填'],
      enum: {
        values: articleCategoryOptions,
        message: '文章分類錯誤',
      },
    },

    status: {
      type: String,
      required: [true, '文章狀態必填'],
      enum: {
        values: articleStatusOptions,
        message: '文章狀態錯誤',
      },
      default: 'draft',
      index: true,
    },

    author: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: [true, '文章作者必填'],
      index: true,
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

schema.virtual('coverImageUrl').get(function () {
  return cloudinary.url(this.coverImage)
})

schema.index({
  status: 1,
  createdAt: -1,
})

schema.index({
  category: 1,
  status: 1,
  createdAt: -1,
})

schema.index({
  author: 1,
  status: 1,
  createdAt: -1,
})

export default model<IArticle>('articles', schema)
