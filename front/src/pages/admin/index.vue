<template>
  <div class="admin-home-page">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">
          ADMIN DASHBOARD
        </p>

        <h1>後台管理</h1>

        <p class="page-description">
          快速掌握會員、商城、訂單、文章與店家目前狀態。
        </p>
      </div>
    </header>

    <section class="dashboard-section">
      <div class="section-heading">
        <div>
          <h2>會員概況</h2>
          <p>目前會員、管理員與 Email 驗證狀態。</p>
        </div>

        <RouterLink
          to="/admin/users"
          class="section-link"
        >
          查看會員管理
          <el-icon>
            <ArrowRight />
          </el-icon>
        </RouterLink>
      </div>

      <div class="summary-grid">
        <el-card
          v-for="item in memberSummaryItems"
          :key="item.label"
          shadow="never"
          class="summary-card"
        >
          <div class="summary-card__content">
            <div class="summary-card__icon">
              <el-icon :size="24">
                <component :is="item.icon" />
              </el-icon>
            </div>

            <div>
              <span>{{ item.label }}</span>

              <strong v-if="!isUsersLoading">
                {{ item.value }}
              </strong>

              <el-skeleton
                v-else
                animated
                class="summary-skeleton"
              >
                <template #template>
                  <el-skeleton-item
                    variant="text"
                    class="summary-skeleton__value"
                  />
                </template>
              </el-skeleton>
            </div>
          </div>
        </el-card>
      </div>

      <el-alert
        v-if="usersError"
        type="error"
        :closable="false"
        show-icon
        title="會員統計資料載入失敗"
        description="管理功能仍可正常使用；請稍後重新整理頁面。"
      />
    </section>

    <section class="dashboard-section">
      <div class="section-heading">
        <div>
          <h2>Commerce / Content Summary</h2>
          <p>商城、訂單、論壇文章與店家內容統計。</p>
        </div>
      </div>

      <div class="summary-grid summary-grid--commerce">
        <el-card
          v-for="item in commerceSummaryItems"
          :key="item.label"
          shadow="never"
          class="summary-card"
        >
          <RouterLink
            :to="item.to"
            class="summary-link"
          >
            <div class="summary-card__content">
              <div class="summary-card__icon">
                <el-icon :size="24">
                  <component :is="item.icon" />
                </el-icon>
              </div>

              <div class="summary-card__body">
                <span>{{ item.label }}</span>

                <strong v-if="!item.loading">
                  {{ item.value }}
                </strong>

                <el-skeleton
                  v-else
                  animated
                  class="summary-skeleton"
                >
                  <template #template>
                    <el-skeleton-item
                      variant="text"
                      class="summary-skeleton__value"
                    />
                  </template>
                </el-skeleton>

                <small>{{ item.subLabel }}</small>
              </div>

              <el-icon class="summary-card__arrow">
                <ArrowRight />
              </el-icon>
            </div>
          </RouterLink>
        </el-card>
      </div>

      <el-alert
        v-if="commerceHasError"
        type="warning"
        :closable="false"
        show-icon
        title="部分 Dashboard 統計載入失敗"
        description="不影響各管理頁使用；可重新整理後再次取得資料。"
      />
    </section>


    <section class="dashboard-section">
      <div class="section-heading">
        <div>
          <h2>最近活動</h2>
          <p>快速查看最新加入會員與最新建立訂單。</p>
        </div>
      </div>

      <div class="activity-grid">
        <el-card
          shadow="never"
          class="activity-card"
        >
          <template #header>
            <div class="activity-card__header">
              <div>
                <strong>最近會員</strong>
                <span>最新加入的 5 位會員</span>
              </div>

              <RouterLink
                to="/admin/users"
                class="section-link"
              >
                全部會員
                <el-icon>
                  <ArrowRight />
                </el-icon>
              </RouterLink>
            </div>
          </template>

          <el-skeleton
            v-if="isUsersLoading"
            :rows="5"
            animated
          />

          <el-empty
            v-else-if="usersError"
            description="無法取得最近會員"
          />

          <el-empty
            v-else-if="recentMembers.length === 0"
            description="目前尚無會員"
          />

          <div
            v-else
            class="activity-list"
          >
            <RouterLink
              v-for="member in recentMembers"
              :key="member._id"
              :to="`/admin/users/${member._id}`"
              class="activity-item"
            >
              <el-avatar
                :size="42"
                :src="member.avatar || undefined"
              >
                {{ getMemberInitial(member.account, member.nickname) }}
              </el-avatar>

              <div class="activity-item__body">
                <strong>
                  {{ member.nickname || member.account }}
                </strong>

                <span>
                  @{{ member.account }}
                </span>
              </div>

              <div class="activity-item__meta">
                <el-tag
                  :type="member.role === 'admin' ? 'danger' : 'primary'"
                  size="small"
                  effect="light"
                >
                  {{ member.role === 'admin' ? '管理員' : '一般會員' }}
                </el-tag>

                <small>
                  {{ formatDateTime(member.createdAt) }}
                </small>
              </div>
            </RouterLink>
          </div>
        </el-card>

        <el-card
          shadow="never"
          class="activity-card"
        >
          <template #header>
            <div class="activity-card__header">
              <div>
                <strong>最近訂單</strong>
                <span>最新建立的 5 筆訂單</span>
              </div>

              <RouterLink
                to="/admin/orders"
                class="section-link"
              >
                全部訂單
                <el-icon>
                  <ArrowRight />
                </el-icon>
              </RouterLink>
            </div>
          </template>

          <el-skeleton
            v-if="isOrdersLoading"
            :rows="5"
            animated
          />

          <el-empty
            v-else-if="ordersError"
            description="無法取得最近訂單"
          />

          <el-empty
            v-else-if="recentOrders.length === 0"
            description="目前尚無訂單"
          />

          <div
            v-else
            class="activity-list"
          >
            <RouterLink
              v-for="order in recentOrders"
              :key="order._id"
              to="/admin/orders"
              class="activity-item activity-item--order"
            >
              <div class="order-badge">
                <el-icon :size="20">
                  <Tickets />
                </el-icon>
              </div>

              <div class="activity-item__body">
                <strong>
                  #{{ shortOrderId(order._id) }}
                </strong>

                <span>
                  {{ getOrderUserLabel(order) }}
                </span>
              </div>

              <div class="activity-item__meta">
                <strong class="order-total">
                  {{ formatCurrency(order.totalPrice) }}
                </strong>

                <div class="order-meta-row">
                  <el-tag
                    :type="orderStatusType(order.status)"
                    size="small"
                    effect="light"
                  >
                    {{ orderStatusText(order.status) }}
                  </el-tag>

                  <small>
                    {{ formatDateTime(order.createdAt) }}
                  </small>
                </div>
              </div>
            </RouterLink>
          </div>
        </el-card>
      </div>
    </section>

    <section class="management-section">
      <div class="section-heading">
        <div>
          <h2>管理項目</h2>
          <p>選擇要管理的內容。</p>
        </div>
      </div>

      <div class="management-grid">
        <RouterLink
          v-for="item in managementItems"
          :key="item.to"
          :to="item.to"
          class="management-link"
        >
          <el-card
            shadow="hover"
            class="management-card"
          >
            <div class="management-card__content">
              <div class="management-card__icon">
                <el-icon :size="26">
                  <component :is="item.icon" />
                </el-icon>
              </div>

              <div class="management-card__body">
                <strong>{{ item.title }}</strong>
                <p>{{ item.description }}</p>
              </div>

              <el-icon class="management-card__arrow">
                <ArrowRight />
              </el-icon>
            </div>
          </el-card>
        </RouterLink>
      </div>
    </section>

    <section class="notice-panel">
      <div class="notice-panel__icon">
        <el-icon :size="22">
          <InfoFilled />
        </el-icon>
      </div>

      <div>
        <h2>管理提醒</h2>

        <p>
          商品上下架、訂單處理、文章與店家審核狀態都會直接影響前台結果；
          會員角色調整也會影響後台權限。
        </p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onMounted,
} from 'vue'
import { storeToRefs } from 'pinia'

