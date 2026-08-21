import {
  defineMutation,
  defineQuery,
  useMutation,
  useQuery,
  useQueryCache,
} from '@pinia/colada'

import * as orderService from '@/services/order'
import { useUserStore } from '@/stores/user'
import type { OrderStatus } from '@/types/order'
import { cartKeys, } from '@/queries/cart'

const STALE_TIME = 1000 * 60 * 5

export const orderKeys = {
  all: ['order'] as const,

  mine: (
    userKey: string,
  ) =>
    [
      ...orderKeys.all,
      'mine',
      userKey,
    ] as const,

  admin: () =>
    [
      ...orderKeys.all,
      'admin',
    ] as const,
}

export const useCreateOrderMutation =
  defineMutation(() => {
    const user = useUserStore()
    const queryCache =
      useQueryCache()

    return useMutation({
      mutation: async () => {
        const { data } =
          await orderService
            .createOrder()

        return data.result
      },

      onSuccess: async () => {
        // Header 購物車數量歸零
        user.cart = 0

        await Promise.all([
          // Cart 下一步再做 userKey 隔離
          queryCache.invalidateQueries({
            key:
              cartKeys.mine(
                user.account),
          }),

          // 目前會員的訂單
          queryCache.invalidateQueries({
            key:
              orderKeys.mine(
                user.account,
              ),
          }),

          // Admin 訂單列表
          queryCache.invalidateQueries({
            key:
              orderKeys.admin(),
          }),
        ])
      },
    })
  })

export const useMyOrdersQuery =
  defineQuery(() => {
    const user = useUserStore()

    return useQuery({
      key: () =>
        orderKeys.mine(
          user.account,
        ),

      query: async () => {
        const { data } =
          await orderService
            .getMyOrders()

        return data.result
      },

      enabled: () =>
        user.isLoggedIn &&
        Boolean(user.account),

      staleTime: STALE_TIME,
    })
  })

export const useAdminOrdersQuery =
  defineQuery(() => {
    return useQuery({
      key: orderKeys.admin(),

      query: async () => {
        const { data } =
          await orderService
            .getAdminOrders()

        return data.result
      },

      staleTime: STALE_TIME,
    })
  })

export const
  useUpdateOrderStatusMutation =
    defineMutation(() => {
      const queryCache =
        useQueryCache()

      return useMutation({
        mutation: async ({
          id,
          status,
        }: {
          id: string
          status: OrderStatus
        }) => {
          const { data } =
            await orderService
              .updateOrderStatus(
                id,
                status,
              )

          return data.result
        },

        onSuccess: async () => {
          await queryCache
            .invalidateQueries({
              key: orderKeys.all,
            })
        },
      })
    })
