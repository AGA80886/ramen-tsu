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

export const cartKeys = {
  all: ['cart'] as const,

  mine: (
    userKey: string,
  ) =>
    [
      ...cartKeys.all,
      'mine',
      userKey,
    ] as const,
}

export const useAddCartItemMutation =
  defineMutation(() => {
    const user = useUserStore()
    const queryCache =
      useQueryCache()

    return useMutation({
      mutation: (
        data: CartForm,
      ) =>
        cartService
          .addCartItem(data),

      onSuccess: async response => {
        // Header 購物車數量同步
        user.cart =
          response.data.result

        // 只更新目前會員自己的購物車
        await queryCache
          .invalidateQueries({
            key:
              cartKeys.mine(
                user.account,
              ),
          })
      },
    })
  })

export const useCartItemsQuery =
  defineQuery(() => {
    const user = useUserStore()

    return useQuery({
      key: () =>
        cartKeys.mine(
          user.account,
        ),

      query: async () => {
        const { data } =
          await cartService
            .getCartItems()

        return data.result
      },

      enabled: () =>
        user.isLoggedIn &&
        Boolean(user.account),

      staleTime: STALE_TIME,
    })
  })
