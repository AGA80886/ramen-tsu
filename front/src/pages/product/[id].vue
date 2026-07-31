<template>
  <div v-if="product" class="product-page">
    <el-row :gutter="24">
      <el-col :xs="24" :md="12">
        <el-image class="detail-image" fit="cover" :src="product.imageUrl" />
      </el-col>
      <el-col :xs="24" :md="12">
        <h1>{{ product.name }}</h1>
        <el-tag>{{ product.category }}</el-tag>
        <p class="description">{{ product.description }}</p>
        <el-select v-model="quantity" placeholder="選擇數量" style="width: 100%">
          <el-option v-for="option in quantityOptions" :key="option" :label="option" :value="option" />
        </el-select>
        <el-button class="cart-button" type="primary" plain @click="addCart">
          <el-icon><ShoppingCart /></el-icon>
          加入購物車
        </el-button>
      </el-col>
    </el-row>

    <div v-if="!product.sell" class="sold-out-overlay">
      <el-result icon="warning" title="商品已下架">
        <template #extra><el-button type="primary" @click="router.push('/')">回首頁</el-button></template>
      </el-result>
    </div>
  </div>
  <el-skeleton v-else :rows="8" animated />
</template>

<script setup lang="ts">
import { ShoppingCart } from '@element-plus/icons-vue'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGetIdQuery } from '@/queries/product'
import { useAddCartMutation } from '@/queries/user'
import { useSnackbarStore } from '@/stores/snackbar'
import { useUserStore } from '@/stores/user'

const quantity = ref(1)
const quantityOptions = Array.from({ length: 20 }, (_, idx) => idx + 1)
const router = useRouter()
const user = useUserStore()
const snackbar = useSnackbarStore()
const { data: product, error } = useGetIdQuery()

watch(error, e => { if (e) router.push('/') })
watch(product, () => { if (product.value) document.title = product.value.name }, { immediate: true })

async function addCart () {
  try {
    if (!user.isLoggedIn) {
      await router.push('/login')
      return
    }
    await useAddCartMutation().mutateAsync({ product: product.value!._id, quantity: quantity.value, replace: false })
    snackbar.add({ text: '加入購物車成功', color: 'green' })
  } catch (error) { snackbar.addError(error) }
}
</script>

<style scoped>
.product-page { padding: 24px 0; position: relative; }
.detail-image { border-radius: 8px; height: 420px; width: 100%; }
.description { line-height: 1.8; min-height: 180px; white-space: pre-line; }
.cart-button { margin-top: 16px; width: 100%; }
.sold-out-overlay { align-items: center; background: rgb(255 255 255 / 88%); display: flex; inset: 0; justify-content: center; position: fixed; z-index: 2000; }
</style>

<route lang="yaml">
meta:
  title: 商品
</route>
