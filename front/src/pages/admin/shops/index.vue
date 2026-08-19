<template>
  <section class="admin-shops-page">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">
          SHOP MANAGEMENT
        </p>
        <h1>店家管理</h1>
        <p class="page-description">
          管理拉麵店家資料、審核狀態與公開內容。
        </p>
      </div>
    </header>

    <div class="overview-grid">
      <div class="overview-card">
        <span>全部店家</span>
        <strong>{{ totalCount }}</strong>
      </div>

      <div class="overview-card">
        <span>待審核</span>
        <strong>{{ pendingCount }}</strong>
      </div>

      <div class="overview-card">
        <span>已通過</span>
        <strong>{{ approvedCount }}</strong>
      </div>
    </div>

    <AppLoading
      :loading="loading"
      text="正在載入店家..."
      min-height="360px"
    >
      <AppCard
        v-if="error"
        class="management-card"
      >
        <AppEmpty description="無法取得店家資料">
          <AppButton
            type="primary"
            :loading="isReloading"
            @click="reloadShops"
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
            placeholder="搜尋店名、Slug 或地址"
          />

          <el-select
            v-model="cityFilter"
            clearable
            placeholder="縣市"
          >
            <el-option
              v-for="city in cityOptions"
              :key="city"
              :label="city"
              :value="city"
            />
          </el-select>

          <el-select
            v-model="statusFilter"
            clearable
            placeholder="審核狀態"
          >
            <el-option
              label="草稿"
              value="draft"
            />

            <el-option
              label="待審核"
              value="pending"
            />

            <el-option
              label="已通過"
              value="approved"
            />

            <el-option
              label="已拒絕"
              value="rejected"
            />
          </el-select>
        </div>

        <el-empty
          v-if="filteredShops.length === 0"
          description="目前沒有符合條件的店家"
        />

        <el-table
          v-else
          :data="filteredShops"
          row-key="_id"
          stripe
          class="shop-table"
        >
          <el-table-column
            label="店家"
            min-width="280"
          >
            <template #default="{ row }">
              <div class="shop-cell">
                <img
                  v-if="row.coverImage"
                  :src="row.coverImage"
                  :alt="row.name"
                  class="shop-cell__image"
                />

                <div
                  v-else
                  class="shop-cell__placeholder"
                >
                  無圖
                </div>

                <div class="shop-cell__content">
                  <strong>
                    {{ row.name }}
                  </strong>

                  <span>
                    /{{ row.slug }}
                  </span>

                  <small>
                    {{ row.address }}
                  </small>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column
            label="地區"
            min-width="130"
          >
            <template #default="{ row }">
              {{ row.city }}
              {{ row.district }}
            </template>
          </el-table-column>

          <el-table-column
            label="申請會員"
            min-width="140"
          >
            <template #default="{ row }">
              {{ getOwnerName(row.createdBy) }}
            </template>
          </el-table-column>

          <el-table-column
            label="狀態"
            width="100"
          >
            <template #default="{ row }">
              <el-tag
                :type="shopStatusType(row.status)"
                effect="light"
              >
                {{ shopStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column
            label="建立時間"
            min-width="170"
          >
            <template #default="{ row }">
              {{ formatDateTime(row.createdAt) }}
            </template>
          </el-table-column>

          <el-table-column
            label="更新時間"
            min-width="170"
          >
            <template #default="{ row }">
              {{ formatDateTime(row.updatedAt) }}
            </template>
          </el-table-column>

          <el-table-column
            label="操作"
            width="300"
            fixed="right"
          >
            <template #default="{ row }">
              <div class="table-actions">
                <AppButton
                  v-if="row.status === 'pending'"
                  type="success"
                  plain
                  :loading="reviewingId === row._id"
                  @click="
                    reviewShop(
                      row,
                      'approved',
                    )
                  "
                >
                  通過
                </AppButton>

                <AppButton
                  v-if="row.status === 'pending'"
                  type="danger"
                  plain
                  :loading="reviewingId === row._id"
                  @click="
                    reviewShop(
                      row,
                      'rejected',
                    )
                  "
                >
                  拒絕
                </AppButton>

                <AppButton
                  type="primary"
                  plain
                  @click="openDetailDialog(row)"
                >
                  查看
                </AppButton>

                <AppButton
                  v-if="row.status === 'approved'"
                  plain
                  @click="openPublicShop(row.slug)"
                >
                  公開頁
                </AppButton>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </AppCard>
    </AppLoading>

    <el-dialog
      v-model="detailDialogVisible"
      title="店家資料"
      width="min(760px, 94vw)"
    >
      <div
        v-if="selectedShop"
        class="detail-panel"
      >
        <img
          v-if="selectedShop.coverImage"
          :src="selectedShop.coverImage"
          :alt="selectedShop.name"
          class="detail-panel__cover"
        />

        <dl class="detail-list">
          <div>
            <dt>店家名稱</dt>
            <dd>{{ selectedShop.name }}</dd>
          </div>

          <div>
            <dt>Slug</dt>
            <dd>{{ selectedShop.slug }}</dd>
          </div>

          <div class="detail-list__full">
            <dt>店家介紹</dt>
            <dd class="pre-wrap">
              {{ selectedShop.description }}
            </dd>
          </div>

          <div>
            <dt>縣市</dt>
            <dd>{{ selectedShop.city }}</dd>
          </div>

          <div>
            <dt>行政區</dt>
            <dd>{{ selectedShop.district }}</dd>
          </div>

          <div class="detail-list__full">
            <dt>地址</dt>
            <dd>{{ selectedShop.address }}</dd>
          </div>

          <div>
            <dt>電話</dt>
            <dd>{{ selectedShop.phone || '未提供' }}</dd>
          </div>

          <div>
            <dt>營業時間</dt>
            <dd>{{ selectedShop.openingHours || '未提供' }}</dd>
          </div>

          <div class="detail-list__full">
            <dt>官方網站</dt>
            <dd>
              <a
                v-if="selectedShop.website"
                :href="selectedShop.website"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ selectedShop.website }}
              </a>

              <span v-else>
                未提供
              </span>
            </dd>
          </div>

          <div>
            <dt>狀態</dt>
            <dd>
              <el-tag
                :type="shopStatusType(selectedShop.status)"
                effect="light"
              >
                {{ shopStatusText(selectedShop.status) }}
              </el-tag>
            </dd>
          </div>

          <div>
            <dt>更新時間</dt>
            <dd>{{ formatDateTime(selectedShop.updatedAt) }}</dd>
          </div>
        </dl>
      </div>

      <template #footer>
        <div class="dialog-actions">
          <AppButton @click="detailDialogVisible = false">
            關閉
          </AppButton>

          <AppButton
            v-if="selectedShop?.status === 'pending'"
            type="success"
            plain
            :loading="reviewingId === selectedShop._id"
            @click="reviewShop(selectedShop, 'approved')"
          >
            通過
          </AppButton>

          <AppButton
            v-if="selectedShop?.status === 'pending'"
            type="danger"
            plain
            :loading="reviewingId === selectedShop._id"
            @click="reviewShop(selectedShop, 'rejected')"
          >
            拒絕
          </AppButton>
        </div>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import {
  computed,
  onMounted,
  ref,
} from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'

