<template>
  <section class="admin-orders-page">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">
          ORDER MANAGEMENT
        </p>
        <h1>訂單管理</h1>
        <p class="page-description">
          查看所有會員訂單並管理訂單狀態。
        </p>
      </div>
    </header>

    <div class="overview-grid">
      <div class="overview-card">
        <span>全部訂單</span>
        <strong>{{ totalCount }}</strong>
      </div>

      <div class="overview-card">
        <span>待處理</span>
        <strong>{{ pendingCount }}</strong>
      </div>

      <div class="overview-card">
        <span>已完成</span>
        <strong>{{ completedCount }}</strong>
      </div>
    </div>

    <AppLoading
      :loading="isLoading"
      text="正在載入訂單..."
      min-height="360px"
    >
      <AppCard
        v-if="error"
        class="management-card"
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

      <AppCard
        v-else
        class="management-card"
      >
        <div class="toolbar">
          <el-input
            v-model="search"
            clearable
            placeholder="搜尋訂單編號、帳號、暱稱或 Email"
          />

          <el-select
            v-model="statusFilter"
            clearable
            placeholder="訂單狀態"
          >
            <el-option
              v-for="option in statusOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </div>

        <el-empty
          v-if="filteredOrders.length === 0"
          description="目前沒有符合條件的訂單"
        />

        <el-table
          v-else
          :data="filteredOrders"
          row-key="_id"
          stripe
          class="management-table"
        >
          <el-table-column type="expand">
            <template #default="{ row }">
              <div class="order-detail">
                <div class="order-detail__info">
                  <p>
                    <span>完整訂單編號</span>
                    <strong>{{ row._id }}</strong>
                  </p>

                  <p>
                    <span>會員</span>
                    <strong>
                      {{ getUserLabel(row) }}
                    </strong>
                  </p>

                  <p>
                    <span>Email</span>
                    <strong>
                      {{ getUserEmail(row) }}
                    </strong>
                  </p>
                </div>

                <div class="order-items">
                  <article
                    v-for="item in row.items"
                    :key="`${row._id}-${item.product}`"
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
                      <strong>{{ item.name }}</strong>
                      <span>
                        單價：
                        {{ formatCurrency(item.price) }}
                      </span>
                    </div>

                    <div>
                      數量：{{ item.quantity }}
                    </div>

                    <div class="order-item__subtotal">
                      {{ formatCurrency(item.subtotal) }}
                    </div>
                  </article>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column
            label="訂單編號"
            min-width="150"
          >
            <template #default="{ row }">
              #{{ shortOrderId(row._id) }}
            </template>
          </el-table-column>

          <el-table-column
            label="會員"
            min-width="180"
          >
            <template #default="{ row }">
              <div class="user-cell">
                <strong>
                  {{ getUserAccount(row) }}
                </strong>

                <span>
                  {{ getUserNickname(row) }}
                </span>
              </div>
            </template>
          </el-table-column>

          <el-table-column
            label="建立時間"
            min-width="170"
          >
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>

          <el-table-column
            label="訂單狀態"
            min-width="130"
          >
            <template #default="{ row }">
              <el-tag
                :type="orderStatusType(row.status)"
              >
                {{ orderStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column
            label="付款狀態"
            min-width="120"
          >
            <template #default="{ row }">
              <el-tag
                :type="
                  paymentStatusType(
                    row.paymentStatus,
                  )
                "
              >
                {{
                  paymentStatusText(
                    row.paymentStatus,
                  )
                }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column
            label="總金額"
            min-width="120"
            align="right"
          >
            <template #default="{ row }">
              <strong>
                {{ formatCurrency(row.totalPrice) }}
              </strong>
            </template>
          </el-table-column>

          <el-table-column
            label="操作"
            width="150"
            fixed="right"
          >
            <template #default="{ row }">
              <AppButton
                type="primary"
                plain
                @click="openStatusDialog(row)"
              >
                修改狀態
              </AppButton>
            </template>
          </el-table-column>
        </el-table>
      </AppCard>
    </AppLoading>

    <el-dialog
      v-model="statusDialog"
      title="修改訂單狀態"
      width="420px"
    >
      <div v-if="selectedOrder">
        <p>
          訂單：
          #{{ shortOrderId(selectedOrder._id) }}
        </p>

        <el-select
          v-model="selectedStatus"
          style="width: 100%"
        >
          <el-option
            v-for="option in statusOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </div>

      <template #footer>
        <AppButton
          :disabled="isUpdating"
          @click="statusDialog = false"
        >
          取消
        </AppButton>

        <AppButton
          type="primary"
          :loading="isUpdating"
          :disabled="
            !selectedOrder ||
              !selectedStatus ||
              selectedStatus === selectedOrder.status
          "
          @click="submitStatus"
        >
          儲存
        </AppButton>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import type {
  IOrder,
  IOrderUser,
  OrderStatus,
  PaymentStatus,
} from '@/types/order'

import { computed, ref } from 'vue'

import {
  useAdminOrdersQuery,
  useUpdateOrderStatusMutation,
} from '@/queries/order'
import { useSnackbarStore } from '@/stores/snackbar'

type TagType =
  | 'primary'
  | 'success'
  | 'warning'
  | 'info'
  | 'danger'

const snackbar = useSnackbarStore()

const {
  data: orders,
  error,
  isLoading,
  refetch,
} = useAdminOrdersQuery()

const updateOrderStatusMutation =
  useUpdateOrderStatusMutation()

const search = ref('')
const statusFilter = ref<OrderStatus | ''>('')

const isReloading = ref(false)
const statusDialog = ref(false)

const selectedOrder = ref<IOrder | null>(null)
const selectedStatus = ref<OrderStatus | ''>('')

const statusOptions: {
  label: string
  value: OrderStatus
}[] = [
  {
    label: '待處理',
    value: 'pending',
  },
  {
    label: '處理中',
    value: 'processing',
  },
  {
    label: '已出貨',
    value: 'shipped',
  },
  {
    label: '已完成',
    value: 'completed',
  },
  {
    label: '已取消',
    value: 'cancelled',
  },
]

const isUpdating = computed(() => {
  return updateOrderStatusMutation.isLoading.value
})

const orderList = computed(() => orders.value ?? [])

const totalCount = computed(() => orderList.value.length)

const pendingCount = computed(
  () => orderList.value.filter(order => order.status === 'pending').length,
)

const completedCount = computed(
  () => orderList.value.filter(order => order.status === 'completed').length,
)

const filteredOrders = computed(() => {
  const keyword =
    search.value.trim().toLowerCase()

  return (orders.value ?? []).filter(order => {
    if (
      statusFilter.value &&
      order.status !== statusFilter.value
    ) {
      return false
    }

    if (!keyword) {
      return true
    }

    const user =
      typeof order.user === 'object'
        ? order.user
        : null

    return [
      order._id,
      user?.account,
      user?.nickname,
      user?.email,
    ]
      .filter(Boolean)
      .some(value =>
        String(value)
          .toLowerCase()
          .includes(keyword),
      )
  })
})

function getUser(
  order: IOrder,
): IOrderUser | null {
  return typeof order.user === 'object'
    ? order.user
    : null
}

function getUserAccount(order: IOrder): string {
  return getUser(order)?.account ?? '-'
}

function getUserNickname(order: IOrder): string {
  return getUser(order)?.nickname ?? ''
}

function getUserEmail(order: IOrder): string {
  return getUser(order)?.email ?? '-'
}

function getUserLabel(order: IOrder): string {
  const user = getUser(order)

  if (!user) {
    return '-'
  }

  return user.nickname
    ? `${user.account}（${user.nickname}）`
    : user.account
}

function shortOrderId(id: string): string {
  return id.slice(-8).toUpperCase()
}

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

function openStatusDialog(order: IOrder): void {
  selectedOrder.value = order
  selectedStatus.value = order.status
  statusDialog.value = true
}

async function submitStatus(): Promise<void> {
  if (
    !selectedOrder.value ||
    !selectedStatus.value ||
    isUpdating.value
  ) {
    return
  }

  if (
    selectedStatus.value ===
    selectedOrder.value.status
  ) {
    statusDialog.value = false
    return
  }

  try {
    await updateOrderStatusMutation.mutateAsync({
      id: selectedOrder.value._id,
      status: selectedStatus.value,
    })

    snackbar.add({
      text: '訂單狀態已更新',
      color: 'success',
    })

    statusDialog.value = false
    selectedOrder.value = null
    selectedStatus.value = ''
  } catch (error) {
    snackbar.addError(error)
  }
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
</script>

<style scoped lang="scss">
.admin-orders-page {
  display: grid;
  gap: 20px;
}

.page-header {
  h1 {
    margin: 4px 0 6px;
    font-size: 1.75rem;
    line-height: 1.25;
  }
}

.page-eyebrow {
  margin: 0;
  color: var(--el-color-primary);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.page-description {
  margin: 0;
  color: var(--el-text-color-secondary);
  line-height: 1.6;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.overview-card {
  display: flex;
  min-height: 92px;
  flex-direction: column;
  justify-content: center;
  padding: 18px 20px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  background: var(--el-bg-color);

  span {
    color: var(--el-text-color-secondary);
    font-size: 0.875rem;
  }

  strong {
    margin-top: 6px;
    color: var(--el-text-color-primary);
    font-size: 1.5rem;
  }
}

.management-card {
  overflow: hidden;
}

.toolbar {
  display: grid;
  grid-template-columns: minmax(300px, 1fr) 220px;
  gap: 12px;
  margin-bottom: 18px;
  padding: 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  background: var(--el-fill-color-extra-light);
}

.management-table {
  width: 100%;
}

.user-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;

  strong {
    color: var(--el-text-color-primary);
  }

  span {
    color: var(--el-text-color-secondary);
    font-size: 0.85rem;
  }
}

.order-detail {
  padding: 16px 24px;

  &__info {
    margin-bottom: 16px;

    p {
      display: grid;
      grid-template-columns: 120px minmax(0, 1fr);
      gap: 16px;
      margin: 0;
      padding: 6px 0;
    }

    span {
      color: var(--el-text-color-secondary);
    }

    strong {
      overflow-wrap: anywhere;
    }
  }
}

.order-item {
  display: grid;
  grid-template-columns: 80px minmax(180px, 1fr) 100px 120px;
  align-items: center;
  gap: 16px;
  padding: 14px 0;
  border-top: 1px solid var(--el-border-color-lighter);

  &__image {
    width: 80px;
    height: 68px;
    overflow: hidden;
    border-radius: 8px;
    background: var(--el-fill-color-light);
  }

  &__image-error {
    display: grid;
    width: 100%;
    height: 100%;
    place-items: center;
    color: var(--el-text-color-secondary);
    font-size: 0.75rem;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 4px;

    span {
      color: var(--el-text-color-secondary);
    }
  }

  &__subtotal {
    text-align: right;
    font-weight: 700;
  }
}

@media (max-width: 900px) {
  .overview-grid {
    grid-template-columns: 1fr;
  }

  .toolbar {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .order-item {
    grid-template-columns: 64px minmax(0, 1fr);

    &__image {
      width: 64px;
      height: 64px;
    }

    > :nth-child(3),
    &__subtotal {
      grid-column: 2;
    }

    &__subtotal {
      text-align: left;
    }
  }
}
</style>

<route lang="yaml">
meta:
  layout: admin
  access: authenticated
  roles:
    - admin
  title: 訂單管理
</route>
