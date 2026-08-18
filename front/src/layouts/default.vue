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
            <el-menu-item index="/">
              <el-icon>
                <HomeFilled />
              </el-icon>
              <span>回首頁</span>
            </el-menu-item>

            <el-menu-item index="/articles">
              <span>拉麵論壇</span>
            </el-menu-item>

            <el-menu-item index="/shops">
              <span>拉麵店家</span>
            </el-menu-item>

            <el-menu-item index="/map">
              <span>拉麵地圖</span>
            </el-menu-item>

            <el-menu-item index="/online-store">
              <span>拉麵商城</span>
            </el-menu-item>

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
              <span>我的訂單</span>
            </el-menu-item>
          </el-menu>

          <!-- 已登入會員名稱：放在訂單與登出之間 -->
          <el-button
            v-if="user.isLoggedIn"
            text
            class="member-info"
            aria-label="前往會員中心"
            @click="goToProfile"
          >
            <el-icon :size="20">
              <Avatar />
            </el-icon>

            <span class="member-name">
              {{ memberName }}
            </span>
          </el-button>

          <el-tooltip
            v-if="user.isLoggedIn"
            content="登出"
            placement="bottom"
          >
            <el-button
              text
              circle
              class="header-icon-button"
              aria-label="登出"
              @click="logout"
            >
              <el-icon :size="20">
                <SwitchButton />
              </el-icon>
            </el-button>
          </el-tooltip>

          <DarkModeToggle class="header-icon-button" />
        </div>

        <!-- 手機版功能 -->
        <div class="mobile-actions">
          <DarkModeToggle class="header-icon-button" />

          <el-dropdown
            trigger="click"
            placement="bottom-end"
            popper-class="mobile-nav-dropdown"
            :hide-on-click="true"
            @command="handleMobileCommand"
          >
            <el-button
              text
              circle
              class="header-icon-button"
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

                <el-dropdown-item command="/articles">
                  拉麵論壇
                </el-dropdown-item>

                <el-dropdown-item command="/shops">
                  拉麵店家
                </el-dropdown-item>

                <el-dropdown-item command="/map">
                  拉麵地圖
                </el-dropdown-item>

                <el-dropdown-item command="/online-store">
                  拉麵商城
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
                  command="/profile"
                  divided
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

    <!-- Header 下方：主內容 -->
    <el-container class="body-layout">
      <el-main class="site-main">
        <router-view :key="route.fullPath" />
      </el-main>
    </el-container>

    <!-- Footer -->
    <el-footer class="site-footer">
      <div class="footer-inner">
        <p class="copyright">
          © 2026 許庭嘉（TING-CHIA HSU）. All Rights Reserved.
        </p>

        <p class="portfolio-disclaimer">
          本網站為非營利性質，僅作為網頁全端工程師作品集使用。
          <br />
          This website is non-profit and is intended solely as a portfolio for a Full-Stack Web Developer.
        </p>
      </div>
    </el-footer>
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
  return user.nickname || user.account || user.email || '會員'
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

async function goToProfile(): Promise<void> {
  if (route.path !== '/profile') {
    await router.push('/profile')
  }
}
</script>


<style scoped lang="scss">
.site-layout {
  min-height: 100vh;
  color: var(--color-text);
  background-color: var(--color-background);
  transition:
    background-color var(--transition-normal),
    color var(--transition-normal);
}

/* Header */

.site-header {
  position: sticky;
  z-index: 100;
  top: 0;
  height: 100px;
  padding: 0;
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
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
  color: var(--color-text-secondary);
  font-size: 14px;
}

.header-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 4px;
  min-width: 0;
  margin-left: auto;
}

.account-menu {
  height: 100%;
  border-bottom: none;
  background-color: transparent;
}

.account-menu.el-menu--horizontal {
  height: 100%;
  border-bottom: none;
}

.account-menu :deep(.el-menu-item) {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 44px;
  margin: 0 2px;
  padding: 0 12px;
  border: 0 !important;
  border-radius: 6px;
  color: var(--color-primary);
  font-weight: 500;
  white-space: nowrap;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}

