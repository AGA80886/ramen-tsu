import type { ApiResponse } from '@/types/api'
import type { CartForm, ICartItem } from '@/types/user'
import type { AxiosResponse } from 'axios'
import { apiAuth } from '@/utils/api'

export function addCart (data: CartForm): Promise<AxiosResponse<ApiResponse<number>>> {
  return apiAuth.patch('/user/cart', data)
}

export function getCart (): Promise<AxiosResponse<ApiResponse<ICartItem[]>>> {
  return apiAuth.get('/user/cart')
}
