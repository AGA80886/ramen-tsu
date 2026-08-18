<template>
  <main class="product-detail-page">
    <div class="product-detail-container">
      <button
        type="button"
        class="back-link"
        @click="goBackToStore"
      >
        <el-icon>
          <ArrowLeft />
        </el-icon>
        返回拉麵商城
      </button>

      <section
        v-if="isLoading"
        class="detail-state"
      >
        <el-skeleton
          animated
          :rows="8"
        />
      </section>

      <section
        v-else-if="error || !product"
        class="detail-state detail-state--error"
      >
        <div class="detail-state__icon">
          !
        </div>

        <h1>找不到這項商品</h1>

        <p>
          商品可能已下架、不存在，或目前暫時無法讀取。
        </p>

        <button
          type="button"
          class="btn btn-primary"
          @click="goBackToStore"
        >
          回到拉麵商城
        </button>
      </section>

      <template v-else>
        <section class="product-detail">
          <div class="product-detail__media">
            <el-image
              class="product-image"
              :src="product.imageUrl"
              :alt="product.name"
              fit="cover"
              :preview-src-list="[product.imageUrl]"
              preview-teleported
            >
              <template #error>
                <div class="product-image__fallback">
                  圖片載入失敗
                </div>
              </template>
            </el-image>
          </div>

          <div class="product-detail__content">
            <p class="product-detail__eyebrow">
              RAMEN STORE
            </p>

            <el-tag
              effect="plain"
              type="primary"
              class="category-tag"
            >
              {{ product.category }}
            </el-tag>

            <h1>
              {{ product.name }}
            </h1>

            <p class="product-description">
              {{ product.description }}
            </p>

            <div class="product-price">
              <span>售價</span>

              <strong>
                {{ formatCurrency(product.price) }}
              </strong>
            </div>

            <div class="purchase-panel">
              <div class="quantity-control">
                <span>購買數量</span>

                <el-input-number
                  v-model="quantity"
                  :min="1"
                  :max="99"
                  :step="1"
                  :precision="0"
                  controls-position="right"
                />
              </div>

              <div class="purchase-summary">
                <span>小計</span>

                <strong>
                  {{ formatCurrency(subtotal) }}
                </strong>
              </div>

              <button
                type="button"
                class="btn btn-primary add-cart-button"
                :disabled="isAddingToCart"
                @click="addToCart"
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

            <div class="product-notice">
              <div>
                <el-icon>
                  <CircleCheck />
                </el-icon>

                <span>
                  此商品目前可於拉麵商城購買。
                </span>
              </div>

              <div>
                <el-icon>
                  <Lock />
                </el-icon>

                <span>
                  加入購物車前需要先登入會員。
                </span>
              </div>
            </div>
          </div>
        </section>

        <section class="product-information">
          <div class="section-heading">
            <p>PRODUCT INFORMATION</p>
            <h2>商品資訊</h2>
          </div>

          <dl class="information-list">
            <div>
              <dt>商品分類</dt>
              <dd>{{ product.category }}</dd>
            </div>

            <div>
              <dt>商品價格</dt>
              <dd>{{ formatCurrency(product.price) }}</dd>
            </div>

            <div class="information-list__full">
              <dt>商品說明</dt>
              <dd class="pre-wrap">
                {{ product.description }}
              </dd>
            </div>
          </dl>
        </section>
      </template>
    </div>
  </main>
</template>

<script setup lang="ts">
import {
  ArrowLeft,
  CircleCheck,
  Lock,
  ShoppingCart,
} from '@element-plus/icons-vue'
import {
  computed,
  ref,
} from 'vue'
import {
  useRoute,
  useRouter,
} from 'vue-router'

import { useAddCartItemMutation } from '@/queries/cart'
import { useProductByIdQuery } from '@/queries/products'
import { useSnackbarStore } from '@/stores/snackbar'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const snackbar = useSnackbarStore()
const user = useUserStore()

const productId = () =>
  String(route.params.id ?? '')

const {
  data: product,
  isLoading,
  error,
} = useProductByIdQuery(productId)

const addCartItemMutation =
  useAddCartItemMutation()

const quantity = ref(1)

const isAddingToCart = computed(
  () => addCartItemMutation.isLoading.value,
)

