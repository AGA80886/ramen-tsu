import type { ProductForm } from '@/types/products'

import {
  defineMutation,
  defineQuery,
  useMutation,
  useQuery,
  useQueryCache,
} from '@pinia/colada'

import * as productService from '@/services/products'

const STALE_TIME = 1000 * 60 * 5

export const productKeys = {
  root: ['product'] as const,

  public: () => [
    ...productKeys.root,
    'public',
  ] as const,

  publicList: () => [
    ...productKeys.public(),
    'list',
  ] as const,

  publicDetail: (id: string) => [
    ...productKeys.public(),
    'detail',
    id,
  ] as const,

  admin: () => [
    ...productKeys.root,
    'admin',
  ] as const,

  adminList: () => [
    ...productKeys.admin(),
    'list',
  ] as const,

  adminDetail: (id: string) => [
    ...productKeys.admin(),
    'detail',
    id,
  ] as const,
}

export const useProductsQuery = defineQuery(() => {
  return useQuery({
    key: productKeys.publicList(),

    query: async () => {
      const { data } = await productService.getProducts()

      return data.result
    },

    staleTime: STALE_TIME,
  })
})

export const useAdminProductsQuery = defineQuery(() => {
  return useQuery({
    key: productKeys.adminList(),

    query: async () => {
      const { data } =
        await productService.getAdminProducts()

      return data.result
    },

    staleTime: STALE_TIME,
  })
})

export const useProductByIdQuery = (
  productId: () => string,
) => {
  return useQuery({
    key: () =>
      productKeys.publicDetail(productId()),

    query: async () => {
      const { data } =
        await productService.getProductById(
          productId(),
        )

      return data.result
    },

    enabled: () => Boolean(productId()),

    staleTime: STALE_TIME,
  })
}

export const useAdminProductByIdQuery = (
  productId: () => string,
) => {
  return useQuery({
    key: () =>
      productKeys.adminDetail(productId()),

    query: async () => {
      const { data } =
        await productService.getAdminProductById(
          productId(),
        )

      return data.result
    },

    enabled: () => Boolean(productId()),

    staleTime: STALE_TIME,
  })
}

export const useCreateProductMutation = defineMutation(() => {
  const queryCache = useQueryCache()

  return useMutation({
    mutation: (data: ProductForm) =>
      productService.createProduct(data),

    onSuccess: async () => {
      await queryCache.invalidateQueries({
        key: productKeys.root,
      })
    },
  })
})

export const useUpdateProductMutation =
  defineMutation(() => {
    const queryCache = useQueryCache()

    return useMutation({
      mutation: ({
        id,
        data,
      }: {
        id: string
        data: ProductForm
      }) =>
        productService.updateProduct(
          id,
          data,
        ),

      onSuccess: async (
        response,
        { id },
      ) => {
        queryCache.setQueryData(
          productKeys.adminDetail(id),
          response.data.result,
        )

        await Promise.all([
          queryCache.invalidateQueries({
            key: productKeys.root,
          }),

          queryCache.invalidateQueries({
            key: ['cart'],
          }),
        ])
      },
    })
  })

export const useDeleteProductMutation =
  defineMutation(() => {
    const queryCache = useQueryCache()

    return useMutation({
      mutation: (id: string) =>
        productService.deleteProduct(id),

      onSuccess: async () => {
        await Promise.all([
          queryCache.invalidateQueries({
            key: productKeys.root,
          }),

          queryCache.invalidateQueries({
            key: ['cart'],
          }),
        ])
      },
    })
  })
