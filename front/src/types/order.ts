export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'completed'
  | 'cancelled'

export type PaymentStatus =
  | 'unpaid'
  | 'paid'
  | 'refunded'

export interface IOrderItem {
  product: string
  name: string
  image: string
  price: number
  quantity: number
  subtotal: number
  imageUrl?: string
}

export interface IOrderUser {
  _id: string
  account: string
  nickname?: string
  email?: string
}

export interface IOrder {
  _id: string
  user?: string | IOrderUser
  items: IOrderItem[]
  totalPrice: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  createdAt: string
  updatedAt: string
}
