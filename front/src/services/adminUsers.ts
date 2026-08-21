import type { AxiosResponse } from 'axios'

import type { ApiResponse } from '@/types/api'
import type {
  IAdminUser,
  UpdateAdminUserRoleBody,
} from '@/types/adminUsers'

import { apiAuth } from './api'

export function getAdminUsers():
Promise<AxiosResponse<ApiResponse<IAdminUser[]>>> {
  return apiAuth.get('/user/all')
}

export function getAdminUserById(
  id: string,
): Promise<AxiosResponse<ApiResponse<IAdminUser>>> {
  return apiAuth.get(
    `/user/admin/${id}`,
  )
}

export function updateAdminUserRole(
  id: string,
  data: UpdateAdminUserRoleBody,
): Promise<AxiosResponse<ApiResponse<IAdminUser>>> {
  return apiAuth.patch(
    `/user/admin/${id}/role`,
    data,
  )
}