import { useAdminShopStore } from '@/stores/adminShop'
import { useSnackbarStore } from '@/stores/snackbar'

import type {
  Shop,
  ShopOwner,
  ShopStatus,
} from '@/types/shop'

definePage({
  meta: {
    access: 'authenticated',
    roles: ['admin'],
  },
})

type ReviewStatus = Extract<
  ShopStatus,
  'approved' | 'rejected'
>

type StatusFilter =
  | ''
  | ShopStatus

type ShopTagType =
  | 'primary'
  | 'success'
  | 'warning'
  | 'info'
  | 'danger'

const router = useRouter()
const snackbar = useSnackbarStore()

const adminShopStore =
  useAdminShopStore()

const {
  adminShops,
  loading,
  error,
} = storeToRefs(adminShopStore)

const search = ref('')
const cityFilter = ref('')
const statusFilter =
  ref<StatusFilter>('')

const reviewingId =
  ref<string | null>(null)

const isReloading = ref(false)

const selectedShop =
  ref<Shop | null>(null)

const detailDialogVisible =
  ref(false)

const totalCount = computed(() => adminShops.value.length)

const pendingCount = computed(
  () => adminShops.value.filter(shop => shop.status === 'pending').length,
)

const approvedCount = computed(
  () => adminShops.value.filter(shop => shop.status === 'approved').length,
)

