<template>
  <section class="cart-page">
    <header class="cart-page__header">
      <h1>購物車</h1>
      <p>確認商品數量與金額，再進入結帳流程。</p>
    </header>

    <AppLoading
      :loading="isLoading"
      text="正在載入購物車..."
      min-height="360px"
    >
      <AppCard
        v-if="error"
        class="cart-state"
      >
        <AppEmpty description="無法取得購物車資料">
          <AppButton
            :loading="isReloading"
            @click="reloadCart"
          >
            重新載入
          </AppButton>
        </AppEmpty>
      </AppCard>

      <AppCard
        v-else-if="validCartItems.length === 0"
        class="cart-state"
      >
        <el-alert
          v-if="invalidItemCount > 0"
          class="invalid-cart-alert"
          type="warning"
          :closable="false"
          show-icon
          title="購物車內有已不存在的商品"
          description="失效商品不會列入金額計算，請重新整理或聯絡管理員協助處理。"
        />

        <AppEmpty description="購物車目前沒有可購買的商品">
          <AppButton @click="goShopping">
            繼續購物
          </AppButton>
        </AppEmpty>
      </AppCard>

      <template v-else>
        <el-alert
          v-if="invalidItemCount > 0"
          class="invalid-cart-alert"
          type="warning"
          :closable="false"
          show-icon
          :title="`購物車內有 ${invalidItemCount} 項商品已不存在`"
          description="失效商品不會列入金額計算，也不能進入結帳流程。"
        />

        <div class="cart-layout">
          <AppCard
            class="cart-items-card"
            title="商品清單"
          >
            <div
              v-for="item in validCartItems"
              :key="item._id"
              class="cart-item"
            >
              <RouterLink
                class="cart-item__image-link"
                :to="`/product/${item.product._id}`"
              >
                <el-image
                  class="cart-item__image"
                  fit="cover"
                  :src="item.product.imageUrl || item.product.image"
                >
                  <template #error>
                    <div class="cart-item__image-error">
                      圖片載入失敗
                    </div>
                  </template>
                </el-image>
              </RouterLink>

              <div class="cart-item__content">
                <RouterLink
                  class="cart-item__name"
                  :to="`/product/${item.product._id}`"
                >
                  {{ item.product.name }}
                </RouterLink>

                <p class="cart-item__category">
                  {{ item.product.category }}
                </p>

                <p class="cart-item__price">
                  單價：{{ formatCurrency(item.product.price) }}
                </p>
              </div>

              <div class="cart-item__quantity">
                <span class="cart-item__label">數量</span>

                <el-input-number
                  :model-value="item.quantity"
                  :min="1"
                  :max="99"
                  :disabled="isMutatingCart"
                  @change="
                    updateQuantity(
                      item.product._id,
                      $event,
                      item.quantity,
                    )
                  "
                />
              </div>

              <div class="cart-item__subtotal">
                <span class="cart-item__label">小計</span>
                <strong>
                  {{
                    formatCurrency(
                      item.product.price * item.quantity,
                    )
                  }}
                </strong>
              </div>

              <el-button
                class="cart-item__remove"
                type="danger"
                plain
                :loading="
                  pendingProductId === item.product._id &&
                    isMutatingCart
                "
                :disabled="isMutatingCart"
                @click="removeItem(
                  item.product._id,
                  item.product.name,
                )"
              >
                移除
              </el-button>
            </div>
          </AppCard>

          <aside class="cart-summary">
            <AppCard title="訂單摘要">
              <dl class="summary-list">
                <div>
                  <dt>商品種類</dt>
                  <dd>{{ validCartItems.length }}</dd>
                </div>

                <div>
                  <dt>商品總數</dt>
                  <dd>{{ totalQuantity }}</dd>
                </div>

                <div class="summary-list__total">
                  <dt>總金額</dt>
                  <dd>{{ formatCurrency(totalPrice) }}</dd>
                </div>
              </dl>

              <div class="summary-actions">
                <AppButton
                  class="summary-button"
                  type="default"
                  @click="goShopping"
                >
                  繼續購物
                </AppButton>

                <AppButton
                  class="summary-button"
                  disabled
                >
                  前往結帳（下一階段）
                </AppButton>
              </div>

              <p
                v-if="invalidItemCount > 0"
                class="summary-hint"
              >
                請先處理失效商品，才能進入結帳流程。
              </p>
            </AppCard>
          </aside>
        </div>
      </template>
    </AppLoading>
  </section>
</template>

<script setup lang="ts">
import type { ICartItem } from '@/types/cart'

import { computed, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

import {
  useAddCartItemMutation,
  useCartItemsQuery,
} from '@/queries/cart'
import { useSnackbarStore } from '@/stores/snackbar'

type ValidCartItem = Omit<ICartItem, 'product'> & {
  product: NonNullable<ICartItem['product']>
}

const router = useRouter()
const snackbar = useSnackbarStore()

const {
  data: cartItems,
  error,
  isLoading,
  refetch,
} = useCartItemsQuery()

const addCartItemMutation = useAddCartItemMutation()

const isReloading = ref(false)
const pendingProductId = ref('')

const validCartItems = computed<ValidCartItem[]>(() => {
  return (cartItems.value ?? []).filter(
    (item): item is ValidCartItem =>
      item.product !== null,
  )
})

const invalidItemCount = computed(() => {
  return (cartItems.value ?? []).filter(
    item => item.product === null,
  ).length
})

const totalQuantity = computed(() => {
  return validCartItems.value.reduce(
    (total, item) => total + item.quantity,
    0,
  )
})

const totalPrice = computed(() => {
  return validCartItems.value.reduce(
    (total, item) =>
      total + item.product.price * item.quantity,
    0,
  )
})

const isMutatingCart = computed(() => {
  return addCartItemMutation.isLoading.value
})

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    maximumFractionDigits: 0,
  }).format(value)
}

