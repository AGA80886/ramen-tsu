export type TCategoryOptions = '3C' | '食品' | '衣服'

export interface IProduct {
  _id: string
  name: string
  price: number
  description: string
  category: TCategoryOptions
  sell: boolean
  image: string
  imageUrl: string
  createdAt: string
  updatedAt: string
}

export interface ProductForm {
  name: string
  price: number
  description: string
  category: TCategoryOptions
  sell: boolean
  image?: File
}
