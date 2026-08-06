import type { IProduct } from './product'

export interface CartForm {
  product: string
  quantity: number
  replace: boolean
}

export interface ICartItem {
  _id: string
  product: IProduct | null
  quantity: number
}

export type ValidCartItem = ICartItem & {
  product: IProduct
}
