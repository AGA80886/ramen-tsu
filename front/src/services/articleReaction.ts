import type { AxiosResponse } from 'axios'

import { api, apiAuth } from './api'

import type { ApiResponse } from '@/types/api'
import type {
  IArticleFavorite,
  IArticleFavoriteStatus,
  IArticleLikeCount,
  IArticleLikeMutationResult,
  IArticleLikeStatus,
} from '@/types/articleReaction'

// ========================================
// Like
// ========================================

// 公開取得文章按讚數
export function getArticleLikeCount(
  articleId: string,
): Promise<
  AxiosResponse<
    ApiResponse<IArticleLikeCount>
  >
> {
  return api.get(
    `/article/${articleId}/likes`,
  )
}

// 取得目前登入會員是否已按讚
export function getMyArticleLikeStatus(
  articleId: string,
): Promise<
  AxiosResponse<
    ApiResponse<IArticleLikeStatus>
  >
> {
  return apiAuth.get(
    `/article/${articleId}/likes/me`,
  )
}

// 按讚
export function addArticleLike(
  articleId: string,
): Promise<
  AxiosResponse<
    ApiResponse<IArticleLikeMutationResult>
  >
> {
  return apiAuth.post(
    `/article/${articleId}/likes`,
  )
}

// 取消按讚
export function removeArticleLike(
  articleId: string,
): Promise<
  AxiosResponse<
    ApiResponse<IArticleLikeMutationResult>
  >
> {
  return apiAuth.delete(
    `/article/${articleId}/likes`,
  )
}

// ========================================
// Favorite
// ========================================

// 取得目前登入會員是否已收藏
export function getMyArticleFavoriteStatus(
  articleId: string,
): Promise<
  AxiosResponse<
    ApiResponse<IArticleFavoriteStatus>
  >
> {
  return apiAuth.get(
    `/article/${articleId}/favorite`,
  )
}

// 收藏文章
export function addArticleFavorite(
  articleId: string,
): Promise<
  AxiosResponse<
    ApiResponse<IArticleFavoriteStatus>
  >
> {
  return apiAuth.post(
    `/article/${articleId}/favorite`,
  )
}

// 取消收藏
export function removeArticleFavorite(
  articleId: string,
): Promise<
  AxiosResponse<
    ApiResponse<IArticleFavoriteStatus>
  >
> {
  return apiAuth.delete(
    `/article/${articleId}/favorite`,
  )
}

// ========================================
// My Favorites
// ========================================

// 取得目前登入會員的收藏文章列表
export function getMyArticleFavorites():
Promise<
  AxiosResponse<
    ApiResponse<IArticleFavorite[]>
  >
> {
  return apiAuth.get(
    '/article/favorites/me',
  )
}
