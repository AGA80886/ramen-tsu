import {
  api,
  apiAuth,
} from '@/services/api'

import type { Shop } from '@/types/shop'

export interface ShopLikeCountResult {
  count: number
}

export interface ShopLikeStatusResult {
  liked: boolean
}

export interface ShopLikeMutationResult {
  liked: boolean
  count: number
}

export interface ShopFavoriteStatusResult {
  favorited: boolean
}

export interface ShopFavoriteMutationResult {
  favorited: boolean
}

export interface ShopFavoriteItem {
  _id: string
  shop: Shop
  user: string
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  result: T
}

export const getShopLikeCount = (
  shopId: string,
) => {
  return api.get<
    ApiResponse<ShopLikeCountResult>
  >(
    `/shop/${shopId}/likes`,
  )
}

export const getMyShopLikeStatus = (
  shopId: string,
) => {
  return apiAuth.get<
    ApiResponse<ShopLikeStatusResult>
  >(
    `/shop/${shopId}/likes/me`,
  )
}

export const addShopLike = (
  shopId: string,
) => {
  return apiAuth.post<
    ApiResponse<ShopLikeMutationResult>
  >(
    `/shop/${shopId}/likes`,
  )
}

export const removeShopLike = (
  shopId: string,
) => {
  return apiAuth.delete<
    ApiResponse<ShopLikeMutationResult>
  >(
    `/shop/${shopId}/likes`,
  )
}

export const getMyShopFavoriteStatus = (
  shopId: string,
) => {
  return apiAuth.get<
    ApiResponse<ShopFavoriteStatusResult>
  >(
    `/shop/${shopId}/favorite`,
  )
}

export const addShopFavorite = (
  shopId: string,
) => {
  return apiAuth.post<
    ApiResponse<ShopFavoriteMutationResult>
  >(
    `/shop/${shopId}/favorite`,
  )
}

export const removeShopFavorite = (
  shopId: string,
) => {
  return apiAuth.delete<
    ApiResponse<ShopFavoriteMutationResult>
  >(
    `/shop/${shopId}/favorite`,
  )
}

export const getMyShopFavorites = () => {
  return apiAuth.get<
    ApiResponse<ShopFavoriteItem[]>
  >(
    '/shop/favorites/me',
  )
}
