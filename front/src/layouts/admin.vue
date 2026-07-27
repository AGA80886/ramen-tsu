<template>
  <el-container class="admin-layout">
    <el-aside class="admin-aside" width="240px">
      <div class="account-panel">
        <Avatar :colors="['#b5f4bc','#fff19e','#ffdc8a','#ffba6b','#ff6543']" :name="user.account" :size="40" variant="beam" />
        <strong>{{ user.account }}</strong>
      </div>
      <el-menu router :default-active="$route.path">
        <el-menu-item v-for="nav in navs" :key="nav.to" :index="nav.to">
          <el-icon><component :is="nav.icon" /></el-icon>
          <span>{{ nav.title }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-main class="admin-main"><router-view /></el-main>
  </el-container>
</template>

<script setup lang="ts">
import Avatar from 'vue-boring-avatars'
import { Collection, Goods, HomeFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const user = useUserStore()
const navs = [
  { title: '商品管理', to: '/admin/product', icon: Goods },
  { title: '訂單管理', to: '/admin/order', icon: Collection },
  { title: '回首頁', to: '/', icon: HomeFilled },
]
</script>

<style scoped>
.admin-layout { min-height: 100vh; }
.admin-aside { border-right: 1px solid var(--el-border-color-light); }
.account-panel { align-items: center; display: flex; gap: 12px; padding: 20px; }
.admin-main { padding: 28px; }
</style>
