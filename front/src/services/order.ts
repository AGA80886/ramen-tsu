import type { AxiosResponse } from 'axios'

import type { ApiResponse } from '@/types/api'
import type { IOrder } from '@/types/order'

import { apiAuth } from './api'

export function createOrder():
Promise<AxiosResponse<ApiResponse<IOrder>>> {
  return apiAuth.post('/order')
}

export function getMyOrders():
Promise<AxiosResponse<ApiResponse<IOrder[]>>> {
  return apiAuth.get('/order')
}

export function getAdminOrders():
Promise<AxiosResponse<ApiResponse<IOrder[]>>> {
  return apiAuth.get('/order/all')
}
