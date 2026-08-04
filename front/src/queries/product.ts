import type { ProductForm } from '@/types/product'

import {
  defineMutation,
  defineQuery,
  useMutation,
  useQuery,
  useQueryCache,
} from '@pinia/colada'
import { useRoute } from 'vue-router'

import * as productService from '@/services/product'

const STALE_TIME = 1000 * 60 * 5

export const useProductsQuery = defineQuery(() => {
  return useQuery({
    key: ['product', 'public'],

    query: async () => {
      const { data } = await productService.getProducts()

      return data.result
    },

    staleTime: STALE_TIME,
  })
})

export const useAdminProductsQuery = defineQuery(() => {
  return useQuery({
    key: ['product', 'admin'],

    query: async () => {
      const { data } =
        await productService.getAdminProducts()

      return data.result
    },

    staleTime: STALE_TIME,
  })
})

export const useProductByIdQuery = defineQuery(() => {
  const route = useRoute('/product/[id]')

  return useQuery({
    key: () => [
      'product',
      'detail',
      route.params.id,
    ],

    query: async () => {
      const { data } =
        await productService.getProductById(
          route.params.id,
        )

      return data.result
    },

    staleTime: STALE_TIME,
  })
})

export const useCreateProductMutation = defineMutation(() => {
  const queryCache = useQueryCache()

  return useMutation({
    mutation: (data: ProductForm) =>
      productService.createProduct(data),

    onSuccess: () => {
      queryCache.invalidateQueries({
        key: ['product', 'public'],
      })

      queryCache.invalidateQueries({
        key: ['product', 'admin'],
      })
    },
  })
})

export const useUpdateProductMutation = defineMutation(() => {
  const queryCache = useQueryCache()

  return useMutation({
    mutation: ({
      id,
      data,
    }: {
      id: string
      data: ProductForm
    }) => productService.updateProduct(id, data),

    onSuccess: (response, { id }) => {
      queryCache.invalidateQueries({
        key: ['product', 'public'],
      })

      queryCache.invalidateQueries({
        key: ['product', 'admin'],
      })

      queryCache.setQueryData(
        ['product', 'detail', id],
        response.data.result,
      )
    },
  })
})
