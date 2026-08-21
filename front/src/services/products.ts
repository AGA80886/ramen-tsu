import type { AxiosResponse } from 'axios'

import type { ApiResponse } from '@/types/api'
import type { IProduct, ProductForm } from '@/types/products'

import { api, apiAuth } from './api'

function buildProductFormData(data: ProductForm): FormData {
  const formData = new FormData()

  formData.append('name', data.name)
  formData.append('price', data.price.toString())
  formData.append('description', data.description)
  formData.append('category', data.category)
  formData.append('sell', data.sell.toString())

  if (data.image) {
    formData.append('image', data.image)
  }

  return formData
}

export function createProduct(
  data: ProductForm,
): Promise<AxiosResponse<ApiResponse<IProduct>>> {
  return apiAuth.post('/product', buildProductFormData(data))
}

export function updateProduct(
  id: string,
  data: ProductForm,
): Promise<AxiosResponse<ApiResponse<IProduct>>> {
  return apiAuth.patch(
    `/product/${id}`,
    buildProductFormData(data),
  )
}

export function deleteProduct(
  id: string,
): Promise<AxiosResponse<ApiResponse<null>>> {
  return apiAuth.delete(`/product/${id}`)
}

export function getProducts():
Promise<AxiosResponse<ApiResponse<IProduct[]>>> {
  return api.get('/product')
}

export function getAdminProducts():
Promise<AxiosResponse<ApiResponse<IProduct[]>>> {
  return apiAuth.get('/product/all')
}

export function getProductById(
  id: string,
): Promise<AxiosResponse<ApiResponse<IProduct>>> {
  return api.get(`/product/${id}`)
}

export function getAdminProductById(
  id: string,
): Promise<AxiosResponse<ApiResponse<IProduct>>> {
  return apiAuth.get(`/product/admin/${id}`)
}