const subtotal = computed(
  () =>
    (product.value?.price ?? 0)
    * quantity.value,
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

async function goBackToStore():
Promise<void> {
  await router.push('/online-store')
}

async function addToCart():
Promise<void> {
  if (
    !product.value
    || isAddingToCart.value
  ) {
    return
  }

  if (!user.isLoggedIn) {
    await router.push({
      path: '/login',
      query: {
        redirect: route.fullPath,
      },
    })

    return
  }

  const safeQuantity =
    Number(quantity.value)

  if (
    !Number.isInteger(safeQuantity)
    || safeQuantity < 1
  ) {
    snackbar.add({
      text: '商品數量格式錯誤',
      color: 'error',
    })

    return
  }

  try {
    await addCartItemMutation
      .mutateAsync({
        product: product.value._id,
        quantity: safeQuantity,
        replace: false,
      })

    snackbar.add({
      text: `${product.value.name} 已加入購物車`,
      color: 'success',
    })
  } catch (submitError) {
    snackbar.addError(submitError)
  }
}
</script>

<style scoped lang="scss">
.product-detail-page {
  min-height: 100%;
  background:
    var(--color-background);
}

.product-detail-container {
  display: grid;
  width: min(100%, 1200px);
  gap: 28px;
  margin: 0 auto;
  padding:
    28px 20px
    64px;
}

.back-link {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: 6px;
  padding: 0;
  border: 0;
  background: transparent;
  color:
    var(--color-text-secondary);
  font-size: 0.9rem;
  cursor: pointer;

  &:hover {
    color:
      var(--el-color-primary);
  }
}

.detail-state {
  display: grid;
  min-height: 420px;
  place-items: center;
  align-content: center;
  padding: 48px 24px;
  border:
    1px solid
    var(--color-border);
  border-radius: 16px;
  background:
    var(--color-background);
  text-align: center;

  h1 {
    margin: 16px 0 8px;
    color:
      var(--color-text-primary);
    font-size: 1.5rem;
  }

  p {
    max-width: 520px;
    margin: 0 0 20px;
    color:
      var(--color-text-secondary);
    line-height: 1.7;
  }
}

.detail-state__icon {
  display: grid;
  width: 54px;
  height: 54px;
  place-items: center;
  border-radius: 50%;
  background:
    var(--el-color-danger-light-9);
  color:
    var(--el-color-danger);
  font-size: 1.4rem;
  font-weight: 700;
}

.product-detail {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    minmax(0, 1fr);
  gap:
    clamp(
      32px,
      5vw,
      64px
    );
  align-items: start;
}

.product-detail__media {
  position: sticky;
  top: 96px;
}

.product-image {
  width: 100%;
  overflow: hidden;
  aspect-ratio: 1 / 1;
  border:
    1px solid
    var(--color-border);
  border-radius: 18px;
  background:
    var(--el-fill-color-light);
}

.product-image__fallback {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  color:
    var(--color-text-secondary);
}

.product-detail__content {
  min-width: 0;

  h1 {
    margin: 14px 0 14px;
    color:
      var(--color-text-primary);
    font-size:
      clamp(
        1.9rem,
        4vw,
        2.8rem
      );
    line-height: 1.25;
  }
}

.product-detail__eyebrow {
  margin: 0 0 10px;
  color:
    var(--el-color-primary);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.category-tag {
  margin-top: 2px;
}

.product-description {
  margin: 0;
  color:
    var(--color-text-secondary);
  font-size: 1rem;
  line-height: 1.9;
  white-space: pre-wrap;
}

.product-price {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-top: 28px;
  padding:
    20px 0;
  border-top:
    1px solid
    var(--color-border);
  border-bottom:
    1px solid
    var(--color-border);

  span {
    color:
      var(--color-text-secondary);
    font-size: 0.875rem;
  }

  strong {
    color:
      var(--el-color-primary);
    font-size:
      clamp(
        1.7rem,
        4vw,
        2.25rem
      );
    line-height: 1.1;
  }
}

.purchase-panel {
  display: grid;
  gap: 16px;
  margin-top: 24px;
  padding: 20px;
  border:
    1px solid
    var(--color-border);
  border-radius: 14px;
  background:
    var(--el-fill-color-extra-light);
}

.quantity-control,
.purchase-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  > span {
    color:
      var(--color-text-secondary);
    font-size: 0.875rem;
  }
}

.purchase-summary {
  padding-top: 14px;
  border-top:
    1px solid
    var(--color-border);

  strong {
    color:
      var(--color-text-primary);
    font-size: 1.15rem;
  }
}

.add-cart-button {
  display: inline-flex;
  width: 100%;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  gap: 7px;
}

.product-notice {
  display: grid;
  gap: 10px;
  margin-top: 18px;

  div {
    display: flex;
    align-items: center;
    gap: 8px;
    color:
      var(--color-text-secondary);
    font-size: 0.82rem;
  }

  .el-icon {
    flex: 0 0 auto;
    color:
      var(--el-color-success);
  }
}

.product-information {
  margin-top: 8px;
  padding-top: 32px;
  border-top:
    1px solid
    var(--color-border);
}

.section-heading {
  margin-bottom: 20px;

  p {
    margin: 0;
    color:
      var(--el-color-primary);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.12em;
  }

  h2 {
    margin: 6px 0 0;
    color:
      var(--color-text-primary);
    font-size: 1.35rem;
  }
}

.information-list {
  display: grid;
  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );
  gap: 0 28px;
  margin: 0;

  > div {
    display: grid;
    grid-template-columns:
      110px
      minmax(0, 1fr);
    gap: 16px;
    padding: 16px 0;
    border-bottom:
      1px solid
      var(--color-border);
  }

  dt {
    color:
      var(--color-text-secondary);
    font-size: 0.85rem;
    font-weight: 600;
  }

  dd {
    margin: 0;
    color:
      var(--color-text-primary);
    line-height: 1.7;
  }
}

.information-list__full {
  grid-column: 1 / -1;
}

.pre-wrap {
  white-space: pre-wrap;
}

@media (max-width: 900px) {
  .product-detail {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .product-detail__media {
    position: static;
  }

  .product-image {
    aspect-ratio: 4 / 3;
  }
}

@media (max-width: 640px) {
  .product-detail-container {
    gap: 20px;
    padding:
      20px 16px
      44px;
  }

  .product-image {
    aspect-ratio: 1 / 1;
    border-radius: 14px;
  }

  .product-price {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
  }

  .quantity-control,
  .purchase-summary {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }

  .quantity-control :deep(.el-input-number) {
    width: 100%;
  }

  .information-list {
    grid-template-columns: 1fr;

    > div,
    .information-list__full {
      grid-column: auto;
    }

    > div {
      grid-template-columns: 1fr;
      gap: 6px;
    }
  }
}
</style>

<route lang="yaml">
meta:
  title: 商品詳細
</route>
