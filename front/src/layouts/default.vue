<template>
  <el-container class="site-layout">
    <el-header class="site-header">
      <div class="header-inner">
        <router-link class="brand" to="/">購物網站</router-link>
        <el-menu class="nav-menu" mode="horizontal" :ellipsis="false" router>
          <template v-for="nav in navs" :key="nav.to">
            <el-menu-item v-if="nav.show" :index="nav.to">
              <el-icon><component :is="nav.icon" /></el-icon>
              <span>{{ nav.title }}</span>
              <el-badge v-if="nav.to === '/user/cart'" class="cart-badge" :value="user.cart" :hidden="user.cart === 0" />
            </el-menu-item>
          </template>
          <el-menu-item v-if="user.isLoggedIn" index="logout" @click="logout">
            <el-icon><SwitchButton /></el-icon>
            <span>登出</span>
          </el-menu-item>
        </el-menu>
      </div>
    </el-header>

    <el-main class="site-main">
      <router-view :key="$route.fullPath" />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Collection, Goods, HomeFilled, Lock, Setting, ShoppingCart, SwitchButton, UserFilled } from '@element-plus/icons-vue'
import { useLogoutMutation } from '@/queries/auth'
import { useSnackbarStore } from '@/stores/snackbar'
import { useUserStore } from '@/stores/user'

const user = useUserStore()
const router = useRouter()
const snackbar = useSnackbarStore()

const navs = computed(() => [
  { title: '首頁', to: '/', icon: HomeFilled, show: true },
  { title: '註冊', to: '/register', icon: UserFilled, show: !user.isLoggedIn },
  { title: '登入', to: '/login', icon: Lock, show: !user.isLoggedIn },
  { title: '購物車', to: '/user/cart', icon: ShoppingCart, show: user.isLoggedIn },
  { title: '訂單', to: '/user/orders', icon: Collection, show: user.isLoggedIn },
  { title: '管理', to: '/admin', icon: Setting, show: user.isLoggedIn && user.isAdmin },
])

async function logout () {
  await useLogoutMutation().mutateAsync()
  await router.push('/')
  snackbar.add({ text: '登出成功', color: 'green' })
}
</script>

<style scoped>
.site-layout { min-height: 100vh; }
.site-header { border-bottom: 1px solid var(--el-border-color-light); padding: 0; }
.header-inner { align-items: center; display: flex; margin: 0 auto; max-width: 1200px; padding: 0 20px; }
.brand { color: var(--el-text-color-primary); font-size: 22px; font-weight: 700; text-decoration: none; white-space: nowrap; }
.nav-menu { border-bottom: none; flex: 1; justify-content: flex-end; }
.cart-badge { margin-left: 8px; }
.site-main { margin: 0 auto; max-width: 1240px; width: 100%; }
</style>
