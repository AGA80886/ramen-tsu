import axios from 'axios'

import type { ApiErrorResponse } from '@/types/api'

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? '請求失敗'
  }

  if (error instanceof Error) {
    return error.message
  }

  return '發生未知錯誤'
}
