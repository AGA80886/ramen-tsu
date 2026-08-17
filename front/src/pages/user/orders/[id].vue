<template>
  <main class="order-detail-page">
    <section class="order-detail-hero">
      <div class="page-container order-detail-hero__inner">
        <div>
          <p class="eyebrow">
            ORDER DETAIL
          </p>
          <h1>訂單詳情</h1>
          <p class="order-detail-hero__description">
            查看這筆訂單的完整資訊、商品明細與付款狀態。
          </p>
        </div>
      </div>
    </section>

    <section class="page-container order-detail-content">
      <AppLoading
        :loading="isLoading"
        text="正在載入訂單..."
        min-height="360px"
      >
        <!-- API Error -->
        <AppCard
          v-if="error"
          class="order-state-card"
        >
          <AppEmpty description="無法取得訂單資料">
            <AppButton
              type="primary"
              :loading="isReloading"
              @click="reloadOrders"
            >
              重新載入
            </AppButton>
          </AppEmpty>
        </AppCard>

        <!-- Order Not Found -->
        <AppCard
          v-else-if="!order"
          class="order-state-card"
        >
          <AppEmpty description="找不到這筆訂單">
            <AppButton
              type="primary"
              @click="goToOrders"
            >
              返回我的訂單
            </AppButton>
          </AppEmpty>
        </AppCard>

        <!-- Order Detail -->
        <template v-else>
          <div class="detail-layout">
            <div class="detail-main">
              <!-- 訂單資訊 -->
              <AppCard title="訂單資訊">
                <dl class="order-info">
                  <div>
                    <dt>訂單編號</dt>
                    <dd>{{ order._id }}</dd>
                  </div>

                  <div>
                    <dt>建立時間</dt>
                    <dd>{{ formatDate(order.createdAt) }}</dd>
                  </div>

                  <div>
                    <dt>最後更新</dt>
                    <dd>{{ formatDate(order.updatedAt) }}</dd>
                  </div>

                  <div>
                    <dt>訂單狀態</dt>
                    <dd>
                      <el-tag
                        :type="orderStatusType(order.status)"
                        effect="light"
                      >
                        {{ orderStatusText(order.status) }}
                      </el-tag>
                    </dd>
                  </div>

                  <div>
                    <dt>付款狀態</dt>
                    <dd>
                      <el-tag
                        :type="
                          paymentStatusType(
                            order.paymentStatus,
                          )
                        "
                        effect="light"
                      >
                        {{
                          paymentStatusText(
                            order.paymentStatus,
                          )
                        }}
                      </el-tag>
                    </dd>
                  </div>
                </dl>
              </AppCard>

              <!-- 商品明細 -->
              <AppCard title="商品明細">
                <article
                  v-for="item in order.items"
                  :key="`${order._id}-${item.product}`"
                  class="order-item"
                >
                  <el-image
                    class="order-item__image"
                    fit="cover"
                    :src="item.imageUrl || ''"
                  >
                    <template #error>
                      <div class="order-item__image-error">
                        圖片載入失敗
                      </div>
                    </template>
                  </el-image>

                  <div class="order-item__content">
                    <h2>{{ item.name }}</h2>

                    <p>
                      成交單價：
                      {{ formatCurrency(item.price) }}
                    </p>
                  </div>

                  <div class="order-item__quantity">
                    <span>數量</span>
                    <strong>{{ item.quantity }}</strong>
                  </div>

                  <div class="order-item__subtotal">
                    <span>小計</span>
                    <strong>
                      {{ formatCurrency(item.subtotal) }}
                    </strong>
                  </div>
                </article>
              </AppCard>
            </div>

            <!-- 訂單摘要 -->
            <aside class="order-summary">
              <AppCard title="訂單摘要">
                <dl class="summary-list">
                  <div>
                    <dt>商品種類</dt>
                    <dd>{{ order.items.length }}</dd>
                  </div>

                  <div>
                    <dt>商品總數</dt>
                    <dd>{{ totalQuantity }}</dd>
                  </div>

                  <div class="summary-list__total">
                    <dt>訂單總金額</dt>
                    <dd>
                      {{ formatCurrency(order.totalPrice) }}
                    </dd>
                  </div>
                </dl>

                <div class="summary-actions">
                  <AppButton
                    class="summary-button"
                    type="primary"
                    @click="goToOrders"
                  >
                    返回我的訂單
                  </AppButton>

                  <AppButton
                    class="summary-button"
                    @click="goShopping"
                  >
                    繼續購物
                  </AppButton>
                </div>
              </AppCard>
            </aside>
          </div>
        </template>
      </AppLoading>
    </section>
  </main>
</template>

<script setup lang="ts">
import type {
  IOrder,
  OrderStatus,
  PaymentStatus,
} from '@/types/order'

import { computed, ref } from 'vue'
import {
  useRoute,
  useRouter,
} from 'vue-router'

import { useMyOrdersQuery } from '@/queries/order'

type TagType =
  | 'primary'
  | 'success'
  | 'warning'
  | 'info'
  | 'danger'

