import type {
  ICreateArticleComment,
} from '@/types/articleComment'

import {
  defineMutation,
  useMutation,
  useQueryCache,
} from '@pinia/colada'

import * as articleCommentService
  from '@/services/articleComment'

export const articleCommentKeys = {
  all: ['article-comments'] as const,

  list: (
    articleId: string,
  ) =>
    [
      ...articleCommentKeys.all,
      articleId,
    ] as const,
}

interface CreateCommentVariables {
  articleId: string
  data: ICreateArticleComment
}

export const
  useCreateArticleCommentMutation =
    defineMutation(() => {
      const queryCache =
        useQueryCache()

      return useMutation({
        mutation: (
          variables:
            CreateCommentVariables,
        ) =>
          articleCommentService
            .createArticleComment(
              variables.articleId,
              variables.data,
            ),

        onSuccess: async (
          _response,
          variables,
        ) => {
          await queryCache
            .invalidateQueries({
              key:
                articleCommentKeys
                  .list(
                    variables.articleId,
                  ),
            })
        },
      })
    })

interface DeleteCommentVariables {
  articleId: string
  commentId: string
}

export const
  useDeleteArticleCommentMutation =
    defineMutation(() => {
      const queryCache =
        useQueryCache()

      return useMutation({
        mutation: (
          variables:
            DeleteCommentVariables,
        ) =>
          articleCommentService
            .deleteArticleComment(
              variables.articleId,
              variables.commentId,
            ),

        onSuccess: async (
          _response,
          variables,
        ) => {
          await queryCache
            .invalidateQueries({
              key:
                articleCommentKeys
                  .list(
                    variables.articleId,
                  ),
            })
        },
      })
    })
