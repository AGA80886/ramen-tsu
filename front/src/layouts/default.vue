<template>
  <el-container class="site-layout">
    <!-- 上方 Navbar -->
    <el-header class="site-header">
      <div class="header-inner">
        <!-- 左側：Logo 與網站標題 -->
        <router-link
          class="brand"
          to="/"
        >
          <img
            :src="logo"
            alt="拉麵通 Logo"
            class="brand-logo"
          />

          <div class="brand-text">
            <h1>拉麵通</h1>
            <span>ラーメン通</span>
          </div>
        </router-link>

        <!-- 右側：桌面版會員功能 -->
        <div class="header-actions desktop-actions">
          <el-menu
            class="account-menu"
            mode="horizontal"
            :default-active="route.path"
            :ellipsis="false"
            router
          >
            <el-menu-item
              v-if="user.isAdmin"
              index="/admin"
            >
              <el-icon>
                <Setting />
              </el-icon>
              <span>管理員專區</span>
            </el-menu-item>

            <el-menu-item
              v-if="!user.isLoggedIn"
              index="/register"
            >
              <el-icon>
                <UserFilled />
              </el-icon>
              <span>註冊</span>
            </el-menu-item>

            <el-menu-item
              v-if="!user.isLoggedIn"
              index="/login"
            >
              <el-icon>
                <Lock />
              </el-icon>
              <span>登入</span>
            </el-menu-item>

            <el-menu-item
              v-if="user.isLoggedIn"
              index="/user/cart"
            >
              <el-icon>
                <ShoppingCart />
              </el-icon>

              <span>購物車</span>

              <el-badge
                class="cart-badge"
                :value="user.cart"
                :hidden="user.cart === 0"
              />
            </el-menu-item>

            <el-menu-item
              v-if="user.isLoggedIn"
              index="/user/orders"
            >
              <el-icon>
                <Collection />
              </el-icon>
              <span>訂單</span>
            </el-menu-item>
          </el-menu>

          <!-- 已登入會員名稱：放在訂單與登出之間 -->
          <div
            v-if="user.isLoggedIn"
            class="member-info"
            aria-label="目前登入會員"
          >
            <el-icon :size="20">
              <Avatar />
            </el-icon>

            <span class="member-name">
              {{ memberName }}
            </span>
          </div>

          <el-tooltip
            v-if="user.isLoggedIn"
            content="登出"
            placement="bottom"
          >
            <el-button
              text
              circle
              aria-label="登出"
              @click="logout"
            >
              <el-icon :size="20">
                <SwitchButton />
              </el-icon>
            </el-button>
          </el-tooltip>

          <DarkModeToggle />
        </div>

        <!-- 手機版功能 -->
        <div class="mobile-actions">
          <DarkModeToggle />

          <el-dropdown
            trigger="click"
            placement="bottom-end"
            :hide-on-click="true"
            @command="handleMobileCommand"
          >
            <el-button
              text
              circle
              aria-label="開啟導覽選單"
            >
              <el-icon :size="24">
                <Menu />
              </el-icon>
            </el-button>

            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="/">
                  <el-icon>
                    <HomeFilled />
                  </el-icon>
                  回首頁
                </el-dropdown-item>

                <el-dropdown-item command="/ramen-guide">
                  日式拉麵大全
                </el-dropdown-item>

                <el-dropdown-item command="/ramen-map">
                  台灣拉麵地圖
                </el-dropdown-item>

                <el-dropdown-item command="/instant-ramen">
                  日式即食拉麵
                </el-dropdown-item>

                <el-dropdown-item command="/shop">
                  線上商城
                </el-dropdown-item>

                <el-dropdown-item
                  v-if="user.isAdmin"
                  divided
                  command="/admin"
                >
                  <el-icon>
                    <Setting />
                  </el-icon>
                  管理員專區
                </el-dropdown-item>

                <el-dropdown-item
                  v-if="!user.isLoggedIn"
                  divided
                  command="/register"
                >
                  <el-icon>
                    <UserFilled />
                  </el-icon>
                  註冊
                </el-dropdown-item>

                <el-dropdown-item
                  v-if="!user.isLoggedIn"
                  command="/login"
                >
                  <el-icon>
                    <Lock />
                  </el-icon>
                  登入
                </el-dropdown-item>

                <el-dropdown-item
                  v-if="user.isLoggedIn"
                  divided
                  disabled
                  class="mobile-member-info"
                >
                  <el-icon>
                    <Avatar />
                  </el-icon>
                  {{ memberName }}
                </el-dropdown-item>

                <el-dropdown-item
                  v-if="user.isLoggedIn"
                  command="/user/cart"
                >
                  <el-icon>
                    <ShoppingCart />
                  </el-icon>

                  購物車

                  <el-badge
                    class="mobile-cart-badge"
                    :value="user.cart"
                    :hidden="user.cart === 0"
                  />
                </el-dropdown-item>

                <el-dropdown-item
                  v-if="user.isLoggedIn"
                  command="/user/orders"
                >
                  <el-icon>
                    <Collection />
                  </el-icon>
                  訂單
                </el-dropdown-item>

                <el-dropdown-item
                  v-if="user.isLoggedIn"
                  divided
                  command="logout"
                >
                  <el-icon>
                    <SwitchButton />
                  </el-icon>
                  登出
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-header>

    <!-- Header 下方：Sidebar + 主內容 -->
    <el-container class="body-layout">
      <el-aside
        class="site-sidebar"
        width="240px"
      >
        <el-menu
          class="sidebar-menu"
          :default-active="route.path"
          router
        >
          <el-menu-item index="/">
            <el-icon>
              <HomeFilled />
            </el-icon>
            <span>回首頁</span>
          </el-menu-item>

          <el-menu-item index="/ramen-guide">
            <span>日式拉麵大全</span>
          </el-menu-item>

          <el-menu-item index="/ramen-map">
            <span>台灣拉麵地圖</span>
          </el-menu-item>

          <el-menu-item index="/instant-ramen">
            <span>日式即食拉麵</span>
          </el-menu-item>

          <el-menu-item index="/shop">
            <span>線上商城</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-main class="site-main">
        <router-view :key="route.fullPath" />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import {
  Avatar,
  Collection,
  HomeFilled,
  Lock,
  Menu,
  Setting,
  ShoppingCart,
  SwitchButton,
  UserFilled,
} from '@element-plus/icons-vue'

