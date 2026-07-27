import { refreshAccessToken } from '@/utils/api'
import { useUserStore } from '@/stores/user'

let initializationPromise: Promise<void> | undefined

/**
 * 每次載入應用程式只恢復一次登入狀態。
 *
 * 多個導航若同時發生，會共用同一個 Promise，避免重複送出 Refresh
 * 請求。Refresh 失敗時視為訪客狀態，不阻止公開頁面的導航。
 */
export function ensureAuthInitialized(): Promise<void> {
  initializationPromise ??= refreshAccessToken()
    .then(() => undefined)
    .catch(() => {
      useUserStore().logout()
    })

  return initializationPromise
}

/**
 * 僅供登出或測試後重新初始化登入狀態。
 */
export function resetAuthInitialization(): void {
  initializationPromise = undefined
}
