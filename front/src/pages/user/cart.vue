<template>
  <main class="cart-page">
    <section class="cart-hero">
      <div class="page-container cart-hero__inner">
        <div>
          <p class="eyebrow">
            RAMEN STORE
          </p>
          <h1>購物車</h1>
          <p class="cart-hero__description">
            確認商品數量與金額，再進入結帳流程。
          </p>
        </div>
      </div>
    </section>

    <section class="page-container cart-content">
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
          v-else-if="existingCartItems.length === 0"
          class="cart-state"
        >
          <el-alert
            v-if="invalidItemCount > 0"
            class="invalid-cart-alert"
            type="warning"
            :closable="false"
            show-icon
          >
            <template #title>
              購物車內有商品目前無法購買
            </template>

            <template #default>
              <div class="invalid-cart-alert__details">
                <p v-if="missingItemCount > 0">
                  {{ missingItemCount }} 項商品已不存在。
                </p>

                <p v-if="unavailableItemCount > 0">
                  {{ unavailableItemCount }} 項商品已下架。
                </p>

                <p>
                  請先移除失效商品，再進入結帳。
                </p>
              </div>
            </template>
          </el-alert>

          <AppEmpty description="購物車目前沒有可購買的商品">
            <AppButton @click="goOnlineStore">
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
          >
            <template #title>
              購物車內有商品目前無法購買
            </template>

            <template #default>
              <div class="invalid-cart-alert__details">
                <p v-if="missingItemCount > 0">
                  {{ missingItemCount }} 項商品已不存在。
                </p>

                <p v-if="unavailableItemCount > 0">
                  {{ unavailableItemCount }} 項商品已下架。
                </p>

                <p>
                  失效商品不會列入金額計算，請先移除後再進入結帳。
                </p>
              </div>
            </template>
          </el-alert>

          <div class="cart-layout">
            <AppCard
              class="cart-items-card"
              title="商品清單"
            >
              <div
                v-for="item in existingCartItems"
                :key="item._id"
                :class="{
                  'cart-item--unavailable': !item.product.sell,
                }"
                class="cart-item"
              >
                <RouterLink
                  v-if="item.product.sell"
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

                <div
                  v-else
                  class="cart-item__image-link"
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
                </div>

                <div class="cart-item__content">
                  <RouterLink
                    v-if="item.product.sell"
                    class="cart-item__name"
                    :to="`/product/${item.product._id}`"
                  >
                    {{ item.product.name }}
                  </RouterLink>

                  <span
                    v-else
                    class="cart-item__name cart-item__name--disabled"
                  >
                    {{ item.product.name }}
                  </span>

                  <p class="cart-item__category">
                    {{ item.product.category }}
                  </p>

                  <el-tag
                    v-if="!item.product.sell"
                    class="cart-item__status"
                    type="danger"
                    effect="light"
                  >
                    已下架
                  </el-tag>

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
                    :disabled="
                      isMutatingCart
                        || !item.product.sell
                    "
                    @change="
                      updateQuantity(
                        item.product._id,
                        $event,
                        item.quantity,
                        item.product.sell,
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
                    <dd>{{ purchasableCartItems.length }}</dd>
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
                    @click="goOnlineStore"
                  >
                    繼續購物
                  </AppButton>

                  <AppButton
                    class="summary-button"
                    type="primary"
                    :disabled="
                      isMutatingCart ||
                        invalidItemCount > 0 ||
                        purchasableCartItems.length === 0
                    "
                    @click="goToCheckout"
                  >
                    前往結帳
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
  </main>
</template>

<script setup lang="ts">
import type { ICartItem } from '@/types/cart'

import {
  computed,
  onMounted,
  ref,
} from 'vue'
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

onMounted(async () => {
  await refetch()
})

const existingCartItems = computed<ValidCartItem[]>(() => {
  return (cartItems.value ?? []).filter(
    (item): item is ValidCartItem =>
      item.product !== null,
  )
})

const purchasableCartItems = computed<ValidCartItem[]>(() => {
  return existingCartItems.value.filter(
    item => item.product.sell,
  )
})

const missingItemCount = computed(() => {
  return (cartItems.value ?? []).filter(
    item => item.product === null,
  ).length
})

const unavailableItemCount = computed(() => {
  return existingCartItems.value.filter(
    item => !item.product.sell,
  ).length
})

const invalidItemCount = computed(() => {
  return (
    missingItemCount.value
    + unavailableItemCount.value
  )
})

const totalQuantity = computed(() => {
  return purchasableCartItems.value.reduce(
    (total, item) => total + item.quantity,
    0,
  )
})

const totalPrice = computed(() => {
  return purchasableCartItems.value.reduce(
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
  sell: boolean,
): Promise<void> {
  if (!sell) {
    snackbar.add({
      text: '此商品已下架，請將商品移出購物車',
      color: 'warning',
    })
    return
  }

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

async function goOnlineStore(): Promise<void> {
  await router.push('/online-store')
}

async function goToCheckout(): Promise<void> {
  if (
    isMutatingCart.value ||
    invalidItemCount.value > 0 ||
    purchasableCartItems.value.length === 0
  ) {
    return
  }

  await router.push('/checkout')
}
</script>

<style scoped lang="scss">
.cart-page {
  min-height: 100vh;
}

.page-container {
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
}

.cart-hero {
  padding: 64px 0 48px;

  &__inner {
    display: flex;
    gap: 32px;
    align-items: center;
    justify-content: space-between;
  }

  h1 {
    margin: 4px 0 12px;
    font-size: clamp(2rem, 5vw, 3rem);
  }

  &__description {
    max-width: 620px;
    margin: 0;
    color: var(--color-text-secondary);
    line-height: 1.8;
  }
}

.eyebrow {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.16em;
}

.cart-content {
  padding-bottom: 72px;
}

.cart-state {
  min-height: 360px;
  border-radius: 16px;
}

.invalid-cart-alert {
  margin-bottom: 20px;
  border-radius: 12px;
}

.cart-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 24px;
  align-items: start;
}

.cart-items-card,
.cart-summary :deep(.app-card) {
  border-radius: 16px;
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
    overflow: hidden;
    border-radius: 12px;
  }

  &__image-error {
    display: grid;
    width: 100%;
    height: 100%;
    padding: 8px;
    place-items: center;
    background: var(--color-background);
    color: var(--color-text-secondary);
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
    color: var(--color-heading);
    font-size: 1.05rem;
    font-weight: 700;
    text-decoration: none;
    text-overflow: ellipsis;
    white-space: nowrap;

    &:hover {
      color: var(--bs-primary);
    }

    &--disabled {
      color: var(--color-text-secondary);
      cursor: default;
      text-decoration: line-through;

      &:hover {
        color: var(--color-text-secondary);
        text-decoration: line-through;
      }
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

  &__remove {
    border-radius: 8px;
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
      color: var(--bs-primary);
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
  border-radius: 8px;
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

@media (max-width: 640px) {
  .page-container {
    width: min(100%, calc(100% - 32px));
  }

  .cart-hero {
    padding: 40px 0 32px;
  }

  .cart-content {
    padding-bottom: 48px;
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

.cart-item {
  &--unavailable {
    opacity: 0.72;
  }

  &__status {
    margin-top: 8px;
  }
}

.invalid-cart-alert__details {
  display: grid;
  gap: 4px;

  p {
    margin: 0;
  }
}
</style>

<route lang="yaml">
meta:
  access: authenticated
  title: 購物車
</route>
