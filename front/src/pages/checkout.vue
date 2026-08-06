<template>
  <section class="checkout-page">
    <header class="checkout-page__header">
      <div>
        <h1>確認訂單</h1>
        <p>請確認商品內容與金額，送出後將建立正式訂單。</p>
      </div>
    </header>

    <AppLoading
      :loading="isLoading"
      text="正在載入訂單內容..."
      min-height="360px"
    >
      <AppCard
        v-if="status === 'success' && createdOrder"
        class="checkout-result-card"
      >
        <el-result
          icon="success"
          title="訂單建立成功"
          sub-title="你的訂單已成立，可以前往我的訂單查看。"
        >
          <template #extra>
            <div class="result-summary">
              <p>
                <span>訂單編號</span>
                <strong>{{ createdOrder._id }}</strong>
              </p>
              <p>
                <span>訂單金額</span>
                <strong>{{ formatCurrency(createdOrder.totalPrice) }}</strong>
              </p>
              <p>
                <span>訂單狀態</span>
                <strong>{{ orderStatusText(createdOrder.status) }}</strong>
              </p>
              <p>
                <span>付款狀態</span>
                <strong>{{ paymentStatusText(createdOrder.paymentStatus) }}</strong>
              </p>
            </div>

            <div class="result-actions">
              <AppButton
                type="primary"
                @click="goToOrders"
              >
                查看我的訂單
              </AppButton>
              <AppButton @click="goShopping">
                繼續購物
              </AppButton>
            </div>
          </template>
        </el-result>
      </AppCard>

      <AppCard
        v-else-if="error"
        class="checkout-state-card"
      >
        <AppEmpty description="無法取得購物車資料">
          <AppButton
            type="primary"
            :loading="isReloading"
            @click="reloadCart"
          >
            重新載入
          </AppButton>
        </AppEmpty>
      </AppCard>

      <AppCard
        v-else-if="validCartItems.length === 0"
        class="checkout-state-card"
      >
        <el-alert
          v-if="invalidItemCount > 0"
          class="checkout-alert"
          type="warning"
          :closable="false"
          show-icon
          title="購物車內有已不存在的商品"
          description="請返回購物車處理後再進行結帳。"
        />

        <AppEmpty description="購物車目前沒有可結帳的商品">
          <AppButton
            type="primary"
            @click="goToCart"
          >
            返回購物車
          </AppButton>
        </AppEmpty>
      </AppCard>

      <template v-else>
        <el-alert
          v-if="invalidItemCount > 0"
          class="checkout-alert"
          type="warning"
          :closable="false"
          show-icon
          :title="`購物車內有 ${invalidItemCount} 項商品已不存在`"
          description="請返回購物車處理失效商品後再建立訂單。"
        />

        <div class="checkout-layout">
          <AppCard
            class="checkout-items-card"
            title="商品明細"
          >
            <div
              v-for="item in validCartItems"
              :key="item._id"
              class="checkout-item"
            >
              <el-image
                class="checkout-item__image"
                fit="cover"
                :src="item.product.imageUrl || item.product.image"
              >
                <template #error>
                  <div class="checkout-item__image-error">
                    圖片載入失敗
                  </div>
                </template>
              </el-image>

              <div class="checkout-item__content">
                <h2>{{ item.product.name }}</h2>
                <p>{{ item.product.category }}</p>
                <p>單價：{{ formatCurrency(item.product.price) }}</p>
              </div>

              <div class="checkout-item__quantity">
                <span>數量</span>
                <strong>{{ item.quantity }}</strong>
              </div>

              <div class="checkout-item__subtotal">
                <span>小計</span>
                <strong>{{ formatCurrency(item.product.price * item.quantity) }}</strong>
              </div>
            </div>
          </AppCard>

          <aside class="checkout-summary">
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
                  <dd>{{ formatCurrency(displayedTotalPrice) }}</dd>
                </div>
              </dl>

              <p class="checkout-note">
                實際成交價格與總額將由後端在建立訂單時重新計算。
              </p>

              <div class="summary-actions">
                <AppButton
                  class="summary-button"
                  :disabled="isSubmitting"
                  @click="goToCart"
                >
                  返回購物車
                </AppButton>

                <AppButton
                  class="summary-button"
                  type="primary"
                  :loading="isSubmitting"
                  :disabled="isSubmitting || invalidItemCount > 0 || validCartItems.length === 0"
                  @click="submitOrder"
                >
                  確認建立訂單
                </AppButton>
              </div>
            </AppCard>
          </aside>
        </div>
      </template>
    </AppLoading>
  </section>
</template>

<script setup lang="ts">
import type { ValidCartItem } from '@/types/cart'
import type { IOrder, OrderStatus, PaymentStatus } from '@/types/order'

import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useCartItemsQuery } from '@/queries/cart'
import { useCreateOrderMutation } from '@/queries/order'
import { useSnackbarStore } from '@/stores/snackbar'

type CheckoutStatus = 'confirm' | 'success'

const router = useRouter()
const snackbar = useSnackbarStore()

const {
  data: cartItems,
  error,
  isLoading,
  refetch,
} = useCartItemsQuery()

const createOrderMutation = useCreateOrderMutation()

const status = ref<CheckoutStatus>('confirm')
const createdOrder = ref<IOrder | null>(null)
const isReloading = ref(false)

const validCartItems = computed<ValidCartItem[]>(() => {
  return (cartItems.value ?? []).filter(
    (item): item is ValidCartItem => item.product !== null,
  )
})

