import { Schema, model, type HydratedDocument, type Types } from 'mongoose'

export interface IShopLike {
  shop: Types.ObjectId
  user: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

export type ShopLikeDocument = HydratedDocument<IShopLike>

const schema = new Schema<IShopLike>(
  {
    shop: {
      type: Schema.Types.ObjectId,
      ref: 'shops',
      required: [true, '按讚店家必填'],
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

schema.index(
  {
    shop: 1,
    user: 1,
  },
  {
    unique: true,
  },
)

schema.index({
  shop: 1,
  createdAt: -1,
})

schema.index({
  user: 1,
  createdAt: -1,
})

export default model<IShopLike>('shopLikes', schema)
