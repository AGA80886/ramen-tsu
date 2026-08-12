import { Schema, model, type HydratedDocument, Types } from 'mongoose'

export interface IArticleComment {
  article: Types.ObjectId
  author: Types.ObjectId
  content: string
  createdAt: Date
  updatedAt: Date
}

export type ArticleCommentDocument = HydratedDocument<IArticleComment>

const schema = new Schema<IArticleComment>(
  {
    article: {
      type: Schema.Types.ObjectId,
      ref: 'articles',
      required: [true, '留言所屬文章必填'],
      index: true,
    },

    author: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: [true, '留言作者必填'],
      index: true,
    },

    content: {
      type: String,
      required: [true, '留言內容必填'],
      trim: true,
      minlength: [1, '留言內容不可為空'],
      maxlength: [1000, '留言內容最多 1000 個字'],
    },
  },
  {
    timestamps: true,
  },
)

// 取得指定文章留言時，依時間排序會使用
schema.index({
  article: 1,
  createdAt: -1,
})

// 未來如果做「我的留言」可以直接利用
schema.index({
  author: 1,
  createdAt: -1,
})

export default model<IArticleComment>('articleComments', schema)
