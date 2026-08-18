export const productCategoryOptions = [
  '泡麵／即食麵',
  '拉麵食材',
  '餐具',
  '周邊商品',
  '其他',
] as const

export type TCategoryOptions = (typeof productCategoryOptions)[number]

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
