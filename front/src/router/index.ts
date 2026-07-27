/**
 * src/router/index.ts
 *
 * 建立 Vue Router 實例，
 * 並整合自動路由、Layout、守衛及網頁標題。
 */

import './meta'

import { setupLayouts } from 'virtual:generated-layouts'
import {
  createRouter,
  createWebHashHistory,
} from 'vue-router'
import { routes } from 'vue-router/auto-routes'

import { setupRouterGuards } from './guards'
import { setupDocumentTitle } from './title'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),

  routes: setupLayouts(routes),

  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }

    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }

    return {
      top: 0,
      left: 0,
    }
  },
})

setupRouterGuards(router)
setupDocumentTitle(router)

export default router
