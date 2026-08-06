import type { AxiosResponse } from 'axios'
import { api } from './api'
import type { ApiResponse,ApiMessageResponse } from '@/types/api'
import type {
  LoginForm,
  LoginResponse,
  RegisterForm,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  ValidateResetPasswordTokenPayload,
} from '@/types/auth'

import { apiAuth, refreshAccessToken } from '@/services/api'

export function register(
  data: RegisterForm,
): Promise<AxiosResponse<ApiResponse<Record<string, never>>>> {
  return apiAuth.post('/auth/register', data)
}

export function login(
  data: LoginForm,
): Promise<AxiosResponse<ApiResponse<LoginResponse>>> {
  return apiAuth.post('/auth/login', data)
}

export function refresh():
Promise<AxiosResponse<ApiResponse<LoginResponse>>> {
  return refreshAccessToken()
}

export function logout():
Promise<AxiosResponse<ApiResponse<Record<string, never>>>> {
  return apiAuth.delete('/auth/logout')
}

export function forgotPassword(
  data: ForgotPasswordPayload,
): Promise<AxiosResponse<ApiMessageResponse>> {
  return api.post('/auth/forgot-password', data)
}

export function resetPassword(
  data: ResetPasswordPayload,
): Promise<AxiosResponse<ApiMessageResponse>> {
  return api.post('/auth/reset-password', data)
}

export function validateResetPasswordToken(
  data: ValidateResetPasswordTokenPayload,
): Promise<AxiosResponse<ApiMessageResponse>> {
  return api.post(
    '/auth/reset-password/validate',
    data,
  )
}