import DarkModeToggle from '@/components/layout/frontend/DarkModeToggle.vue'
import { useLogoutMutation } from '@/queries/auth'
import { useSnackbarStore } from '@/stores/snackbar'
import { useUserStore } from '@/stores/user'

import logo from '@/assets/images/logo.png'

const user = useUserStore()
const route = useRoute()
const router = useRouter()
const snackbar = useSnackbarStore()

const logoutMutation = useLogoutMutation()

/**
 * 兼容常見的會員欄位名稱。
 * 會依序嘗試 name、nickname、account、email。
 */
const memberName = computed(() => {
  const currentUser = user as unknown as {
    name?: string
    nickname?: string
    account?: string
    email?: string
  }

  return (
    currentUser.name ||
    currentUser.nickname ||
    currentUser.account ||
    currentUser.email ||
    '會員'
  )
})

async function logout() {
  try {
    await logoutMutation.mutateAsync()
    await router.push('/')

    snackbar.add({
      text: '登出成功',
      color: 'success',
    })
  } catch {
    snackbar.add({
      text: '登出失敗，請稍後再試',
      color: 'error',
    })
  }
}

async function handleMobileCommand(command: string | number | object) {
  if (typeof command !== 'string') return

  if (command === 'logout') {
    await logout()
    return
  }

  if (route.path !== command) {
    await router.push(command)
  }
}
</script>

<style scoped>
.site-layout {
  min-height: 100vh;
  background-color: var(--el-bg-color);
  color: var(--el-text-color-primary);
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

/* Header */

.site-header {
  position: sticky;
  z-index: 100;
  top: 0;
  height: 100px;
  padding: 0;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
}

.header-inner {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 0 24px;
  box-sizing: border-box;
}

/* 品牌區 */

.brand {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 16px;
  color: inherit;
  text-decoration: none;
}

.brand-logo {
  width: 88px;
  height: 88px;
  object-fit: contain;
}

.brand-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.brand-text h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
}

.brand-text span {
  margin-top: 4px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

/* Navbar 右側功能 */

.header-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 8px;
  margin-left: auto;
}

.account-menu {
  border-bottom: none;
  background-color: transparent;
}

.account-menu.el-menu--horizontal {
  height: 63px;
}

.account-menu :deep(.el-menu-item) {
  padding: 0 14px;
  white-space: nowrap;
}

.cart-badge {
  margin-left: 8px;
}

.member-info {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 180px;
  padding: 8px 10px;
  color: var(--el-text-color-regular);
  white-space: nowrap;
}

.member-name {
  overflow: hidden;
  font-weight: 600;
  text-overflow: ellipsis;
}

.mobile-actions {
  display: none;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}

.mobile-cart-badge {
  margin-left: 10px;
}

/* Sidebar 與主內容 */

.body-layout {
  min-height: calc(100vh - 100px);
}

.site-sidebar {
  position: sticky;
  top: 100px;
  height: calc(100vh - 100px);
  overflow-y: auto;
  background-color: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color-light);
}

.sidebar-menu {
  min-height: 100%;
  padding-top: 16px;
  border-right: none;
  background-color: transparent;
}

.sidebar-menu :deep(.el-menu-item) {
  margin: 4px 12px;
  border-radius: 8px;
}

.site-main {
  min-width: 0;
  padding: 24px;
  box-sizing: border-box;
}

/* 平板與手機 */

@media (max-width: 900px) {
  .desktop-actions {
    display: none;
  }

  .mobile-actions {
    display: flex;
  }

  .site-sidebar {
    display: none;
  }

  .body-layout {
    display: block;
  }

  .site-main {
    width: 100%;
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .site-header {
    height: 72px;
  }

  .header-inner {
    padding: 0 12px;
  }

  .brand {
    gap: 10px;
  }

  .brand-logo {
    width: 56px;
    height: 56px;
  }

  .brand-text h1 {
    font-size: 21px;
  }

  .brand-text span {
    font-size: 12px;
  }

  .body-layout {
    min-height: calc(100vh - 72px);
  }

  .site-main {
    padding: 16px 12px;
  }
}
</style>
