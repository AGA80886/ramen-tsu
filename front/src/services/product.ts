import type { ApiResponse } from '@/types/api'
import type { IProduct, ProductForm } from '@/types/product'
import type { AxiosResponse } from 'axios'
import { api, apiAuth } from '@/utils/api'

function buildProductFormData (data: ProductForm) {
  const fd = new FormData()
  fd.append('name', data.name)
  fd.append('price', data.price.toString())
  fd.append('description', data.description)
  fd.append('category', data.category)
  fd.append('sell', data.sell.toString())
  if (data.image) {
    fd.append('image', data.image)
  }
  return fd
}

export function create (data: ProductForm): Promise<AxiosResponse<ApiResponse<IProduct>>> {
  const fd = buildProductFormData(data)
  return apiAuth.post('/product', fd)
}

export function update (id: string, data: ProductForm): Promise<AxiosResponse<ApiResponse<IProduct>>> {
  const fd = buildProductFormData(data)
  return apiAuth.patch(`/product/${id}`, fd)
}

export function get (): Promise<AxiosResponse<ApiResponse<IProduct[]>>> {
  return api.get(`/product`)
}

export function getAll (): Promise<AxiosResponse<ApiResponse<IProduct[]>>> {
  return apiAuth.get(`/product/all`)
}

export function getId (id: string): Promise<AxiosResponse<ApiResponse<IProduct>>> {
  return api.get(`/product/${id}`)
}
