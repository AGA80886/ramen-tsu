<template>
  <el-card
    class="product-card"
    shadow="hover"
  >
    <el-image
      class="product-image"
      fit="cover"
      :src="imageUrl"
    />

    <template #header>
      <router-link
        class="product-title"
        :to="`/product/${_id}`"
      >
        {{ name }}
      </router-link>
    </template>

    <div class="product-meta">
      {{ category }}／{{ formattedPrice }}
    </div>
    <p class="product-description">
      {{ description }}
    </p>

    <el-button
      class="add-cart-button"
      type="primary"
      plain
      @click="addCart"
    >
      <el-icon><ShoppingCart /></el-icon>
      加入購物車
    </el-button>
  </el-card>
</template>

<script setup lang="ts">
import type { IProduct } from '@/types/product'
import { ShoppingCart } from '@element-plus/icons-vue'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAddCartItemMutation } from '@/queries/cart'
import { useSnackbarStore } from '@/stores/snackbar'
import { useUserStore } from '@/stores/user'

const props = defineProps<IProduct>()
const user = useUserStore()
const router = useRouter()
const snackbar = useSnackbarStore()
const addCartItemMutation = useAddCartItemMutation()

const formattedPrice = computed(() =>
  new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    maximumFractionDigits: 0,
  }).format(props.price),
)

async function addCart () {
  try {
    if (!user.isLoggedIn) {
      await router.push('/login')
      return
    }


    await addCartItemMutation.mutateAsync({
  product: props._id,
  quantity: 1,
  replace: false,
})
    snackbar.add({ text: '加入購物車成功', color: 'green' })
  } catch (error) {
    snackbar.addError(error)
  }
}
</script>

<style scoped>
.product-card { height: 100%; }
.product-image { width: 100%; height: 200px; }
.product-title { color: var(--el-color-primary); font-size: 18px; font-weight: 700; text-decoration: none; }
.product-meta { color: var(--el-text-color-secondary); margin-bottom: 12px; }
.product-description { height: 72px; margin: 0 0 16px; overflow: hidden; white-space: pre-line; }
.add-cart-button { width: 100%; }
</style>
