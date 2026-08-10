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

const STALE_TIME = 1000 * 60 * 5

export const useCreateOrderMutation = defineMutation(() => {
  const user = useUserStore()
  const queryCache = useQueryCache()

  return useMutation({
    mutation: async () => {
      const { data } = await orderService.createOrder()

      return data.result
    },

    onSuccess: async () => {
      // Header 購物車數量歸零
      user.cart = 0

      // 重新取得購物車資料
      await Promise.all([
        queryCache.invalidateQueries({
          key: ['cart'],
        }),
        queryCache.invalidateQueries({
          key: ['order'],
        }),
      ])
    },
  })
})

export const useMyOrdersQuery = defineQuery(() => {
  return useQuery({
    key: ['order', 'mine'],

    query: async () => {
      const { data } = await orderService.getMyOrders()

      return data.result
    },

    staleTime: STALE_TIME,
  })
})

export const useAdminOrdersQuery = defineQuery(() => {
  return useQuery({
    key: ['order', 'admin'],

    query: async () => {
      const { data } = await orderService.getAdminOrders()

      return data.result
    },

    staleTime: STALE_TIME,
  })
})

export const useUpdateOrderStatusMutation =
  defineMutation(() => {
    const queryCache = useQueryCache()

    return useMutation({
      mutation: async ({
        id,
        status,
      }: {
        id: string
        status: OrderStatus
      }) => {
        const { data } =
          await orderService.updateOrderStatus(
            id,
            status,
          )

        return data.result
      },

      onSuccess: async () => {
        await queryCache.invalidateQueries({
          key: ['order'],
        })
      },
    })
  })

