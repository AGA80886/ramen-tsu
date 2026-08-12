import {
  defineMutation,
  useMutation,
  useQueryCache,
} from '@pinia/colada'

import * as articleReactionService
  from '@/services/articleReaction'

// ========================================
// Query Keys
// ========================================

export const articleReactionKeys = {
  all: [
    'article-reactions',
  ] as const,

  // Public
  likeCount: (
    articleId: string,
  ) =>
    [
      ...articleReactionKeys.all,
      'like-count',
      articleId,
    ] as const,

  // Private
  likeStatus: (
    articleId: string,
    userKey: string,
  ) =>
    [
      ...articleReactionKeys.all,
      'like-status',
      articleId,
      userKey,
    ] as const,

  // Private
  favoriteStatus: (
    articleId: string,
    userKey: string,
  ) =>
    [
      ...articleReactionKeys.all,
      'favorite-status',
      articleId,
      userKey,
    ] as const,

  // Private
  favorites: (
    userKey: string,
  ) =>
    [
      ...articleReactionKeys.all,
      'favorites',
      'me',
      userKey,
    ] as const,
}

// ========================================
// Like
// ========================================

interface ArticleReactionVariables {
  articleId: string
  userKey: string
}

// 按讚
export const useAddArticleLikeMutation =
  defineMutation(() => {
    const queryCache =
      useQueryCache()

    return useMutation({
      mutation: ({
        articleId,
      }: ArticleReactionVariables) =>
        articleReactionService
          .addArticleLike(
            articleId,
          ),

      onSuccess: async (
        _response,
        variables,
      ) => {
        await Promise.all([
          queryCache.invalidateQueries({
            key:
              articleReactionKeys
                .likeCount(
                  variables.articleId,
              ),

          }),

          queryCache.invalidateQueries({
            key:
              articleReactionKeys
                .likeStatus(
                  variables.articleId,
                  variables.userKey,
                ),
          }),
        ])
      },
    })
  })

// 取消按讚
export const
  useRemoveArticleLikeMutation =
    defineMutation(() => {
      const queryCache =
        useQueryCache()

      return useMutation({
        mutation: ({
          articleId,
        }: ArticleReactionVariables) =>
          articleReactionService
            .removeArticleLike(
              articleId,
            ),

        onSuccess: async (
          _response,
          variables,
        ) => {
          await Promise.all([
            queryCache.invalidateQueries({
              key:
                articleReactionKeys
                  .likeCount(
                    variables.articleId,
                  ),
            }),

            queryCache.invalidateQueries({
              key:
                articleReactionKeys
                  .likeStatus(
                    variables.articleId,
                    variables.userKey,
                  ),
            }),
          ])
        },
      })
    })

// ========================================
// Favorite
// ========================================

// 收藏文章
export const
  useAddArticleFavoriteMutation =
    defineMutation(() => {
      const queryCache =
        useQueryCache()

      return useMutation({
        mutation: ({
          articleId,
        }: ArticleReactionVariables) =>
          articleReactionService
            .addArticleFavorite(
              articleId,
            ),

        onSuccess: async (
          _response,
          variables,
        ) => {
          await Promise.all([
    queryCache.invalidateQueries({
      key:
        articleReactionKeys
          .favoriteStatus(
            variables.articleId,
            variables.userKey,
          ),
    }),

    queryCache.invalidateQueries({
      key:
        articleReactionKeys
          .favorites(
            variables.userKey,
          )
            }),
          ])
        },
      })
    })

// 取消收藏
export const
  useRemoveArticleFavoriteMutation =
    defineMutation(() => {
      const queryCache =
        useQueryCache()

      return useMutation({
        mutation: ({
          articleId,
        }: ArticleReactionVariables) =>
          articleReactionService
            .removeArticleFavorite(
              articleId,
            ),

        onSuccess: async (
          _response,
          variables,
        ) => {
          await Promise.all([
    queryCache.invalidateQueries({
      key:
        articleReactionKeys
          .favoriteStatus(
            variables.articleId,
            variables.userKey,
          ),
    }),

    queryCache.invalidateQueries({
      key:
        articleReactionKeys
          .favorites(
            variables.userKey,)
            }),
          ])
        },
      })
    })
