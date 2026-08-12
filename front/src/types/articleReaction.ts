import type {
  IArticle,
} from '@/types/article'

// ========================================
// Like
// ========================================

export interface IArticleLikeCount {
  count: number
}

export interface IArticleLikeStatus {
  liked: boolean
}

export interface IArticleLikeMutationResult {
  liked: boolean
  count: number
}

// ========================================
// Favorite
// ========================================

export interface IArticleFavoriteStatus {
  favorited: boolean
}

// ========================================
// Favorite List
// ========================================

export interface IArticleFavorite {
  _id: string
  article: IArticle
  user: string
  createdAt: string
  updatedAt: string
}
