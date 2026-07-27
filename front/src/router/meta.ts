import 'vue-router'

import type { UserRole } from '@/types/auth'

export type RouteAccess =
  | 'public'
  | 'guest'
  | 'authenticated'

declare module 'vue-router' {
  interface RouteMeta {
    /**
     * 顯示於瀏覽器頁籤的頁面名稱。
     */
    title?: string

    /**
     * 路由存取規則：
     *
     * public：所有使用者都能進入
     * guest：僅限未登入使用者
     * authenticated：僅限已登入使用者
     *
     * 未設定時預設視為 public。
     */
    access?: RouteAccess

    /**
     * 允許進入頁面的使用者角色。
     *
     * 設定 roles 時，路由守衛會自動要求使用者登入。
     * 使用者只需具備其中一個角色即可進入。
     */
    roles?: readonly UserRole[]
  }
}

export {}
