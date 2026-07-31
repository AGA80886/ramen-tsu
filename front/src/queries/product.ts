import type { ProductForm } from '@/types/product'
import { defineMutation, defineQuery, useMutation, useQuery, useQueryCache } from '@pinia/colada'
import { useRoute } from 'vue-router'
import * as product from '@/services/product'

// 快取保留時間 5 分鐘
const STALE_TIME = 1000 * 60 * 5

export const useGetQuery = defineQuery(() => {
  return useQuery({
    // key 定義快取資料名稱
    key: ['product', 'public'],
    // 查詢方式
    query: async () => {
      const { data } = await product.get()
      return data.result
    },
    // 快取保留時間
    staleTime: STALE_TIME,
  })
})

export const useGetAllQuery = defineQuery(() => {
  return useQuery({
    // key 定義快取資料名稱
    key: ['product', 'all'],
    // 查詢方式
    query: async () => {
      const { data } = await product.getAll()
      return data.result
    },
    // 快取保留時間
    staleTime: STALE_TIME,
  })
})

export const useGetIdQuery = defineQuery(() => {
  const route = useRoute('/product/[id]')
  return useQuery({
    // key 定義快取資料名稱
    // 寫成 function 動態偵測 id 變更時更新資料
    key: () => ['product', route.params.id],
    // 查詢方式
    query: async () => {
      const { data } = await product.getId(route.params.id)
      return data.result
    },
    // 快取保留時間
    staleTime: STALE_TIME,
  })
})

export const useCreateMutation = defineMutation(() => {
  return useMutation({
    mutation: (data: ProductForm) => product.create(data),
    onSuccess: () => {
      // 將指定的快取標記為過期，會重新取得資料
      const queryCache = useQueryCache()
      queryCache.invalidateQueries({ key: ['product', 'public'] })
      queryCache.invalidateQueries({ key: ['product', 'all'] })
    },
  })
})

export const useUpdateMutation = defineMutation(() => {
  return useMutation({
    mutation: ({ id, data }: { id: string, data: ProductForm }) => product.update(id, data),
    onSuccess: (response, { id }) => {
      // 將指定的快取標記為過期，會重新取得資料
      const queryCache = useQueryCache()
      queryCache.invalidateQueries({ key: ['product', 'public'] })
      queryCache.invalidateQueries({ key: ['product', 'all'] })
      // 更新指定快取的資料
      queryCache.setQueryData(['product', id], response.data.result)
    },
  })
})
