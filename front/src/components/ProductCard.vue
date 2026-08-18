<template>
  <article
    class="product-card"
    tabindex="0"
    role="link"
    @click="openProduct"
    @keydown.enter="openProduct"
    @keydown.space.prevent="openProduct"
  >
    <div class="product-card__cover">
      <el-image
        :src="product.imageUrl"
        :alt="product.name"
        fit="cover"
        lazy
      >
        <template #error>
          <div class="product-card__image-error">
            圖片載入失敗
          </div>
        </template>
      </el-image>

      <el-tag
        class="product-card__category"
        effect="dark"
        type="primary"
      >
        {{ product.category }}
      </el-tag>
    </div>

    <div class="product-card__body">
      <div class="product-card__content">
        <h2>
          {{ product.name }}
        </h2>

        <p class="product-card__description">
          {{ product.description }}
        </p>
      </div>

      <div class="product-card__footer">
        <div class="product-card__price">
          <span>售價</span>

          <strong>
            {{ formatCurrency(product.price) }}
          </strong>
        </div>

        <div class="product-card__actions">
          <button
            type="button"
            class="btn btn-outline-primary me-2 mt-2"
            @click.stop="openProduct"
          >
            查看商品
          </button>

          <button
            type="button"
            class="btn btn-primary ms-2 mt-2"
            :disabled="isAddingToCart"
            @click.stop="addToCart"
          >
            <el-icon v-if="!isAddingToCart">
              <ShoppingCart />
            </el-icon>

            {{
              isAddingToCart
                ? '加入中...'
                : '加入購物車'
            }}
          </button>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { IProduct } from '@/types/products'

import { computed } from 'vue'
import { ShoppingCart } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

import { useAddCartItemMutation } from '@/queries/cart'
import { useSnackbarStore } from '@/stores/snackbar'
import { useUserStore } from '@/stores/user'

const props = defineProps<{
  product: IProduct
}>()

const router = useRouter()
const snackbar = useSnackbarStore()
const user = useUserStore()

const addCartItemMutation =
  useAddCartItemMutation()

const isAddingToCart = computed(
  () => addCartItemMutation.isLoading.value,
)

function formatCurrency(
  value: number,
): string {
  return new Intl.NumberFormat(
    'zh-TW',
    {
      style: 'currency',
      currency: 'TWD',
      maximumFractionDigits: 0,
    },
  ).format(value)
}

async function openProduct():
Promise<void> {
  await router.push(
    `/products/${props.product._id}`,
  )
}

async function addToCart():
Promise<void> {
  if (isAddingToCart.value) {
    return
  }

  if (!user.isLoggedIn) {
    await router.push({
      path: '/login',
      query: {
        redirect:
          `/product/${props.product._id}`,
      },
    })

    return
  }

  try {
    await addCartItemMutation.mutateAsync({
      product: props.product._id,
      quantity: 1,
      replace: false,
    })

    snackbar.add({
      text: `${props.product.name} 已加入購物車`,
      color: 'success',
    })
  } catch (error) {
    snackbar.addError(error)
  }
}
</script>
