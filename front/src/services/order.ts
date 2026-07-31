import type { ApiResponse } from '@/types/api'
import type { IOrder } from '@/types/order'
import type { AxiosResponse } from 'axios'
import { apiAuth } from '@/utils/api'

export function create (): Promise<AxiosResponse<ApiResponse<IOrder>>> {
  return apiAuth.post('/order')
}

export function get (): Promise<AxiosResponse<ApiResponse<IOrder[]>>> {
  return apiAuth.get('/order')
}

export function getAll (): Promise<AxiosResponse<ApiResponse<IOrder[]>>> {
  return apiAuth.get('/order/all')
}