import {
  ArrowRight,
  CircleCheckFilled,
  Document,
  Goods,
  InfoFilled,
  Shop,
  Tickets,
  User,
  UserFilled,
} from '@element-plus/icons-vue'

import { useAdminUsersQuery } from '@/queries/adminUsers'
import { useAdminProductsQuery } from '@/queries/products'
import { useAdminOrdersQuery } from '@/queries/order'
import { useAdminArticlesQuery } from '@/queries/article'
import { useAdminShopStore } from '@/stores/adminShop'
import type {
  IOrder,
  IOrderUser,
  OrderStatus,
} from '@/types/order'

const {
  data: users,
  isLoading: isUsersLoading,
  error: usersError,
} = useAdminUsersQuery()

const {
  data: products,
  isLoading: isProductsLoading,
  error: productsError,
} = useAdminProductsQuery()

const {
  data: orders,
  isLoading: isOrdersLoading,
  error: ordersError,
} = useAdminOrdersQuery()

const {
  data: articles,
  isLoading: isArticlesLoading,
  error: articlesError,
} = useAdminArticlesQuery()

const adminShopStore =
  useAdminShopStore()

const {
  adminShops,
  loading: isShopsLoading,
  error: shopsError,
} = storeToRefs(adminShopStore)

const userList = computed(
  () => users.value ?? [],
)

