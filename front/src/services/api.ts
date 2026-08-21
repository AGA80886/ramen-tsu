import type { AxiosResponse, InternalAxiosRequestConfig, } from 'axios'
import type { ApiResponse } from '@/types/api'
import type { LoginResponse } from '@/types/auth'
import axios, { AxiosError } from 'axios'
import { useUserStore } from '@/stores/user'
import { pinia } from '@/plugins/pinia'

const baseURL = import.meta.env.VITE_API_URL

export const api = axios.create({ baseURL })

export const apiAuth = axios.create({
  baseURL,
  withCredentials: true,
})

/**
 * Refresh 使用獨立 client，避免 refresh 請求再次進入 apiAuth 的
 * 401 攔截器而形成無限循環。
 */
const refreshClient = axios.create({
  baseURL,
  withCredentials: true,
})

let refreshPromise:
  | Promise<AxiosResponse<ApiResponse<LoginResponse>>>
  | undefined

export function refreshAccessToken():
Promise<AxiosResponse<ApiResponse<LoginResponse>>> {
  const user = useUserStore(pinia)

  refreshPromise ??= refreshClient
    .post<ApiResponse<LoginResponse>>('/auth/refresh')
    .then(response => {
      user.login(response.data.result)
      return response
    })
    .catch(error => {
      user.logout()
      throw error
    })
    .finally(() => {
      refreshPromise = undefined
    })

  return refreshPromise
}

apiAuth.interceptors.request.use(config => {
  const user = useUserStore(pinia)

  if (user.accessToken) {
    config.headers.set(
      'Authorization',
      `Bearer ${user.accessToken}`,
    )
  } else {
    config.headers.delete('Authorization')
  }

  return config
})

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

apiAuth.interceptors.response.use(
  response => response,
  async (error: unknown) => {
    if (!(error instanceof AxiosError) || !error.config) {
      throw error
    }

    const config = error.config as RetryableRequestConfig
    const shouldRefresh =
      error.response?.status === 401 &&
      !config._retry &&
      !config.url?.includes('/auth/refresh')

    if (!shouldRefresh) {
      throw error
    }

    config._retry = true

    try {
      const response = await refreshAccessToken()
      config.headers.set(
        'Authorization',
        `Bearer ${response.data.result.accessToken}`,
      )

      return apiAuth(config)
    } catch {
      throw error
    }
  },
)