const cityOptions = computed(() => {
  return [
    ...new Set(
      adminShops.value
        .map(shop => shop.city)
        .filter(Boolean),
    ),
  ].sort()
})

const filteredShops = computed(() => {
  const keyword =
    search.value
      .trim()
      .toLowerCase()

  return adminShops.value.filter(
    shop => {
      if (
        cityFilter.value &&
        shop.city !== cityFilter.value
      ) {
        return false
      }

      if (
        statusFilter.value &&
        shop.status !== statusFilter.value
      ) {
        return false
      }

      if (!keyword) {
        return true
      }

      return [
        shop.name,
        shop.slug,
        shop.address,
        shop.city,
        shop.district,
      ].some(value =>
        value
          .toLowerCase()
          .includes(keyword),
      )
    },
  )
})

function getOwnerName(
  createdBy: string | ShopOwner,
): string {
  if (
    typeof createdBy === 'string'
  ) {
    return createdBy
  }

  return (
    createdBy.nickname ||
    createdBy.account ||
    '-'
  )
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
      hour12: false,
    },
  ).format(new Date(value))
}

function shopStatusText(
  status: ShopStatus,
): string {
  const labels: Record<
    ShopStatus,
    string
  > = {
    draft: '草稿',
    pending: '待審核',
    approved: '已通過',
    rejected: '已拒絕',
  }

  return labels[status]
}

function shopStatusType(
  status: ShopStatus,
): ShopTagType {
  const types: Record<
    ShopStatus,
    ShopTagType
  > = {
    draft: 'info',
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
  }

  return types[status]
}

function openDetailDialog(
  shop: Shop,
): void {
  selectedShop.value = shop
  detailDialogVisible.value = true
}

function openPublicShop(
  slug: string,
): void {
  void router.push(
    `/shops/${slug}`,
  )
}

async function reviewShop(
  shop: Shop,
  status: ReviewStatus,
): Promise<void> {
  if (reviewingId.value) {
    return
  }

  const action =
    status === 'approved'
      ? '通過'
      : '拒絕'

  try {
    await ElMessageBox.confirm(
      `確定要${action}「${shop.name}」嗎？`,
      '店家審核',
      {
        confirmButtonText: action,
        cancelButtonText: '取消',
        type:
          status === 'approved'
            ? 'success'
            : 'warning',
      },
    )
  } catch {
    return
  }

  reviewingId.value = shop._id

  try {
    const updatedShop =
      await adminShopStore.updateShopStatus(
        shop._id,
        status,
      )

    if (
      selectedShop.value?._id ===
      shop._id
    ) {
      selectedShop.value =
        updatedShop
    }

    snackbar.add({
      text:
        status === 'approved'
          ? '店家審核通過'
          : '店家已拒絕',
      color: 'success',
    })
  } catch (error) {
    snackbar.addError(error)
  } finally {
    reviewingId.value = null
  }
}