const route = useRoute()
const router = useRouter()

const {
  data: orders,
  error,
  isLoading,
  refetch,
} = useMyOrdersQuery()

const isReloading = ref(false)

const orderId = computed(() => {
  if (!('id' in route.params)) {
    return ''
  }

  return String(route.params.id)
})

const order = computed<IOrder | undefined>(() => {
  return (orders.value ?? []).find(
    item => item._id === orderId.value,
  )
})

const totalQuantity = computed(() => {
  if (!order.value) {
    return 0
  }

  return order.value.items.reduce(
    (total, item) =>
      total + item.quantity,
    0,
  )
})

function formatCurrency(
  value: number,
): string {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function orderStatusText(
  status: OrderStatus,
): string {
  const labels: Record<OrderStatus, string> = {
    pending: '待處理',
    processing: '處理中',
    shipped: '已出貨',
    completed: '已完成',
    cancelled: '已取消',
  }

  return labels[status]
}

function orderStatusType(
  status: OrderStatus,
): TagType {
  const types: Record<OrderStatus, TagType> = {
    pending: 'warning',
    processing: 'primary',
    shipped: 'primary',
    completed: 'success',
    cancelled: 'danger',
  }

  return types[status]
}

function paymentStatusText(
  status: PaymentStatus,
): string {
  const labels: Record<PaymentStatus, string> = {
    unpaid: '未付款',
    paid: '已付款',
    refunded: '已退款',
  }

  return labels[status]
}

function paymentStatusType(
  status: PaymentStatus,
): TagType {
  const types: Record<PaymentStatus, TagType> = {
    unpaid: 'warning',
    paid: 'success',
    refunded: 'info',
  }

  return types[status]
}

async function reloadOrders(): Promise<void> {
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
  title: 訂單詳情
</route>

<style scoped lang="scss">
.order-detail-page {
  min-height: 100vh;
}

.page-container {
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
}

.order-detail-hero {
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

.order-detail-content {
  padding-bottom: 72px;
}

.order-state-card {
  min-height: 360px;
  border-radius: 16px;
}

.detail-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 24px;
  align-items: start;
}

.detail-main {
  display: grid;
  gap: 24px;
}

.detail-main :deep(.app-card),
.order-summary :deep(.app-card) {
  overflow: hidden;
  border-radius: 16px;
}

.order-info {
  margin: 0;

  > div {
    display: grid;
    grid-template-columns: 120px minmax(0, 1fr);
    gap: 16px;
    padding: 12px 0;
    border-bottom: 1px solid var(--color-border);

    &:last-child {
      border-bottom: 0;
    }
  }

  dt,
  dd {
    margin: 0;
  }

  dt {
    color: var(--color-text-secondary);
  }

  dd {
    overflow-wrap: anywhere;
    color: var(--color-heading);
    font-weight: 600;
  }
}

.order-item {
  display: grid;
  grid-template-columns: 96px minmax(180px, 1fr) 80px 140px;
  gap: 16px;
  padding: 16px 0;
  align-items: center;
  border-bottom: 1px solid var(--color-border);

  &:first-child {
    padding-top: 0;
  }

  &:last-child {
    padding-bottom: 0;
    border-bottom: 0;
  }

  &__image {
    width: 96px;
    height: 80px;
    overflow: hidden;
    border-radius: 12px;
  }

  &__image-error {
    display: grid;
    width: 100%;
    height: 100%;
    place-items: center;
    color: var(--color-text-secondary);
    font-size: 0.75rem;
  }

  &__content {
    min-width: 0;

    h2 {
      margin: 0;
      color: var(--color-heading);
      font-size: 1rem;
    }

    p {
      margin: 6px 0 0;
      color: var(--color-text-secondary);
    }
  }

  &__quantity,
  &__subtotal {
    display: flex;
    flex-direction: column;
    gap: 6px;

    span {
      color: var(--color-text-secondary);
      font-size: 0.8125rem;
    }
  }

  &__subtotal {
    text-align: right;
  }
}

.order-summary {
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
    border-bottom: 0 !important;

    dt,
    dd {
      color: var(--bs-primary);
      font-size: 1.125rem;
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

@media (max-width: 900px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }

  .order-summary {
    position: static;
  }
}

@media (max-width: 680px) {
  .order-info > div {
    grid-template-columns: 1fr;
    gap: 4px;
  }

  .order-item {
    grid-template-columns: 80px minmax(0, 1fr);

    &__image {
      width: 80px;
      height: 72px;
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

@media (max-width: 640px) {
  .page-container {
    width: min(100%, calc(100% - 32px));
  }

  .order-detail-hero {
    padding: 40px 0 32px;
  }

  .order-detail-content {
    padding-bottom: 48px;
  }

  .order-item {
    grid-template-columns: 72px minmax(0, 1fr);

    &__image {
      width: 72px;
      height: 72px;
    }

    &__quantity,
    &__subtotal {
      grid-column: 1 / -1;
    }
  }
}
</style>