const invalidItemCount = computed(() => {
  return (cartItems.value ?? []).filter(item => item.product === null).length
})

const totalQuantity = computed(() => {
  return validCartItems.value.reduce((total, item) => total + item.quantity, 0)
})

const displayedTotalPrice = computed(() => {
  return validCartItems.value.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  )
})

const isSubmitting = computed(() => {
  return createOrderMutation.isLoading.value
})

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    maximumFractionDigits: 0,
  }).format(value)
}

function orderStatusText(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    pending: '待處理',
    processing: '處理中',
    shipped: '已出貨',
    completed: '已完成',
    cancelled: '已取消',
  }

  return labels[status]
}

function paymentStatusText(status: PaymentStatus): string {
  const labels: Record<PaymentStatus, string> = {
    unpaid: '未付款',
    paid: '已付款',
    refunded: '已退款',
  }

  return labels[status]
}

async function reloadCart(): Promise<void> {
  if (isReloading.value) return

  isReloading.value = true

  try {
    await refetch()
  } finally {
    isReloading.value = false
  }
}

async function submitOrder(): Promise<void> {
  if (
    isSubmitting.value ||
    validCartItems.value.length === 0 ||
    invalidItemCount.value > 0
  ) {
    return
  }

  try {
    createdOrder.value = await createOrderMutation.mutateAsync()
    status.value = 'success'

    snackbar.add({
      text: '訂單建立成功',
      color: 'success',
    })
  } catch (error) {
    snackbar.addError(error)
  }
}

async function goToCart(): Promise<void> {
  await router.push('/user/cart')
}

async function goToOrders(): Promise<void> {
  await router.push('/user/orders')
}

async function goShopping(): Promise<void> {
  await router.push('/')
}
</script>

<route lang="yaml">
meta:
  access: authenticated
  title: 確認訂單
</route>

<style scoped lang="scss">
.checkout-page {
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

.checkout-state-card,
.checkout-result-card {
  min-height: 360px;
}

.checkout-alert {
  margin-bottom: 1rem;
}

.checkout-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 1.5rem;
  align-items: start;
}

.checkout-item {
  display: grid;
  grid-template-columns: 112px minmax(180px, 1fr) 80px 140px;
  gap: 1rem;
  padding: 1.25rem 0;
  align-items: center;
  border-bottom: 1px solid var(--color-border);

  &:first-child { padding-top: 0; }
  &:last-child { padding-bottom: 0; border-bottom: 0; }

  &__image {
    width: 112px;
    height: 88px;
    border-radius: var(--radius-md);
  }

  &__image-error {
    display: grid;
    width: 100%;
    height: 100%;
    padding: 0.5rem;
    place-items: center;
    color: var(--color-text-secondary);
    background: var(--color-background);
    font-size: 0.75rem;
    text-align: center;
  }

  &__content {
    min-width: 0;

    h2 {
      margin: 0;
      color: var(--color-heading);
      font-size: 1.05rem;
    }

    p {
      margin: 0.35rem 0 0;
      color: var(--color-text-secondary);
    }
  }

  &__quantity,
  &__subtotal {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    span {
      color: var(--color-text-secondary);
      font-size: 0.8125rem;
    }
  }

  &__subtotal {
    text-align: right;

    strong { color: var(--color-heading); }
  }
}

.checkout-summary {
  position: sticky;
  top: 96px;
}

.summary-list {
  margin: 0;

  > div {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--color-border);
  }

  dt,
  dd { margin: 0; }

  dt { color: var(--color-text-secondary); }

  dd {
    color: var(--color-heading);
    font-weight: 600;
  }

  &__total {
    border-bottom: 0 !important;

    dt,
    dd {
      color: var(--el-color-primary);
      font-size: 1.125rem;
      font-weight: 700;
    }
  }
}

.checkout-note {
  margin: 0.75rem 0 0;
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
  line-height: 1.6;
}

.summary-actions,
.result-actions {
  display: grid;
  gap: 12px;
  margin-top: 24px;

  > * {
    width: 100%;
    margin-left: 0 !important;
  }
}

.summary-button {
  width: 100%;
  margin-left: 0;
}

.result-summary {
  width: min(100%, 560px);
  margin: 0 auto 1.25rem;

  p {
    display: grid;
    grid-template-columns: 100px minmax(0, 1fr);
    gap: 1rem;
    margin: 0;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--color-border);
    text-align: left;
  }

  span { color: var(--color-text-secondary); }

  strong {
    overflow-wrap: anywhere;
    color: var(--color-heading);
  }
}

@media (max-width: 980px) {
  .checkout-layout { grid-template-columns: 1fr; }
  .checkout-summary { position: static; }
}

@media (max-width: 720px) {
  .checkout-item {
    grid-template-columns: 88px minmax(0, 1fr);

    &__image {
      width: 88px;
      height: 76px;
    }

    &__quantity,
    &__subtotal {
      grid-column: 2;
      flex-direction: row;
      justify-content: space-between;
      text-align: left;
    }
  }
}

@media (max-width: 480px) {
  .checkout-page { padding-top: 1rem; }

  .checkout-item {
    grid-template-columns: 72px minmax(0, 1fr);

    &__image {
      width: 72px;
      height: 72px;
    }

    &__quantity,
    &__subtotal { grid-column: 1 / -1; }
  }
}
</style>
