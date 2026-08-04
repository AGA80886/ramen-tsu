import {
  defineMutation,
  defineQuery,
  useMutation,
  useQuery,
  useQueryCache,
} from '@pinia/colada'

import * as orderService from '@/services/order'
import { useUserStore } from '@/stores/user'

const STALE_TIME = 1000 * 60 * 5

export const useCreateOrderMutation = defineMutation(() => {
  const user = useUserStore()
  const queryCache = useQueryCache()

  return useMutation({
    mutation: () => orderService.createOrder(),

    onSuccess: () => {
      user.cart = 0

      queryCache.invalidateQueries({
        key: ['order'],
      })
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
