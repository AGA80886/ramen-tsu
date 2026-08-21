<template>
  <el-container class="admin-layout">
    <!-- Desktop Sidebar -->
    <el-aside
      v-if="!isMobile"
      class="admin-aside"
      :width="isCollapsed ? '72px' : '240px'"
    >
      <div class="admin-brand">
        <img
          :src="logo"
          alt="拉麵通 Logo"
          class="brand-logo"
          :class="{ 'brand-logo--collapsed': isCollapsed }"
        />
      </div>

      <AdminMenu
        :collapse="isCollapsed"
        :active-path="route.path"
        @navigate="handleNavigate"
      />
    </el-aside>

    <!-- Mobile Drawer -->
    <el-drawer
      v-model="mobileMenuOpen"
      class="admin-mobile-drawer"
      direction="ltr"
      :size="280"
      :with-header="false"
    >
      <div class="mobile-drawer__brand">
        <img
          :src="logo"
          alt="拉麵通 Logo"
          class="brand-logo brand-logo--mobile"
        />
      </div>

      <AdminMenu
        :active-path="route.path"
        @navigate="handleNavigate"
      />
    </el-drawer>

    <!-- Content -->
    <el-container class="admin-content">
      <el-header class="admin-header">
        <div class="header-left">
          <el-button
            text
            circle
            class="menu-toggle"
            :aria-label="isMobile ? '開啟側邊選單' : '展開或收合側邊欄'"
            @click="toggleNavigation"
          >
            <el-icon :size="22">
              <Menu v-if="isMobile" />
              <Expand v-else-if="isCollapsed" />
              <Fold v-else />
            </el-icon>
          </el-button>

          <div class="page-title">
            <span class="page-title__eyebrow">
              ADMIN CONSOLE
            </span>

            <strong>{{ currentPageTitle }}</strong>
          </div>
        </div>

        <div class="header-actions">
          <DarkModeToggle />

          <el-dropdown
            trigger="click"
            placement="bottom-end"
          >
            <button
              type="button"
              class="account-button"
            >
              <span class="account-avatar">
                {{ accountInitial }}
              </span>

              <span class="account-copy">
                <strong>{{ user.account }}</strong>
                <small>Administrator</small>
              </span>

              <el-icon class="account-arrow">
                <ArrowDown />
              </el-icon>
            </button>

            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="router.push('/')">
                  <el-icon>
                    <HomeFilled />
                  </el-icon>
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
        </div>
      </el-header>

      <div class="admin-toolbar">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/admin' }">
            後台管理
          </el-breadcrumb-item>

          <el-breadcrumb-item
            v-if="currentPageTitle !== '後台管理'"
          >
            {{ currentPageTitle }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <el-main class="admin-main">
        <div class="admin-main__inner">
          <router-view />
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import {
  ArrowDown,
  DataBoard,
  Document,
  Expand,
  Fold,
  Goods,
  HomeFilled,
  Menu,
  Shop,
  Tickets,
  UserFilled,
} from '@element-plus/icons-vue'
import { computed, defineComponent, h, onBeforeUnmount, onMounted, ref } from 'vue'
import { ElIcon, ElMenu, ElMenuItem, ElSubMenu } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'

import logo from '@/assets/images/ramen-tsu-logo.png'
import DarkModeToggle from '@/components/common/DarkModeToggle.vue'
import { useLogoutMutation } from '@/queries/auth'
import { useSnackbarStore } from '@/stores/snackbar'
import { useUserStore } from '@/stores/user'

interface AdminMenuProps {
  collapse?: boolean
  activePath: string
}

const route = useRoute()
const router = useRouter()

const user = useUserStore()
const snackbar = useSnackbarStore()

const isCollapsed = ref(false)
const isMobile = ref(false)
const mobileMenuOpen = ref(false)

const navigationItems = [
  {
    index: '/admin',
    title: '儀表板',
    icon: DataBoard,
  },
  {
    index: '/admin/users',
    title: '會員管理',
    icon: UserFilled,
  },
  {
    index: 'products',
    title: '商品管理',
    icon: Goods,
    children: [
      {
        index: '/admin/products',
        title: '商品列表與上下架',
      },
      {
        index: '/admin/products/create',
        title: '新增商品',
      },
    ],
  },
  {
    index: '/admin/orders',
    title: '訂單管理',
    icon: Tickets,
  },
  {
    index: '/admin/articles',
    title: '文章管理',
    icon: Document,
  },
  {
    index: '/admin/shops',
    title: '店家管理',
    icon: Shop,
  },
  {
    index: '/',
    title: '回到前台',
    icon: HomeFilled,
  },
] as const

const AdminMenu = defineComponent({
  name: 'AdminMenu',

  props: {
    collapse: {
      type: Boolean,
      default: false,
    },
    activePath: {
      type: String,
      required: true,
    },
  },

  emits: ['navigate'],

  setup(props: AdminMenuProps, { emit }) {
    const renderIcon = (icon: typeof DataBoard) =>
      h(ElIcon, null, {
        default: () => h(icon),
      })

    return () =>
      h(
        ElMenu,
        {
          router: true,
          collapse: props.collapse,
          defaultActive: props.activePath,
          class: 'admin-menu',
          uniqueOpened: true,
          onSelect: () => emit('navigate'),
        },
        {
          default: () =>
            navigationItems.map(item => {
              if ('children' in item) {
                return h(
                  ElSubMenu,
                  {
                    index: item.index,
                  },
                  {
                    title: () => [
                      renderIcon(item.icon),
                      h('span', item.title),
                    ],
                    default: () =>
                      item.children.map(child =>
                        h(
                          ElMenuItem,
                          {
                            index: child.index,
                          },
                          {
                            default: () => child.title,
                          },
                        ),
                      ),
                  },
                )
              }

              return h(
                ElMenuItem,
                {
                  index: item.index,
                },
                {
                  default: () => [
                    renderIcon(item.icon),
                    h('span', item.title),
                  ],
                },
              )
            }),
        },
      )
  },
})

const currentPageTitle = computed(() => {
  if (typeof route.meta.title === 'string') {
    return route.meta.title
  }

  if (/^\/admin\/products\/[^/]+\/edit$/.test(route.path)) {
    return '編輯商品'
  }

  const pageTitles: Record<string, string> = {
    '/admin': '後台管理',
    '/admin/users': '會員管理',
    '/admin/products': '商品管理',
    '/admin/products/create': '新增商品',
    '/admin/orders': '訂單管理',
    '/admin/articles': '文章管理',
    '/admin/shops': '店家管理',
  }

  return pageTitles[route.path] ?? '後台管理'
})

const accountInitial = computed(() => {
  const account = String(user.account ?? '').trim()
  return account ? account.charAt(0).toUpperCase() : 'A'
})

const logoutMutation = useLogoutMutation()

function checkViewport(): void {
  const nextMobile = window.innerWidth < 900

  if (!nextMobile) {
    mobileMenuOpen.value = false
  }

  isMobile.value = nextMobile
}

function toggleNavigation(): void {
  if (isMobile.value) {
    mobileMenuOpen.value = true
    return
  }

  isCollapsed.value = !isCollapsed.value
}

function handleNavigate(): void {
  if (isMobile.value) {
    mobileMenuOpen.value = false
  }
}

async function logout(): Promise<void> {
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

onMounted(() => {
  checkViewport()
  window.addEventListener('resize', checkViewport)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkViewport)
})
</script>

<style scoped lang="scss">
.admin-layout {
  min-height: 100vh;
  background: var(--el-bg-color-page);
  color: var(--el-text-color-primary);
}

.admin-aside {
  position: sticky;
  z-index: 20;
  top: 0;
  height: 100vh;
  overflow: hidden;
  border-right: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
  transition: width 0.2s ease;
}

.admin-brand,
.mobile-drawer__brand {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 72px;
  padding: 0 10px;
  overflow: hidden;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.brand-logo {
  display: block;
  width: 205px;
  max-width: 100%;
  height: 58px;
  object-fit: contain;
  object-position: center;
  transition: width 0.2s ease, height 0.2s ease;
}

.brand-logo--collapsed {
  width: 58px;
  height: 58px;
}

.brand-logo--mobile {
  width: 220px;
  height: 58px;
}

:deep(.admin-menu) {
  height: calc(100vh - 72px);
  overflow-y: auto;
  border-right: none;
  padding: 10px 8px;
  background: transparent;

  .el-menu-item,
  .el-sub-menu__title {
    height: 46px;
    margin: 3px 0;
    border-radius: 9px;
  }

  .el-menu-item.is-active {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
    font-weight: 600;
  }

  .el-menu-item:hover,
  .el-sub-menu__title:hover {
    background: var(--el-fill-color-light);
  }

  &.el-menu--collapse {
    width: 100%;
  }
}

.admin-content {
  min-width: 0;
  min-height: 100vh;
}

.admin-header {
  position: sticky;
  z-index: 15;
  top: 0;
  display: flex;
  height: 72px;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 0 24px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: color-mix(in srgb, var(--el-bg-color) 94%, transparent);
  backdrop-filter: blur(12px);
}

.header-left,
.header-actions {
  display: flex;
  min-width: 0;
  align-items: center;
}

.header-left {
  gap: 12px;
}

.header-actions {
  gap: 10px;
}

.menu-toggle {
  flex: 0 0 auto;
}

.page-title {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;

  strong {
    overflow: hidden;
    color: var(--el-text-color-primary);
    font-size: 1rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.page-title__eyebrow {
  color: var(--el-color-primary);
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.account-button {
  display: flex;
  align-items: center;
  gap: 9px;
  max-width: 260px;
  padding: 6px 9px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background 0.2s ease;

  &:hover {
    border-color: var(--el-border-color-lighter);
    background: var(--el-fill-color-light);
  }
}

.account-avatar {
  display: grid;
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  place-items: center;
  border-radius: 50%;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-weight: 700;
}

.account-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;

  strong {
    overflow: hidden;
    max-width: 140px;
    color: var(--el-text-color-primary);
    font-size: 0.8125rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  small {
    color: var(--el-text-color-secondary);
    font-size: 0.6875rem;
  }
}

.account-arrow {
  flex: 0 0 auto;
  color: var(--el-text-color-secondary);
}

.admin-toolbar {
  padding: 12px 24px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
}

.admin-main {
  min-width: 0;
  padding: 24px;
  background: var(--el-bg-color-page);
}

.admin-main__inner {
  width: min(100%, 1440px);
  margin: 0 auto;
}

:deep(.admin-mobile-drawer) {
  .el-drawer__body {
    padding: 0;
    background: var(--el-bg-color);
  }
}

@media (max-width: 899px) {
  .admin-header {
    height: 64px;
    padding: 0 16px;
  }

  .page-title__eyebrow {
    display: none;
  }

  .admin-toolbar {
    padding: 10px 16px;
  }

  .admin-main {
    padding: 18px 16px 24px;
  }

  .mobile-drawer__brand {
    height: 64px;
  }

  :deep(.admin-menu) {
    height: calc(100vh - 64px);
  }
}

@media (max-width: 640px) {
  .admin-header {
    gap: 10px;
    padding: 0 12px;
  }

  .header-left {
    gap: 6px;
  }

  .header-actions {
    gap: 4px;
  }

  .page-title strong {
    max-width: 130px;
    font-size: 0.9375rem;
  }

  .account-copy,
  .account-arrow {
    display: none;
  }

  .account-button {
    padding: 4px;
  }

  .admin-toolbar {
    overflow-x: auto;
    padding: 9px 12px;

    :deep(.el-breadcrumb) {
      width: max-content;
      white-space: nowrap;
    }
  }

  .admin-main {
    padding: 16px 12px 24px;
  }
}

@media (max-width: 390px) {
  .page-title strong {
    max-width: 105px;
  }

  .account-avatar {
    width: 30px;
    height: 30px;
    flex-basis: 30px;
    font-size: 0.75rem;
  }
}
</style>
