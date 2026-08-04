import type { ICartItem } from './cart'

export interface IOrder {
  _id: string
  user?: {
    _id: string
    account: string
  }
  cart: ICartItem[]
  createdAt: string
  updatedAt: string
}
