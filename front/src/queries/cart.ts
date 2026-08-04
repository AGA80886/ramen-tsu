import type { CartForm } from '@/types/cart'

import {
  defineMutation,
  defineQuery,
  useMutation,
  useQuery,
  useQueryCache,
} from '@pinia/colada'

import * as cartService from '@/services/cart'
import { useUserStore } from '@/stores/user'

const STALE_TIME = 1000 * 60 * 5

export const useAddCartItemMutation = defineMutation(() => {
  const user = useUserStore()
  const queryCache = useQueryCache()

  return useMutation({
    mutation: (data: CartForm) =>
      cartService.addCartItem(data),

    onSuccess: response => {
      user.cart = response.data.result

      queryCache.invalidateQueries({
        key: ['cart'],
      })
    },
  })
})

export const useCartItemsQuery = defineQuery(() => {
  return useQuery({
    key: ['cart'],

    query: async () => {
      const { data } = await cartService.getCartItems()

      return data.result
    },

    staleTime: STALE_TIME,
  })
})