.account-menu :deep(.el-menu-item:hover),
.account-menu :deep(.el-menu-item:focus),
.account-menu :deep(.el-menu-item.is-active) {
  color: var(--color-primary);
  background-color: var(--el-color-primary-light-9);
}

.account-menu :deep(.el-menu-item::after) {
  display: none;
}

.account-menu :deep(.el-menu-item .el-icon) {
  color: inherit;
}

.cart-badge {
  margin-left: 6px;
}

.member-info {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  gap: 6px;
  height: 44px;
  max-width: 160px;
  margin: 0 2px;
  padding: 0 12px;
  border: 0;
  border-radius: 6px;
  color: var(--color-primary);
  background-color: transparent;
  font-weight: 500;
  white-space: nowrap;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}

.member-info:hover,
.member-info:focus-visible {
  color: var(--color-primary);
  background-color: var(--el-color-primary-light-9) !important;
}

.member-info :deep(.el-icon),
.member-name {
  color: inherit;
}

.member-name {
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-actions :deep(.header-icon-button),
.mobile-actions :deep(.header-icon-button) {
  color: var(--color-primary);
  background-color: transparent;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}

.header-actions :deep(.header-icon-button:hover),
.header-actions :deep(.header-icon-button:focus-visible),
.mobile-actions :deep(.header-icon-button:hover),
.mobile-actions :deep(.header-icon-button:focus-visible) {
  color: var(--color-primary);
  background-color: var(--el-color-primary-light-9);
}

.mobile-actions {
  display: none;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.mobile-cart-badge {
  margin-left: auto;
}

/* 主內容 */

.body-layout {
  flex: 1;
  min-height: 0;
}

.site-main {
  width: 100%;
  min-width: 0;
  padding: 24px;
  box-sizing: border-box;
  background-color: var(--color-background);
}


/* Footer */

.site-footer {
  height: auto;
  padding: 20px 24px;
  border-top: 1px solid var(--color-border);
  background-color: var(--color-surface);
  color: var(--color-text-secondary);
}

.footer-inner {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.footer-inner p {
  margin: 0;
}

.copyright {
  color: var(--color-text);
  font-size: 14px;
  font-weight: 600;
}

.portfolio-disclaimer {
  margin-top: 8px !important;
  font-size: 13px;
  line-height: 1.7;
}

/*
 * el-dropdown 會 Teleport 到 body，scoped selector 無法直接命中，
 * 因此搭配 popper-class 使用 :global。
 */
:global(.mobile-nav-dropdown .el-dropdown-menu) {
  min-width: 220px;
  padding: 8px;
}

:global(.mobile-nav-dropdown .el-dropdown-menu__item) {
  min-height: 44px;
  margin: 2px 0;
  padding: 0 12px;
  border-radius: 6px;
  color: var(--color-primary);
  font-weight: 500;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}

:global(.mobile-nav-dropdown .el-dropdown-menu__item:hover),
:global(.mobile-nav-dropdown .el-dropdown-menu__item:focus) {
  color: var(--color-primary);
  background-color: var(--el-color-primary-light-9);
}

:global(.mobile-nav-dropdown .el-dropdown-menu__item .el-icon) {
  color: inherit;
}

:global(.mobile-nav-dropdown .el-dropdown-menu__item.is-divided) {
  margin-top: 8px;
}

/* 平板與手機 */

@media (max-width: 1400px) {
  .desktop-actions {
    display: none;
  }

  .mobile-actions {
    display: flex;
  }
}

@media (min-width: 1401px) and (max-width: 1600px) {
  .account-menu :deep(.el-menu-item) {
    padding: 0 8px;
  }

  .member-info {
    max-width: 120px;
    padding: 0 8px;
  }
}

@media (max-width: 900px) {
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

  .site-footer {
    padding: 16px 12px;
  }

  .portfolio-disclaimer {
    font-size: 12px;
  }

  .site-main {
    padding: 16px 12px;
  }
}
</style>