async function reloadCart(): Promise<void> {
  if (isReloading.value) {
    return
  }

  isReloading.value = true

  try {
    await refetch()
  } finally {
    isReloading.value = false
  }
}

async function updateQuantity(
  productId: string,
  value: number | undefined,
  currentQuantity: number,
): Promise<void> {
  const quantity = Number(value)

  if (
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity === currentQuantity ||
    isMutatingCart.value
  ) {
    return
  }

  pendingProductId.value = productId

  try {
    await addCartItemMutation.mutateAsync({
      product: productId,
      quantity,
      replace: true,
    })

    snackbar.add({
      text: '商品數量已更新',
      color: 'success',
    })
  } catch (error) {
    snackbar.addError(error)
  } finally {
    pendingProductId.value = ''
  }
}

async function removeItem(
  productId: string,
  productName: string,
): Promise<void> {
  if (isMutatingCart.value) {
    return
  }

  try {
    await ElMessageBox.confirm(
      `確定要將「${productName}」移出購物車嗎？`,
      '移除商品',
      {
        confirmButtonText: '確定移除',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
  } catch {
    return
  }

  pendingProductId.value = productId

  try {
    await addCartItemMutation.mutateAsync({
      product: productId,
      quantity: 0,
      replace: true,
    })

    snackbar.add({
      text: '商品已移出購物車',
      color: 'success',
    })
  } catch (error) {
    snackbar.addError(error)
  } finally {
    pendingProductId.value = ''
  }
}

async function goShopping(): Promise<void> {
  await router.push('/')
}
</script>

<style scoped lang="scss">
.cart-page {
  width: min(100%, 1200px);
  margin: 0 auto;
  padding: 32px 20px 48px;

  &__header {
    margin-bottom: 24px;

    h1 {
      margin: 0;
      color: var(--color-heading);
      font-size: clamp(28px, 4vw, 36px);
    }

    p {
      margin: 8px 0 0;
      color: var(--color-text-secondary);
    }
  }
}

.cart-state {
  min-height: 360px;
}

.invalid-cart-alert {
  margin-bottom: 16px;
}

.cart-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 24px;
  align-items: start;
}

.cart-items-card {
  min-width: 0;
}

.cart-item {
  display: grid;
  grid-template-columns: 112px minmax(180px, 1fr) auto 140px auto;
  gap: 16px;
  padding: 20px 0;
  align-items: center;
  border-bottom: 1px solid var(--color-border);

  &:first-child {
    padding-top: 0;
  }

  &:last-child {
    padding-bottom: 0;
    border-bottom: 0;
  }

  &__image-link {
    display: block;
  }

  &__image {
    width: 112px;
    height: 88px;
    border-radius: var(--radius-md);
  }

  &__image-error {
    display: grid;
    width: 100%;
    height: 100%;
    padding: 8px;
    place-items: center;
    color: var(--color-text-secondary);
    background: var(--color-background);
    font-size: 12px;
    text-align: center;
  }

  &__content {
    min-width: 0;
  }

  &__name {
    display: inline-block;
    overflow: hidden;
    max-width: 100%;
    color: var(--el-color-primary);
    font-size: 17px;
    font-weight: 700;
    text-decoration: none;
    text-overflow: ellipsis;
    white-space: nowrap;

    &:hover {
      text-decoration: underline;
    }
  }

  &__category,
  &__price {
    margin: 6px 0 0;
    color: var(--color-text-secondary);
  }

  &__quantity,
  &__subtotal {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__label {
    color: var(--color-text-secondary);
    font-size: 13px;
  }

  &__subtotal {
    text-align: right;

    strong {
      color: var(--color-heading);
    }
  }
}

.cart-summary {
  position: sticky;
  top: 96px;
}

.summary-list {
  margin: 0;

  > div {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 0;
    border-bottom: 1px solid var(--color-border);
  }

  dt,
  dd {
    margin: 0;
  }

  dt {
    color: var(--color-text-secondary);
  }

  dd {
    color: var(--color-heading);
    font-weight: 600;
  }

  &__total {
    margin-top: 4px;
    border-bottom: 0 !important;

    dt,
    dd {
      color: var(--el-color-primary);
      font-size: 18px;
      font-weight: 700;
    }
  }
}

.summary-actions {
  display: grid;
  gap: 12px;
  margin-top: 20px;
}

.summary-button {
  width: 100%;
  margin-left: 0;
}

.summary-hint {
  margin: 12px 0 0;
  color: var(--el-color-warning);
  font-size: 13px;
  line-height: 1.6;
}

@media (max-width: 1100px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }

  .cart-summary {
    position: static;
  }
}

@media (max-width: 820px) {
  .cart-item {
    grid-template-columns: 88px minmax(0, 1fr) auto;

    &__image {
      width: 88px;
      height: 76px;
    }

    &__quantity {
      grid-column: 2;
    }

    &__subtotal {
      grid-column: 3;
      grid-row: 2;
    }

    &__remove {
      grid-column: 2 / -1;
      width: 100%;
      margin-left: 0;
    }
  }
}

@media (max-width: 560px) {
  .cart-page {
    padding: 24px 12px 40px;
  }

  .cart-item {
    grid-template-columns: 72px minmax(0, 1fr);

    &__image {
      width: 72px;
      height: 72px;
    }

    &__quantity,
    &__subtotal,
    &__remove {
      grid-column: 1 / -1;
    }

    &__subtotal {
      grid-row: auto;
      flex-direction: row;
      justify-content: space-between;
      text-align: left;
    }
  }
}
</style>

<route lang="yaml">
meta:
  access: authenticated
  title: 購物車
</route>
