import type { AxiosResponse } from 'axios'

import { api, apiAuth } from './api'

import type { ApiResponse } from '@/types/api'
import type {
  IArticleComment,
  ICreateArticleComment,
  IDeleteArticleCommentResponse,
} from '@/types/articleComment'

// 公開取得留言
export function getArticleComments(
  articleId: string,
): Promise<
  AxiosResponse<
    ApiResponse<IArticleComment[]>
  >
> {
  return api.get(
    `/article/${articleId}/comments`,
  )
}

// 建立留言
export function createArticleComment(
  articleId: string,
  data: ICreateArticleComment,
): Promise<
  AxiosResponse<
    ApiResponse<IArticleComment>
  >
> {
  return apiAuth.post(
    `/article/${articleId}/comments`,
    data,
  )
}

// 刪除留言
export function deleteArticleComment(
  articleId: string,
  commentId: string,
): Promise<
  AxiosResponse<
    IDeleteArticleCommentResponse
  >
> {
  return apiAuth.delete(
    `/article/${articleId}/comments/${commentId}`,
  )
}
