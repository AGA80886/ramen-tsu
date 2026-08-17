import {
  defineMutation,
  defineQuery,
  useMutation,
  useQuery,
  useQueryCache,
} from '@pinia/colada'

import { useUserStore } from '@/stores/user'

import * as shopReactionService
  from '@/services/shopReaction'

const STALE_TIME =
  1000 * 60 * 5

export const shopReactionKeys = {
  root: [
    'shop-reactions',
  ] as const,

  likeCount: (
    shopId: string,
  ) => [
    ...shopReactionKeys.root,
    'like-count',
    shopId,
  ] as const,

  likeStatus: (
    shopId: string,
    userKey: string,
  ) => [
    ...shopReactionKeys.root,
    'like-status',
    shopId,
    userKey,
  ] as const,

  favoriteStatus: (
    shopId: string,
    userKey: string,
  ) => [
    ...shopReactionKeys.root,
    'favorite-status',
    shopId,
    userKey,
  ] as const,

  favorites: (
    userKey: string,
  ) => [
    ...shopReactionKeys.root,
    'favorites',
    userKey,
  ] as const,
}

/**
 * Public
 *
 * 取得店家按讚數
 */
export const useShopLikeCountQuery =
  (
    shopId: () => string,
  ) => {
    return useQuery({
      key: () =>
        shopReactionKeys
          .likeCount(
            shopId(),
          ),

      query: async () => {
        const { data } =
          await shopReactionService
            .getShopLikeCount(
              shopId(),
            )

        return data.result
      },

      enabled: () =>
        Boolean(shopId()),

      staleTime: STALE_TIME,
    })
  }

/**
 * Login required
 *
 * 取得目前會員是否已對店家按讚
 */
export const useMyShopLikeStatusQuery =
  (
    shopId: () => string,
  ) => {
    const user =
      useUserStore()

    return useQuery({
      key: () =>
        shopReactionKeys
          .likeStatus(
            shopId(),
            user.account || '',
          ),

      query: async () => {
        const { data } =
          await shopReactionService
            .getMyShopLikeStatus(
              shopId(),
            )

        return data.result
      },

      enabled: () =>
        Boolean(shopId()) &&
        user.isLoggedIn,

      staleTime: STALE_TIME,
    })
  }

/**
 * Login required
 *
 * 取得目前會員是否已收藏店家
 */
export const useMyShopFavoriteStatusQuery =
  (
    shopId: () => string,
  ) => {
    const user =
      useUserStore()

    return useQuery({
      key: () =>
        shopReactionKeys
          .favoriteStatus(
            shopId(),
            user.account || '',
          ),

      query: async () => {
        const { data } =
          await shopReactionService
            .getMyShopFavoriteStatus(
              shopId(),
            )

        return data.result
      },

      enabled: () =>
        Boolean(shopId()) &&
        user.isLoggedIn,

      staleTime: STALE_TIME,
    })
  }

/**
 * Login required
 *
 * 取得目前會員收藏的店家
 */
export const useMyShopFavoritesQuery =
  defineQuery(() => {
    const user =
      useUserStore()

    return useQuery({
      key: () =>
        shopReactionKeys
          .favorites(
            user.account || '',
          ),

      query: async () => {
        const { data } =
          await shopReactionService
            .getMyShopFavorites()

        return data.result
      },

      enabled: () =>
        Boolean(user.account) &&
        user.isLoggedIn,

      staleTime: STALE_TIME,
    })
  })

/**
 * 按讚店家
 */
export const useAddShopLikeMutation =
  defineMutation(() => {
    const queryCache =
      useQueryCache()

    const user =
      useUserStore()

    return useMutation({
      mutation: async (
        shopId: string,
      ) => {
        const { data } =
          await shopReactionService
            .addShopLike(
              shopId,
            )

        return {
          shopId,
          result:
            data.result,
        }
      },

      onSuccess: async ({
        shopId,
        result,
      }) => {
        queryCache.setQueryData(
          shopReactionKeys
            .likeCount(shopId),
          {
            count:
              result.count,
          },
        )

        queryCache.setQueryData(
          shopReactionKeys
            .likeStatus(
              shopId,
              user.account || '',
            ),
          {
            liked: true,
          },
        )

        await queryCache
          .invalidateQueries({
            key:
              shopReactionKeys
                .root,
          })
      },
    })
  })

/**
 * 取消店家按讚
 */
export const useRemoveShopLikeMutation =
  defineMutation(() => {
    const queryCache =
      useQueryCache()

    const user =
      useUserStore()

    return useMutation({
      mutation: async (
        shopId: string,
      ) => {
        const { data } =
          await shopReactionService
            .removeShopLike(
              shopId,
            )

        return {
          shopId,
          result:
            data.result,
        }
      },

      onSuccess: async ({
        shopId,
        result,
      }) => {
        queryCache.setQueryData(
          shopReactionKeys
            .likeCount(shopId),
          {
            count:
              result.count,
          },
        )

        queryCache.setQueryData(
          shopReactionKeys
            .likeStatus(
              shopId,
              user.account || '',
            ),
          {
            liked: false,
          },
        )

        await queryCache
          .invalidateQueries({
            key:
              shopReactionKeys
                .root,
          })
      },
    })
  })

/**
 * 收藏店家
 */
export const useAddShopFavoriteMutation =
  defineMutation(() => {
    const queryCache =
      useQueryCache()

    const user =
      useUserStore()

    return useMutation({
      mutation: async (
        shopId: string,
      ) => {
        const { data } =
          await shopReactionService
            .addShopFavorite(
              shopId,
            )

        return {
          shopId,
          result:
            data.result,
        }
      },

      onSuccess: async ({
        shopId,
      }) => {
        queryCache.setQueryData(
          shopReactionKeys
            .favoriteStatus(
              shopId,
              user.account || '',
            ),
          {
            favorited: true,
          },
        )

        await Promise.all([
          queryCache
            .invalidateQueries({
              key:
                shopReactionKeys
                  .favoriteStatus(
                    shopId,
                    user.account || '',
                  ),
            }),

          queryCache
            .invalidateQueries({
              key:
                shopReactionKeys
                  .favorites(
                    user.account || '',
                  ),
            }),
        ])
      },
    })
  })

/**
 * 取消收藏店家
 */
export const useRemoveShopFavoriteMutation =
  defineMutation(() => {
    const queryCache =
      useQueryCache()

    const user =
      useUserStore()

    return useMutation({
      mutation: async (
        shopId: string,
      ) => {
        const { data } =
          await shopReactionService
            .removeShopFavorite(
              shopId,
            )

        return {
          shopId,
          result:
            data.result,
        }
      },

      onSuccess: async ({
        shopId,
      }) => {
        queryCache.setQueryData(
          shopReactionKeys
            .favoriteStatus(
              shopId,
              user.account || '',
            ),
          {
            favorited: false,
          },
        )

        await Promise.all([
          queryCache
            .invalidateQueries({
              key:
                shopReactionKeys
                  .favoriteStatus(
                    shopId,
                    user.account || '',
                  ),
            }),

          queryCache
            .invalidateQueries({
              key:
                shopReactionKeys
                  .favorites(
                    user.account || '',
                  ),
            }),
        ])
      },
    })
  })
