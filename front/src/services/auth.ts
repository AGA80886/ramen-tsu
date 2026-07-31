import type { AxiosResponse } from 'axios'
import type { ApiResponse } from '@/types/api'
import type {
  LoginForm,
  LoginResponse,
  RegisterForm,
} from '@/types/auth'

import { apiAuth, refreshAccessToken } from '@/utils/api'

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
