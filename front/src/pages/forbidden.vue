<template>
  <main class="error-page">
    <el-result
      sub-title="你的帳號沒有瀏覽此頁面的權限。"
      title="403 權限不足"
    >
      <template #extra>
        <el-button
          type="primary"
          @click="router.replace('/')"
        >
          返回首頁
        </el-button>
      </template>
    </el-result>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped>
.error-page {
  display: grid;
  min-height: 60vh;
  place-items: center;
}
</style>

<route lang="yaml">
meta:
  title: 權限不足
  access: public
</route>