const productList = computed(
  () => products.value ?? [],
)

const orderList = computed(
  () => orders.value ?? [],
)

const articleList = computed(
  () => articles.value ?? [],
)

const totalMemberCount = computed(
  () => userList.value.length,
)

const normalMemberCount = computed(
  () =>
    userList.value.filter(
      user => user.role === 'user',
    ).length,
)

const adminMemberCount = computed(
  () =>
    userList.value.filter(
      user => user.role === 'admin',
    ).length,
)

const verifiedMemberCount = computed(
  () =>
    userList.value.filter(
      user => user.emailVerified,
    ).length,
)

const totalProductCount = computed(
  () => productList.value.length,
)

const sellingProductCount = computed(
  () =>
    productList.value.filter(
      product => product.sell,
    ).length,
)

const totalOrderCount = computed(
  () => orderList.value.length,
)

const pendingOrderCount = computed(
  () =>
    orderList.value.filter(
      order => order.status === 'pending',
    ).length,
)

const totalArticleCount = computed(
  () => articleList.value.length,
)

const pendingArticleCount = computed(
  () =>
    articleList.value.filter(
      article => article.status === 'pending',
    ).length,
)

const totalShopCount = computed(
  () => adminShops.value.length,
)

const pendingShopCount = computed(
  () =>
    adminShops.value.filter(
      shop => shop.status === 'pending',
    ).length,
)

const recentMembers = computed(
  () =>
    [...userList.value]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime()
          - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5),
)

const recentOrders = computed(
  () =>
    [...orderList.value]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime()
          - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5),
)

type TagType =
  | 'primary'
  | 'success'
  | 'warning'
  | 'info'
  | 'danger'

function getMemberInitial(
  account: string,
  nickname: string,
): string {
  const value = String(
    nickname || account || 'U',
  ).trim()

  return value
    ? value.charAt(0).toUpperCase()
    : 'U'
}

function getOrderUser(
  order: IOrder,
): IOrderUser | null {
  return typeof order.user === 'object'
    ? order.user
    : null
}

function getOrderUserLabel(
  order: IOrder,
): string {
  const user = getOrderUser(order)

  if (!user) {
    return '會員資料不可用'
  }

  return user.nickname
    ? `${user.account}（${user.nickname}）`
    : user.account
}

function shortOrderId(
  id: string,
): string {
  return id.slice(-8).toUpperCase()
}

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

function formatDateTime(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    'zh-TW',
    {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    },
  ).format(new Date(value))
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

const memberSummaryItems = computed(() => [
  {
    label: '全部會員',
    value: totalMemberCount.value,
    icon: UserFilled,
  },
  {
    label: '一般會員',
    value: normalMemberCount.value,
    icon: User,
  },
  {
    label: '管理員',
    value: adminMemberCount.value,
    icon: UserFilled,
  },
  {
    label: 'Email 已驗證',
    value: verifiedMemberCount.value,
    icon: CircleCheckFilled,
  },
])

const commerceSummaryItems = computed(() => [
  {
    label: '商品數量',
    value: totalProductCount.value,
    subLabel: `上架 ${sellingProductCount.value} 件`,
    icon: Goods,
    to: '/admin/products',
    loading: isProductsLoading.value,
  },
  {
    label: '訂單數量',
    value: totalOrderCount.value,
    subLabel: `待處理 ${pendingOrderCount.value} 筆`,
    icon: Tickets,
    to: '/admin/orders',
    loading: isOrdersLoading.value,
  },
  {
    label: '文章數量',
    value: totalArticleCount.value,
    subLabel: `待審核 ${pendingArticleCount.value} 篇`,
    icon: Document,
    to: '/admin/articles',
    loading: isArticlesLoading.value,
  },
  {
    label: '店家數量',
    value: totalShopCount.value,
    subLabel: `待審核 ${pendingShopCount.value} 間`,
    icon: Shop,
    to: '/admin/shops',
    loading: isShopsLoading.value,
  },
])

