import { defineMutation, defineQuery, useMutation, useQuery, useQueryCache } from '@pinia/colada'
import * as order from '@/services/order'
import { useUserStore } from '@/stores/user'

// 快取保留時間 5 分鐘
const STALE_TIME = 1000 * 60 * 5

export const useCreateMutation = defineMutation(() => {
  return useMutation({
    mutation: () => order.create(),
    onSuccess: () => {
      // 更新導覽列顯示的購物車數量
      const user = useUserStore()
      user.cart = 0
      // 將指定的快取標記為過期，會重新取得資料
      const queryCache = useQueryCache()
      queryCache.invalidateQueries({ key: ['order'] })
    },
  })
})

export const useGetQuery = defineQuery(() => {
  return useQuery({
    // key 定義快取資料名稱
    key: ['order'],
    // 查詢方式
    query: async () => {
      const { data } = await order.get()
      return data.result
    },
    // 快取保留時間
    staleTime: STALE_TIME,
  })
})

export const useGetAllQuery = defineQuery(() => {
  return useQuery({
    // key 定義快取資料名稱
    key: ['order'],
    // 查詢方式
    query: async () => {
      const { data } = await order.getAll()
      return data.result
    },
    // 快取保留時間
    staleTime: STALE_TIME,
  })
})
