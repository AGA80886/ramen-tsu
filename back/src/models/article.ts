import { Schema, model, type HydratedDocument, Types } from 'mongoose'

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

export interface IArticle {
  title: string
  slug: string
  summary: string
  content: string
  coverImage: string
  category: TArticleCategory
  published: boolean
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

    published: {
      type: Boolean,
      required: [true, '文章發布狀態必填'],
      default: false,
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
  },
)

schema.index({
  published: 1,
  createdAt: -1,
})

schema.index({
  category: 1,
  published: 1,
  createdAt: -1,
})

export default model<IArticle>('articles', schema)