async function reloadShops():
Promise<void> {
  if (isReloading.value) {
    return
  }

  isReloading.value = true

  try {
    await adminShopStore.getAdminShops()
  } finally {
    isReloading.value = false
  }
}

onMounted(async () => {
  try {
    await adminShopStore.getAdminShops()
  } catch (error) {
    console.error(
      '取得店家管理列表失敗：',
      error,
    )
  }
})
</script>

<style scoped lang="scss">
.admin-shops-page {
  display: grid;
  gap: 20px;
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
  grid-template-columns: minmax(280px, 1fr) 180px 170px;
  gap: 12px;
  margin-bottom: 18px;
  padding: 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  background: var(--el-fill-color-extra-light);
}

.shop-table {
  width: 100%;
}

.shop-cell {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;

  &__image,
  &__placeholder {
    width: 56px;
    height: 56px;
    flex: 0 0 56px;
    border-radius: 8px;
  }

  &__image {
    object-fit: cover;
  }

  &__placeholder {
    display: grid;
    place-items: center;
    background: var(--el-fill-color-light);
    color: var(--el-text-color-secondary);
    font-size: 0.75rem;
  }

  &__content {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 4px;

    strong {
      color: var(--el-text-color-primary);
    }

    span,
    small {
      overflow: hidden;
      color: var(--el-text-color-secondary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    span {
      font-size: 0.8rem;
    }
  }
}

.table-actions,
.dialog-actions {
  display: flex;
  gap: 8px;

  :deep(.el-button) {
    margin-left: 0;
  }
}

.dialog-actions {
  justify-content: flex-end;
}

.detail-panel {
  &__cover {
    display: block;
    width: 100%;
    max-height: 320px;
    margin-bottom: 24px;
    border-radius: 12px;
    object-fit: cover;
  }
}

.detail-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 24px;
  margin: 0;

  > div {
    display: grid;
    grid-template-columns: 100px minmax(0, 1fr);
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  &__full {
    grid-column: 1 / -1;
  }

  dt {
    color: var(--el-text-color-secondary);
    font-size: 0.8125rem;
    font-weight: 600;
  }

  dd {
    margin: 0;
    overflow-wrap: anywhere;
  }

  a {
    color: var(--el-color-primary);
  }
}

.pre-wrap {
  white-space: pre-wrap;
}

@media (max-width: 900px) {
  .overview-grid {
    grid-template-columns: 1fr;
  }

  .toolbar {
    grid-template-columns: 1fr 1fr;
  }

  .toolbar > :first-child {
    grid-column: 1 / -1;
  }
}

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
  }

  .toolbar {
    grid-template-columns: 1fr;
  }

  .toolbar > :first-child {
    grid-column: auto;
  }

  .detail-list {
    grid-template-columns: 1fr;

    > div,
    &__full {
      grid-column: auto;
    }
  }
}

/* Step 6-5.6 RWD final regression */
.admin-shops-page {
  width: 100%;
  min-width: 0;
}

@media (max-width: 1024px) {
  .overview-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .management-card :deep(.el-card__body) {
    overflow-x: auto;
  }

  .shop-table {
    min-width: 920px;
  }

  .detail-list {
    grid-template-columns: 1fr;
  }

  .detail-list > div,
  .detail-list__full {
    grid-column: auto;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
  }

  .toolbar {
    grid-template-columns: 1fr;
  }

  .toolbar > :first-child {
    grid-column: auto;
  }

  .table-actions {
    flex-wrap: wrap;
  }
}

@media (max-width: 640px) {
  .overview-grid {
    grid-template-columns: 1fr;
  }

  .overview-card {
    min-height: 78px;
    padding: 14px 16px;
  }

  .toolbar {
    padding: 14px;
  }

  .detail-list > div {
    grid-template-columns: 88px minmax(0, 1fr);
  }
}

</style>

<route lang="yaml">
meta:
  layout: admin
  access: authenticated
  roles:
    - admin
  title: 店家管理
</route>
