// 統一 API 回應格式的型別
export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  result: T
}
