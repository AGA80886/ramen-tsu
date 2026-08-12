import {
  defineMutation,
  defineQuery,
  useMutation,
  useQuery,
  useQueryCache,
} from '@pinia/colada'

import * as articleService from '@/services/article'
import { useUserStore } from '@/stores/user'
import type {
  ICreateArticle,
  IUpdateArticle,
  TArticleStatus,
} from '@/types/article'

const STALE_TIME = 1000 * 60 * 5

export const articleKeys = {
  all: ['article'] as const,

  public: () =>
    [
      ...articleKeys.all,
      'public',
    ] as const,

  admin: () =>
    [
      ...articleKeys.all,
      'admin',
    ] as const,

  mine: (userKey: string) =>
    [
      ...articleKeys.all,
      'mine',
      userKey,
    ] as const,
}

// 公開文章列表
export const useArticlesQuery = defineQuery(() => {
  return useQuery({
    key: articleKeys.public(),

    query: async () => {
      const { data } =
        await articleService.getArticles()

      return data.result
    },

    staleTime: STALE_TIME,
  })
})

// Admin：全部文章
export const useAdminArticlesQuery = defineQuery(() => {
  return useQuery({
    key: articleKeys.admin(),

    query: async () => {
      const { data } =
        await articleService.getAdminArticles()

      return data.result
    },

    staleTime: STALE_TIME,
  })
})

// Admin：建立文章
export const useCreateArticleMutation =
  defineMutation(() => {
    const queryCache = useQueryCache()

    return useMutation({
      mutation: async (
        data: ICreateArticle,
      ) => {
        const { data: response } =
          await articleService.createArticle(data)

        return response.result
      },

      onSuccess: async () => {
        await queryCache.invalidateQueries({
          key: ['article'],
        })
      },
    })
  })

// Admin：修改文章
export const useUpdateArticleMutation =
  defineMutation(() => {
    const queryCache = useQueryCache()

    return useMutation({
      mutation: async ({
        id,
        data,
      }: {
        id: string
        data: IUpdateArticle
      }) => {
        const { data: response } =
          await articleService.updateArticle(
            id,
            data,
          )

        return response.result
      },

      onSuccess: async () => {
        await queryCache.invalidateQueries({
          key: ['article'],
        })
      },
    })
  })

// Admin：刪除文章
export const useDeleteArticleMutation =
  defineMutation(() => {
    const queryCache = useQueryCache()

    return useMutation({
      mutation: async (
        id: string,
      ) => {
        const { data } =
          await articleService.deleteArticle(id)

        return data
      },

      onSuccess: async () => {
        await queryCache.invalidateQueries({
          key: ['article'],
        })
      },
    })
  })

export const useUpdateArticleStatusMutation =
  defineMutation(() => {
    const queryCache = useQueryCache()

    return useMutation({
      mutation: async ({
        id,
        status,
      }: {
        id: string
        status: Extract<
          TArticleStatus,
          'approved' | 'rejected'
        >
      }) => {
        const { data } =
          await articleService.updateArticleStatus(
            id,
            status,
          )

        return data.result
      },

      onSuccess: async () => {
        await queryCache.invalidateQueries({
          key: ['article'],
        })
      },
    })
  })

export const useMyArticlesQuery =
  defineQuery(() => {
    const user = useUserStore()

    return useQuery({
      key: () =>
        articleKeys.mine(
          user.account,
        ),

      query: async () => {
        const { data } =
          await articleService
            .getMyArticles()

        return data.result
      },

      enabled: () =>
        user.isLoggedIn &&
        Boolean(user.account),

      staleTime: STALE_TIME,
    })
  })