const commerceHasError = computed(
  () =>
    Boolean(
      productsError.value
      || ordersError.value
      || articlesError.value
      || shopsError.value,
    ),
)

const managementItems = [
  {
    title: '會員管理',
    description: '查看會員資料、Email 驗證狀態與帳號角色。',
    to: '/admin/users',
    icon: UserFilled,
  },
  {
    title: '文章管理',
    description: '管理拉麵文章、內容與審核狀態。',
    to: '/admin/articles',
    icon: Document,
  },
  {
    title: '店家管理',
    description: '管理拉麵店家資料與審核狀態。',
    to: '/admin/shops',
    icon: Shop,
  },
  {
    title: '訂單管理',
    description: '查看會員訂單與處理訂單狀態。',
    to: '/admin/orders',
    icon: Tickets,
  },
  {
    title: '商品管理',
    description: '管理商城商品、價格、分類與上下架。',
    to: '/admin/products',
    icon: Goods,
  },
] as const

onMounted(async () => {
  try {
    await adminShopStore.getAdminShops()
  } catch {
    // error 已由 store 保存，Dashboard 只顯示統一警告。
  }
})
</script>

<style scoped lang="scss">
.admin-home-page {
  display: grid;
  gap: 24px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;

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

.dashboard-section,
.management-section {
  display: grid;
  gap: 16px;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;

  h2 {
    margin: 0;
    color: var(--el-text-color-primary);
    font-size: 1.05rem;
  }

  p {
    margin: 6px 0 0;
    color: var(--el-text-color-secondary);
    font-size: 0.875rem;
  }
}

.section-link {
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
  gap: 4px;
  color: var(--el-color-primary);
  font-size: 0.875rem;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.summary-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.summary-card {
  height: 100%;
  border-radius: 12px;

  :deep(.el-card__body) {
    height: 100%;
    padding: 18px;
  }
}

.summary-link {
  display: block;
  height: 100%;
  color: inherit;
  text-decoration: none;
}

.summary-card__content {
  display: flex;
  height: 100%;
  align-items: center;
  gap: 14px;

  span {
    display: block;
    margin-bottom: 6px;
    color: var(--el-text-color-secondary);
    font-size: 0.8125rem;
  }

  strong {
    display: block;
    color: var(--el-text-color-primary);
    font-size: 1.6rem;
    line-height: 1;
  }
}

.summary-card__body {
  min-width: 0;
  flex: 1;

  small {
    display: block;
    margin-top: 7px;
    color: var(--el-text-color-secondary);
    font-size: 0.75rem;
  }
}

.summary-card__icon {
  display: grid;
  flex: 0 0 46px;
  width: 46px;
  height: 46px;
  place-items: center;
  border-radius: 12px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.summary-card__arrow {
  color: var(--el-text-color-placeholder);
  transition:
    color 0.2s ease,
    transform 0.2s ease;
}

.summary-link:hover {
  .summary-card__arrow {
    color: var(--el-color-primary);
    transform: translateX(3px);
  }
}

.summary-skeleton {
  width: 52px;
}

.summary-skeleton__value {
  width: 52px;
  height: 24px;
}

.activity-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.activity-card {
  overflow: hidden;
  border-radius: 12px;

  :deep(.el-card__header) {
    padding: 16px 18px;
  }

  :deep(.el-card__body) {
    padding: 0;
  }
}

.activity-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  > div {
    display: grid;
    gap: 4px;
  }

  strong {
    color: var(--el-text-color-primary);
    font-size: 1rem;
  }

  span {
    color: var(--el-text-color-secondary);
    font-size: 0.8125rem;
  }
}

.activity-list {
  display: grid;
}

.activity-item {
  display: grid;
  grid-template-columns:
    auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 14px 18px;
  border-bottom: 1px solid
    var(--el-border-color-lighter);
  color: inherit;
  text-decoration: none;
  transition: background 0.2s ease;

  &:last-child {
    border-bottom: 0;
  }

  &:hover {
    background:
      var(--el-fill-color-extra-light);
  }
}

.activity-item__body {
  display: grid;
  min-width: 0;
  gap: 3px;

  strong,
  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    color: var(--el-text-color-primary);
  }

  span {
    color: var(--el-text-color-secondary);
    font-size: 0.8125rem;
  }
}

.activity-item__meta {
  display: grid;
  justify-items: end;
  gap: 6px;

  small {
    color: var(--el-text-color-secondary);
    font-size: 0.72rem;
    white-space: nowrap;
  }
}

.order-badge {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 10px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.order-total {
  color: var(--el-text-color-primary);
  font-size: 0.9rem;
}

.order-meta-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.management-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.management-link {
  min-width: 0;
  color: inherit;
  text-decoration: none;
}

.management-card {
  height: 100%;
  border-radius: 12px;

  :deep(.el-card__body) {
    height: 100%;
    padding: 20px;
  }
}

.management-card__content {
  display: grid;
  grid-template-columns:
    52px minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  min-height: 82px;
}

.management-card__icon {
  display: grid;
  width: 52px;
  height: 52px;
  place-items: center;
  border-radius: 12px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.management-card__body {
  min-width: 0;

  strong {
    display: block;
    margin-bottom: 6px;
    color: var(--el-text-color-primary);
    font-size: 1rem;
  }

  p {
    margin: 0;
    color: var(--el-text-color-secondary);
    font-size: 0.875rem;
    line-height: 1.6;
  }
}

.management-card__arrow {
  color: var(--el-text-color-placeholder);
  transition:
    color 0.2s ease,
    transform 0.2s ease;
}

.management-link:hover {
  .management-card__arrow {
    color: var(--el-color-primary);
    transform: translateX(3px);
  }
}

.notice-panel {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px 20px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  background: var(--el-fill-color-extra-light);

  h2 {
    margin: 0 0 6px;
    color: var(--el-text-color-primary);
    font-size: 0.95rem;
  }

  p {
    margin: 0;
    color: var(--el-text-color-secondary);
    font-size: 0.875rem;
    line-height: 1.7;
  }
}

.notice-panel__icon {
  display: grid;
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 10px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

@media (max-width: 1100px) {
  .summary-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .activity-grid,
  .management-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .admin-home-page {
    gap: 20px;
  }

  .page-header,
  .section-heading {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .summary-grid,
  .activity-grid,
  .management-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .management-card {
    :deep(.el-card__body) {
      padding: 16px;
    }
  }

  .management-card__content {
    grid-template-columns:
      44px minmax(0, 1fr) auto;
    gap: 12px;
    min-height: 72px;
  }

  .management-card__icon {
    width: 44px;
    height: 44px;
    border-radius: 10px;
  }

  .management-card__body {
    p {
      font-size: 0.8125rem;
    }
  }

  .activity-card__header {
    align-items: flex-start;
  }

  .activity-item {
    grid-template-columns:
      auto minmax(0, 1fr);
  }

  .activity-item__meta {
    grid-column: 2;
    justify-items: start;
  }

  .order-meta-row {
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .notice-panel {
    padding: 16px;
  }
}

@media (max-width: 420px) {
  .management-card__content {
    grid-template-columns:
      40px minmax(0, 1fr);
  }

  .management-card__icon {
    width: 40px;
    height: 40px;
  }

  .management-card__arrow,
  .summary-card__arrow {
    display: none;
  }
}

/* Step 6-5.6 RWD final regression */
.admin-home-page {
  width: 100%;
  min-width: 0;
}

@media (max-width: 1024px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .management-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-header,
  .section-heading {
    flex-direction: column;
    align-items: flex-start;
  }

  .activity-grid {
    grid-template-columns: 1fr;
  }

  .activity-card__header {
    align-items: flex-start;
  }

  .notice-panel {
    align-items: flex-start;
  }
}

@media (max-width: 640px) {
  .admin-home-page {
    gap: 16px;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .summary-card :deep(.el-card__body) {
    padding: 16px;
  }

  .summary-card__content {
    gap: 12px;
  }

  .activity-item {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .activity-item__meta {
    grid-column: 2;
    justify-items: start;
  }

  .management-card__content {
    grid-template-columns: 44px minmax(0, 1fr);
  }

  .management-card__arrow,
  .summary-card__arrow {
    display: none;
  }
}

@media (max-width: 420px) {
  .page-header h1 {
    font-size: 1.4rem;
  }

  .summary-card__icon,
  .management-card__icon {
    width: 40px;
    height: 40px;
    flex-basis: 40px;
  }

  .activity-item {
    padding: 12px 14px;
  }
}

</style>

<route lang="yaml">
meta:
  layout: admin
  access: authenticated
  roles:
    - admin
  title: 後台管理
</route>
