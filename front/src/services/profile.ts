import type { AxiosResponse } from 'axios'
import { api, apiAuth } from './api'
import type { ApiResponse } from '@/types/api'
import type { ApiMessageResponse } from '@/types/api'

import type {
  UpdatePasswordPayload,
  UpdateProfilePayload,
  UserProfile,
  VerifyEmailPayload,
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

export function updatePassword(
  data: UpdatePasswordPayload,
): Promise<AxiosResponse<ApiMessageResponse>> {
  return apiAuth.patch('/user/me/password', data)
}

export function requestEmailVerification():
Promise<AxiosResponse<ApiMessageResponse>> {
  return apiAuth.post('/user/me/email-verification')
}

export function verifyEmail(
  data: VerifyEmailPayload,
): Promise<AxiosResponse<ApiMessageResponse>> {
  return api.post('/user/email-verification/verify', data)
}
