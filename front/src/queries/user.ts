import type { CartForm } from '@/types/user'
import { defineMutation, defineQuery, useMutation, useQuery, useQueryCache } from '@pinia/colada'
import * as user from '@/services/user'
import { useUserStore } from '@/stores/user'

// 快取保留時間 5 分鐘
const STALE_TIME = 1000 * 60 * 5

export const useAddCartMutation = defineMutation(() => {
  return useMutation({
    mutation: (data: CartForm) => user.addCart(data),
    onSuccess: response => {
      // 更新導覽列顯示的購物車數量
      const user = useUserStore()
      user.cart = response.data.result
      // 將指定的快取標記為過期，會重新取得資料
      const queryCache = useQueryCache()
      queryCache.invalidateQueries({ key: ['cart'] })
    },
  })
})

export const useGetCartQuery = defineQuery(() => {
  return useQuery({
    // key 定義快取資料名稱
    key: ['cart'],
    // 查詢方式
    query: async () => {
      const { data } = await user.getCart()
      return data.result
    },
    // 快取保留時間
    staleTime: STALE_TIME,
  })
})
