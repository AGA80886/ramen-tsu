import type { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import Order, { type IOrderItem } from '../models/order'
import Product from '../models/product'

export const create = async (req: Request, res: Response): Promise<void> => {
  const cart = req.user!.cart

  // 1. 檢查購物車是否為空
  if (cart.length === 0) {
    throw new Error('CART EMPTY')
  }

  // 2. 取得購物車中所有商品 ID
  const productIds = cart.map((item) => item.product)

  // 3. 查詢商品資料
  const products = await Product.find({
    _id: {
      $in: productIds,
    },
  })

  // 4. 檢查商品是否全部存在
  if (products.length !== productIds.length) {
    throw new Error('CART PRODUCT NOT FOUND')
  }

  // 5. 建立訂單商品快照
  const items: IOrderItem[] = cart.map((cartItem) => {
    const product = products.find(
      (product) => product._id.toString() === cartItem.product.toString(),
    )

    if (!product) {
      throw new Error('CART PRODUCT NOT FOUND')
    }

    // sell === false 代表商品已下架
    if (!product.sell) {
      throw new Error('CART SELL')
    }

    const subtotal = product.price * cartItem.quantity

    return {
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: cartItem.quantity,
      subtotal,
    }
  })

  // 6. 計算訂單總金額
  const totalPrice = items.reduce((total, item) => total + item.subtotal, 0)

  // 7. 建立訂單
  const result = await Order.create({
    user: req.user!._id,
    items,
    totalPrice,
    status: 'pending',
    paymentStatus: 'unpaid',
  })

  // 8. 建立成功後清空購物車
  req.user!.cart = []

  await req.user!.save()

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: '訂單建立成功',
    result,
  })
}

export const get = async (req: Request, res: Response): Promise<void> => {
  const result = await Order.find(
    {
      user: req.user!._id,
    },
    '-user',
  ).sort({
    createdAt: -1,
  })

  res.status(StatusCodes.OK).json({
    success: true,
    message: '',
    result,
  })
}

export const getAll = async (req: Request, res: Response): Promise<void> => {
  const result = await Order.find().populate('user', 'account nickname email').sort({
    createdAt: -1,
  })

  res.status(StatusCodes.OK).json({
    success: true,
    message: '',
    result,
  })
}
