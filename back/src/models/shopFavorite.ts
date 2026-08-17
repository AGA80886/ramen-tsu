import { Schema, model, type HydratedDocument, type Types } from 'mongoose'

export interface IShopFavorite {
  shop: Types.ObjectId
  user: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

export type ShopFavoriteDocument = HydratedDocument<IShopFavorite>

const schema = new Schema<IShopFavorite>(
  {
    shop: {
      type: Schema.Types.ObjectId,
      ref: 'shops',
      required: [true, '收藏店家必填'],
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
  user: 1,
  createdAt: -1,
})

schema.index({
  shop: 1,
  createdAt: -1,
})

export default model<IShopFavorite>('shopFavorites', schema)
