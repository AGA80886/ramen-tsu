export type TArticleCategory =
  | '公告'
  | '拉麵科普'
  | '食記分享'
  | '最新情報'
  | '議題討論'
  | '即食拉麵'
  | '其他'

export type TArticleStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'

export interface IArticleAuthor {
  _id: string
  account: string
  nickname?: string
  email?: string
}

/**
 * Backend 回傳的完整 Article
 */
export interface IArticle {
  _id: string
  title: string
  slug: string
  summary: string
  content: string
  coverImage: string
  coverImageUrl?: string
  category: TArticleCategory
  status: TArticleStatus
  author: IArticleAuthor
  createdAt: string
  updatedAt: string
}

/**
 * POST /article
 *
 * 前端上傳圖片時使用 File，
 * 不直接傳 coverImage。
 */
export interface ICreateArticle {
  title: string
  slug: string
  summary: string
  content: string
  category: TArticleCategory

  // 使用者從電腦選擇或拖曳進來的圖片
  image?: File
}

/**
 * PATCH /article/:id
 *
 * 所有欄位皆可選，
 * 沒有傳 image 時保留原封面。
 */
export interface IUpdateArticle {
  title?: string
  slug?: string
  summary?: string
  content?: string
  category?: TArticleCategory

  // 有新圖片才傳
  image?: File
}
