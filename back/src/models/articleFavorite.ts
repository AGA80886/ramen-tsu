import { Schema, model, type HydratedDocument, Types } from 'mongoose'

export interface IArticleFavorite {
  article: Types.ObjectId
  user: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

export type ArticleFavoriteDocument = HydratedDocument<IArticleFavorite>

const schema = new Schema<IArticleFavorite>(
  {
    article: {
      type: Schema.Types.ObjectId,
      ref: 'articles',
      required: [true, '收藏文章必填'],
      index: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: [true, '收藏會員必填'],
      index: true,
    },
  },
  {
    timestamps: true,
  },
)

// 同一會員對同一篇文章只能收藏一次
schema.index(
  {
    article: 1,
    user: 1,
  },
  {
    unique: true,
  },
)

// 我的收藏列表
schema.index({
  user: 1,
  createdAt: -1,
})

export default model<IArticleFavorite>('articleFavorites', schema)
