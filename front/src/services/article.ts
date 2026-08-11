import type { AxiosResponse } from 'axios'

import type { ApiResponse } from '@/types/api'
import type {
  IArticle,
  ICreateArticle,
  IUpdateArticle,
  TArticleStatus,
} from '@/types/article'

import { api, apiAuth } from './api'

function buildArticleFormData(
  data: ICreateArticle | IUpdateArticle,
): FormData {
  const formData = new FormData()

  if (data.title !== undefined) {
    formData.append('title', data.title)
  }

  if (data.slug !== undefined) {
    formData.append('slug', data.slug)
  }

  if (data.summary !== undefined) {
    formData.append('summary', data.summary)
  }

  if (data.content !== undefined) {
    formData.append('content', data.content)
  }

  if (data.category !== undefined) {
    formData.append('category', data.category)
  }

  if (data.image) {
    formData.append(
      'image',
      data.image,
    )
  }

  return formData
}

// 公開：取得已發布文章
export function getArticles():
Promise<AxiosResponse<ApiResponse<IArticle[]>>> {
  return api.get('/article')
}

// 公開：依 slug 取得文章詳情
export function getArticleBySlug(
  slug: string,
): Promise<
  AxiosResponse<ApiResponse<IArticle>>
> {
  return api.get(`/article/${slug}`)
}

// Admin：取得全部文章
export function getAdminArticles():
Promise<AxiosResponse<ApiResponse<IArticle[]>>> {
  return apiAuth.get('/article/admin')
}

// Admin：建立文章
export function createArticle(
  data: ICreateArticle,
): Promise<
  AxiosResponse<ApiResponse<IArticle>>
> {
  return apiAuth.post(
    '/article',
    buildArticleFormData(data),
  )
}

// Admin：修改文章
export function updateArticle(
  id: string,
  data: IUpdateArticle,
): Promise<
  AxiosResponse<ApiResponse<IArticle>>
> {
  return apiAuth.patch(
    `/article/${id}`,
    buildArticleFormData(data),
  )
}

// Admin：刪除文章
export function deleteArticle(
  id: string,
): Promise<
  AxiosResponse<ApiResponse<IArticle>>
> {
  return apiAuth.delete(
    `/article/${id}`,
  )
}

export function updateArticleStatus(
  id: string,
  status: Extract<
    TArticleStatus,
    'approved' | 'rejected'
  >,
): Promise<
  AxiosResponse<ApiResponse<IArticle>>
> {
  return apiAuth.patch(
    `/article/${id}/status`,
    {
      status,
    },
  )
}

export function getMyArticles():
Promise<
  AxiosResponse<ApiResponse<IArticle[]>>
> {
  return apiAuth.get('/article/me')
}
