import type { Router } from 'vue-router'
import { START_LOCATION } from 'vue-router'

import { useRefreshMutation } from '@/queries/auth'
import { useUserStore } from '@/stores/user'
import type { UserRole } from '@/types/auth'

let isAuthInitialized = false

function hasRequiredRole(
  requiredRoles: readonly UserRole[] | undefined,
  userRole: UserRole,
): boolean {
  if (!requiredRoles?.length) {
    return true
  }

  return requiredRoles.includes(userRole)
}

export function setupRouterGuards(router: Router): void {
  router.beforeEach(async (to, from) => {
    /**
     * 第一次進入網站時，嘗試透過 Refresh Token
     * 恢復使用者的登入狀態。
     */
    if (
      from === START_LOCATION &&
      !isAuthInitialized
    ) {
      isAuthInitialized = true

      try {
        await useRefreshMutation().mutateAsync()
      } catch {
        // 沒有有效登入狀態時，不阻止導航。
        // 後續交由 access 與 roles 規則處理。
      }
    }

    const user = useUserStore()

    /**
     * 訪客限定頁面。
     *
     * 已登入使用者不可再次進入登入、註冊等頁面。
     */
    if (
      to.meta.access === 'guest' &&
      user.isLoggedIn
    ) {
      return {
        path: '/',
      }
    }

    /**
     * authenticated 頁面或設定 roles 的頁面，
     * 都必須先登入。
     */
    const requiresAuthentication =
      to.meta.access === 'authenticated' ||
      Boolean(to.meta.roles?.length)

    if (
      requiresAuthentication &&
      !user.isLoggedIn
    ) {
      return {
        path: '/login',
        query: {
          redirect: to.fullPath,
        },
      }
    }

    /**
     * 角色限定頁面。
     *
     * 使用者角色必須存在於路由允許的 roles 中。
     */
    if (
      !hasRequiredRole(
        to.meta.roles,
        user.role,
      )
    ) {
      return {
        path: '/forbidden',
      }
    }

    return true
  })
}
