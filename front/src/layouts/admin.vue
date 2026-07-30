<template>
  <el-container class="admin-layout">
    <!-- 側邊導覽列 -->
    <el-aside
      class="admin-aside"
      :width="isCollapsed ? '64px' : '240px'"
    >
      <!-- Logo -->
      <div class="admin-brand">
        <img
          :src="logo"
          alt="Ramen-Tsu-Logo"
          class="brand-logo"
        />

        <span
          v-show="!isCollapsed"
          class="brand-name"
        >
          拉麵通
        </span>
      </div>




      <!-- 後台選單 -->
      <el-menu
        router
        :collapse="isCollapsed"
        :default-active="$route.path"
        class="admin-menu"
      >
        <el-menu-item index="/admin">
          <el-icon>
            <DataBoard />
          </el-icon>

          <template #title>
            儀表板
          </template>
        </el-menu-item>

        <el-menu-item index="/admin/users">
          <el-icon>
            <UserFilled />
          </el-icon>

          <template #title>
            會員管理
          </template>
        </el-menu-item>

        <el-sub-menu index="products">
          <template #title>
            <el-icon>
              <Goods />
            </el-icon>

            <span>商品管理</span>
          </template>

          <el-menu-item index="/admin/products">
            商品列表與上下架
          </el-menu-item>

          <el-menu-item index="/admin/products/create">
            新增商品
          </el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/admin/orders">
          <el-icon>
            <Tickets />
          </el-icon>

          <template #title>
            訂單管理
          </template>
        </el-menu-item>

        <el-menu-item index="/">
          <el-icon>
            <HomeFilled />
          </el-icon>

          <template #title>
            回到前台
          </template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 右側內容 -->
    <el-container class="admin-content">
      <!-- Header -->
      <el-header class="admin-header">
        <div class="header-left">
          <el-button
            text
            circle
            aria-label="展開或收合側邊欄"
            @click="isCollapsed = !isCollapsed"
          >
            <el-icon :size="22">
              <Expand v-if="isCollapsed" />
              <Fold v-else />
            </el-icon>
          </el-button>

          <div class="page-title">
            <h1>{{ currentPageTitle }}</h1>
            <span>拉麵通後台管理系統</span>
          </div>
        </div>

        <div class="header-actions">
          <el-dropdown trigger="click">
            <el-button
              text
              class="account-button"
            >
              <el-icon>
                <User />
              </el-icon>

              <span class="account-name">
                {{ user.account }}
              </span>

              <el-icon>
                <ArrowDown />
              </el-icon>
            </el-button>

            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="router.push('/')">
                  回到前台
                </el-dropdown-item>

                <el-dropdown-item
                  divided
                  @click="logout"
                >
                  登出
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <DarkModeToggle />
        </div>
      </el-header>

      <!-- 麵包屑 -->
      <div class="admin-toolbar">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/admin' }">
            後台管理
          </el-breadcrumb-item>

          <el-breadcrumb-item v-if="currentPageTitle !== '儀表板'">
            {{ currentPageTitle }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <!-- 子頁面 -->
      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import logo from '../assets/images/logo.png'

import {
  ArrowDown,
  DataBoard,
  Expand,
  Fold,
  Goods,
  HomeFilled,
  Tickets,
  User,
  UserFilled,
} from '@element-plus/icons-vue'

import DarkModeToggle from '@/components/layout/frontend/DarkModeToggle.vue'
import { useUserStore } from '@/stores/user'
import { useSnackbarStore } from '@/stores/snackbar'
import { useLogoutMutation } from '@/queries/auth'

const route = useRoute()
const router = useRouter()

const user = useUserStore()
const snackbar = useSnackbarStore()

const isCollapsed = ref(false)

const pageTitles: Record<string, string> = {
  '/admin': '儀表板',
  '/admin/users': '會員管理',
  '/admin/products': '商品管理',
  '/admin/products/create': '新增商品',
  '/admin/orders': '訂單管理',
}

const currentPageTitle = computed(() => {
  return pageTitles[route.path] ?? '後台管理'
})

const logoutMutation = useLogoutMutation()

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
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background-color: var(--el-bg-color-page);
}

/* Aside */

.admin-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  height: 64px;
}

.brand-logo {
  width: 52px;
  height: 52px;
  object-fit: contain;
}

.brand-name {
  font-size: 18px;
  font-weight: 700;
}

.admin-menu {
  border-right: none;
}

/* Content */

.admin-content {
  min-width: 0;
}

.admin-header {
  position: sticky;
  z-index: 10;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 24px;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
}

.header-left,
.header-actions {
  display: flex;
  align-items: center;
}

.header-left {
  gap: 14px;
}

.header-actions {
  gap: 12px;
}

.page-title h1 {
  margin: 0;
  color: var(--el-text-color-primary);
  font-size: 18px;
}

.page-title span {
  display: block;
  margin-top: 3px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.account-button {
  display: flex;
  align-items: center;
  gap: 6px;
}

.admin-toolbar {
  padding: 16px 24px;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.admin-main {
  padding: 24px;
  background-color: var(--el-bg-color-page);
}

/* 平板與手機 */

@media (max-width: 768px) {
  .admin-aside {
    width: 64px !important;
  }

  .admin-header {
    padding: 0 12px;
  }

  .admin-main {
    padding: 16px;
  }

  .admin-toolbar {
    padding: 12px 16px;
  }

  .page-title span,
  .account-name {
    display: none;
  }
}
</style>
