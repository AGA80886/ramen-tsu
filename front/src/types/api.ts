export interface ApiResponse<T> {
  success: boolean
  message: string
  result: T
}

export interface ApiErrorResponse {
  success?: false
  message: string
  errors?: Record<string, string[]>
}

export interface ApiMessageResponse {
  success: boolean
  message: string
}
