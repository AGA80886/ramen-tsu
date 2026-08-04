import type { AxiosResponse } from 'axios'

import { apiAuth } from './api'
import type { ApiResponse } from '@/types/api'
import type {
  UpdateProfilePayload,
  UserProfile,
} from '@/types/profile'

export function getProfile():
Promise<AxiosResponse<ApiResponse<UserProfile>>> {
  return apiAuth.get('/user/me')
}

export function updateProfile(
  data: UpdateProfilePayload,
): Promise<AxiosResponse<ApiResponse<UserProfile>>> {
  return apiAuth.patch('/user/me', data)
}

export function updateAvatar(
  file: File,
): Promise<AxiosResponse<ApiResponse<UserProfile>>> {
  const formData = new FormData()

  formData.append('avatar', file)

  return apiAuth.patch(
    '/user/me/avatar',
    formData,
  )
}
