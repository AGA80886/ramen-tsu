export interface IArticleCommentAuthor {
  _id: string
  account: string
  nickname?: string
  avatar?: string
}

export interface IArticleComment {
  _id: string
  article: string
  author: IArticleCommentAuthor
  content: string
  createdAt: string
  updatedAt: string
}

export interface ICreateArticleComment {
  content: string
}

export interface IArticleCommentsResponse {
  success: boolean
  message: string
  result: IArticleComment[]
}

export interface IArticleCommentResponse {
  success: boolean
  message: string
  result: IArticleComment
}

export interface IDeleteArticleCommentResponse {
  success: boolean
  message: string
}
