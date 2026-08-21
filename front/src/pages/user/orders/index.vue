<template>
  <main class="orders-page">
    <section class="orders-hero">
      <div class="page-container orders-hero__inner">
        <div>
          <p class="eyebrow">
            MY ORDERS
          </p>
          <h1>我的訂單</h1>
          <p class="orders-hero__description">
            查看您過去建立的訂單、商品明細與付款狀態。
          </p>
        </div>
      </div>
    </section>

    <section class="page-container orders-content">
      <AppLoading
        :loading="isLoading"
        text="正在載入訂單..."
        min-height="360px"
      >
        <!-- API Error -->
        <AppCard
          v-if="error"
          class="orders-state-card"
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

        <!-- Empty -->
        <AppCard
          v-else-if="orders.length === 0"
          class="orders-state-card"
        >
          <AppEmpty description="目前還沒有訂單">
            <AppButton
              type="primary"
              @click="goShopping"
            >
              前往購物
            </AppButton>
          </AppEmpty>
        </AppCard>

        <!-- Orders -->
        <el-collapse
          v-else
          v-model="activeOrders"
          class="orders-list"
        >
          <el-collapse-item
            v-for="order in orders"
            :key="order._id"
            :name="order._id"
          >
            <template #title>
              <div class="order-summary">
                <div class="order-summary__main">
                  <strong class="order-summary__id">
                    訂單 #{{ shortOrderId(order._id) }}
                  </strong>

                  <span class="order-summary__date">
                    {{ formatDate(order.createdAt) }}
                  </span>
                </div>

                <div class="order-summary__meta">
                  <el-tag
                    :type="orderStatusType(order.status)"
                    effect="light"
                  >
                    {{ orderStatusText(order.status) }}
                  </el-tag>

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

                  <span class="order-summary__quantity">
                    {{ order.items.length }} 種 /
                    {{ getTotalQuantity(order) }} 件
                  </span>

                  <strong class="order-summary__price">
                    {{ formatCurrency(order.totalPrice) }}
                  </strong>
                </div>
              </div>
            </template>

            <div class="order-detail">
              <div class="order-detail__info">
                <p>
                  <span>完整訂單編號</span>
                  <strong>{{ order._id }}</strong>
                </p>

                <p>
                  <span>建立時間</span>
                  <strong>
                    {{ formatDate(order.createdAt) }}
                  </strong>
                </p>
              </div>

              <div class="order-items">
                <article
                  v-for="item in order.items"
                  :key="`${order._id}-${item.product}`"
                  class="order-item"
                >
                  <el-image
                    class="order-item__image"
                    fit="cover"
                    :src="item.imageUrl"
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
              </div>

              <div class="order-detail__total">
                <span>訂單總金額</span>
                <strong>
                  {{ formatCurrency(order.totalPrice) }}
                </strong>
              </div>

              <div class="order-detail__actions">
                <AppButton
                  type="primary"
                  plain
                  @click="goToOrderDetail(order._id)"
                >
                  查看詳情
                </AppButton>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
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
import { useRouter } from 'vue-router'

import { useMyOrdersQuery } from '@/queries/order'

type TagType =
  | 'primary'
  | 'success'
  | 'warning'
  | 'info'
  | 'danger'

const router = useRouter()

const {
  data,
  error,
  isLoading,
  refetch,
} = useMyOrdersQuery()

const activeOrders = ref<string[]>([])
const isReloading = ref(false)

const orders = computed<IOrder[]>(() => {
  return [...(data.value ?? [])].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime(),
  )
})

function formatCurrency(value: number): string {
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

function shortOrderId(id: string): string {
  return id.slice(-8).toUpperCase()
}

function getTotalQuantity(
  order: IOrder,
): number {
  return order.items.reduce(
    (total, item) =>
      total + item.quantity,
    0,
  )
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

async function goShopping(): Promise<void> {
  await router.push('/')
}

async function goToOrderDetail(
  orderId: string,
): Promise<void> {
  await router.push(
    `/user/orders/${orderId}`,
  )
}
</script>

<route lang="yaml">
meta:
  access: authenticated
  title: 我的訂單
</route>

<style scoped lang="scss">
.orders-page {
  min-height: 100vh;
}

.page-container {
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
}

.orders-hero {
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

.orders-content {
  padding-bottom: 72px;
}

.orders-state-card {
  min-height: 360px;
  border-radius: 16px;
}

.orders-list {
  border-top: 0;

  :deep(.el-collapse-item) {
    margin-bottom: 18px;
    overflow: hidden;
    border: 1px solid var(--color-border);
    border-radius: 16px;
    background: var(--color-surface);
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
  }

  :deep(.el-collapse-item:hover) {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgb(0 0 0 / 7%);
  }

  :deep(.el-collapse-item__header) {
    height: auto;
    min-height: 92px;
    padding: 18px 20px;
    border-bottom: 0;
    background: transparent;
  }

  :deep(.el-collapse-item__wrap) {
    border-bottom: 0;
    background: transparent;
  }

  :deep(.el-collapse-item__content) {
    padding: 0 20px 20px;
  }
}

.order-summary {
  display: flex;
  width: 100%;
  gap: 20px;
  align-items: center;
  justify-content: space-between;
  padding-right: 12px;

  &__main {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 6px;
  }

  &__id {
    color: var(--color-heading);
    font-size: 1rem;
  }

  &__date,
  &__quantity {
    color: var(--color-text-secondary);
    font-size: 0.875rem;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: flex-end;
  }

  &__price {
    min-width: 100px;
    color: var(--bs-primary);
    font-size: 1.05rem;
    text-align: right;
  }
}

.order-detail {
  border-top: 1px solid var(--color-border);

  &__info {
    padding: 16px 0;

    p {
      display: grid;
      grid-template-columns: 120px minmax(0, 1fr);
      gap: 16px;
      margin: 0;
      padding: 6px 0;
    }

    span {
      color: var(--color-text-secondary);
    }

    strong {
      overflow-wrap: anywhere;
      color: var(--color-heading);
    }
  }

  &__total {
    display: flex;
    justify-content: flex-end;
    gap: 24px;
    padding-top: 20px;
    border-top: 1px solid var(--color-border);

    span {
      color: var(--color-text-secondary);
    }

    strong {
      color: var(--bs-primary);
      font-size: 1.125rem;
    }
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
}

.order-item {
  display: grid;
  grid-template-columns: 96px minmax(180px, 1fr) 80px 140px;
  gap: 16px;
  padding: 16px 0;
  align-items: center;
  border-top: 1px solid var(--color-border);

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

@media (max-width: 820px) {
  .order-summary {
    align-items: flex-start;
    flex-direction: column;

    &__meta {
      justify-content: flex-start;
    }
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

  .orders-hero {
    padding: 40px 0 32px;
  }

  .orders-content {
    padding-bottom: 48px;
  }

  .order-detail__info p {
    grid-template-columns: 1fr;
    gap: 2px;
  }

  .order-detail__actions :deep(.el-button) {
    width: 100%;
    margin-left: 0;
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

  .order-detail__total {
    justify-content: space-between;
  }
}
</style>

<route lang="yaml">
meta:
  access: authenticated
  title: 我的訂單
</route>
