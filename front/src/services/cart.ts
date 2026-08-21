import type { AxiosResponse } from 'axios'
import type { ApiResponse } from '@/types/api'
import type { CartForm, ICartItem } from '@/types/cart'
import { apiAuth } from '@/services/api'

export function addCartItem(
  data: CartForm,
): Promise<AxiosResponse<ApiResponse<number>>> {
  return apiAuth.patch('/user/cart', data)
}

export function getCartItems():
Promise<AxiosResponse<ApiResponse<ICartItem[]>>> {
  return apiAuth.get('/user/cart')
}
