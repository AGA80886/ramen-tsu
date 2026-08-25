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
            class="btn btn-outline-primary"
            @click.stop="openProduct"
          >
            查看商品
          </button>

          <button
            type="button"
            class="btn btn-primary"
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

<style scoped lang="scss">
.product-card {
  display: flex;
  min-width: 0;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: var(--color-background);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover,
  &:focus-visible {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgb(0 0 0 / 10%);
  }

  &:focus-visible {
    outline: 2px solid var(--el-color-primary);
    outline-offset: 3px;
  }
}

/* 商品圖片 + 分類標籤 */
.product-card__cover {
  position: relative;
  overflow: hidden;
  width: 100%;
  aspect-ratio: 16 / 9;
  flex-shrink: 0;

  :deep(.el-image) {
    display: block;
    width: 100%;
    height: 100%;
  }
}

/* 與論壇文章相同：左上角黑色透明標籤 */
.product-card__category {
  position: absolute;
  z-index: 2;
  top: 14px;
  left: 14px;
  padding: 6px 12px;
  border: 0;
  border-radius: 999px;
  background: rgb(0 0 0 / 68%);
  color: #fff;
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.2;
}

/* 圖片載入失敗 */
.product-card__image-error {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  background: #f3f3f3;
  color: var(--color-text-secondary);
}

/* 商品內容 */
.product-card__body {
  display: flex;
  min-height: 330px;
  flex: 1;
  flex-direction: column;
  padding: 20px;
}

.product-card__content {
  min-width: 0;
}

.product-card__content h2 {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  color: var(--color-text);
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.5;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

/* 商品描述最多 3 行，超過顯示 …… */
.product-card__description {
  display: -webkit-box;
  overflow: hidden;
  margin: 12px 0 0;
  color: var(--color-text-secondary);
  line-height: 1.7;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
}

/* 價格與按鈕固定在卡片底部 */
.product-card__footer {
  display: flex;
  flex-direction: column;
  margin-top: auto;
  padding-top: 20px;
}

.product-card__price {
  display: flex;
  gap: 4px;
  align-items: baseline;
  margin: 0;
  font-size: 1rem;
}

.product-card__price strong {
  font-size: 1.05rem;
  font-weight: 600;
}

.product-card__actions {
  display: flex;
  gap: 10px;
  align-items: stretch;
  width: 100%;
  margin-top: 14px;
}

.product-card__actions .btn {
  display: inline-flex;
  min-height: 48px;
  align-items: center;
  justify-content: center;
  margin: 0 !important;
  border-radius: 12px;
  white-space: nowrap;
}

.product-card__actions .btn-outline-primary {
  flex: 0 0 auto;
}

.product-card__actions .btn-primary {
  flex: 1;
}

.product-card__actions .el-icon {
  margin-right: 5px;
}

@media (max-width: 640px) {
  .product-card__body {
    min-height: auto;
  }

  .product-card__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .product-card__actions .btn {
    width: 100%;
  }
}
</style>

