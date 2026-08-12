import { Schema, model, type HydratedDocument, Types } from 'mongoose'

export interface IArticleLike {
  article: Types.ObjectId
  user: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

export type ArticleLikeDocument = HydratedDocument<IArticleLike>

const schema = new Schema<IArticleLike>(
  {
    article: {
      type: Schema.Types.ObjectId,
      ref: 'articles',
      required: [true, '按讚文章必填'],
      index: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: [true, '按讚會員必填'],
      index: true,
    },
  },
  {
    timestamps: true,
  },
)

// 同一會員對同一篇文章只能按一次讚
schema.index(
  {
    article: 1,
    user: 1,
  },
  {
    unique: true,
  },
)

// 取得文章按讚數時使用
schema.index({
  article: 1,
  createdAt: -1,
})

// 未來若要做「我按讚過的文章」可直接利用
schema.index({
  user: 1,
  createdAt: -1,
})

export default model<IArticleLike>('articleLikes', schema)
