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

        // 讓目前會員的購物車 Query 立即失效並重新取得最新資料
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
    const user =
      useUserStore()

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
        user.isLoggedIn
        && Boolean(
          user.account,
        ),

      // 購物車屬於高頻變動資料，不保留 stale cache
      staleTime: 0,
    })
  })
