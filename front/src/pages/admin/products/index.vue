<template>
  <div class="admin-product-page">
    <div class="page-header">
      <div>
        <p class="page-eyebrow">
          PRODUCT MANAGEMENT
        </p>

        <h1>
          商品管理
        </h1>

        <p class="page-description">
          管理拉麵商城商品、分類、價格與上下架狀態。
        </p>
      </div>

      <RouterLink
        to="/admin/products/create"
        class="create-link"
      >
        <el-button type="primary">
          <el-icon>
            <Plus />
          </el-icon>
          新增商品
        </el-button>
      </RouterLink>
    </div>

    <div class="overview-grid">
      <div class="overview-card">
        <span>全部商品</span>
        <strong>{{ totalCount }}</strong>
      </div>

      <div class="overview-card">
        <span>已上架</span>
        <strong>{{ sellingCount }}</strong>
      </div>

      <div class="overview-card">
        <span>已下架</span>
        <strong>{{ hiddenCount }}</strong>
      </div>
    </div>

    <div class="filter-panel">
      <el-input
        v-model="search"
        clearable
        class="filter-control filter-search"
        placeholder="搜尋商品名稱、分類或說明"
        :prefix-icon="Search"
      />

      <el-select
        v-model="selectedCategory"
        clearable
        class="filter-control"
        placeholder="全部分類"
      >
        <el-option
          v-for="option in productCategoryOptions"
          :key="option"
          :label="option"
          :value="option"
        />
      </el-select>

      <el-select
        v-model="selectedStatus"
        class="filter-control"
        placeholder="全部狀態"
      >
        <el-option
          label="全部狀態"
          value="all"
        />
        <el-option
          label="已上架"
          value="selling"
        />
        <el-option
          label="已下架"
          value="hidden"
        />
      </el-select>

      <el-button
        v-if="hasActiveFilters"
        @click="resetFilters"
      >
        清除篩選
      </el-button>
    </div>

    <div class="table-panel">
      <div
        v-if="isLoading"
        class="page-state"
      >
        商品資料讀取中...
      </div>

      <div
        v-else-if="error"
        class="page-state page-state--error"
      >
        商品資料讀取失敗，請稍後再試。
      </div>

      <div
        v-else-if="filteredProducts.length === 0"
        class="empty-state"
      >
        <div class="empty-state__icon">
          🍜
        </div>

        <h2>
          {{ hasActiveFilters ? '找不到符合條件的商品' : '目前尚無商品' }}
        </h2>

        <p>
          {{
            hasActiveFilters
              ? '請調整搜尋條件或清除篩選後再試一次。'
              : '建立第一筆商品後，就會顯示在這裡。'
          }}
        </p>

        <RouterLink
          v-if="!hasActiveFilters"
          to="/admin/products/create"
          class="create-link"
        >
          <el-button type="primary">
            新增第一筆商品
          </el-button>
        </RouterLink>
      </div>

      <el-table
        v-else
        :data="filteredProducts"
        stripe
        class="product-table"
      >
        <el-table-column
          label="商品"
          min-width="260"
        >
          <template #default="{ row }">
            <div class="product-cell">
              <el-image
                class="product-image"
                fit="cover"
                :src="row.imageUrl"
                :alt="row.name"
              >
                <template #error>
                  <div class="product-image__fallback">
                    無圖片
                  </div>
                </template>
              </el-image>

              <div class="product-cell__content">
                <strong class="product-name">
                  {{ row.name }}
                </strong>

                <span class="product-id">
                  {{ row._id }}
                </span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column
          prop="category"
          label="分類"
          min-width="130"
        >
          <template #default="{ row }">
            <el-tag
              effect="plain"
              type="info"
            >
              {{ row.category }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          label="價格"
          width="120"
          sortable
          prop="price"
        >
          <template #default="{ row }">
            NT$ {{ formatPrice(row.price) }}
          </template>
        </el-table-column>

        <el-table-column
          label="狀態"
          width="110"
        >
          <template #default="{ row }">
            <el-tag
              :type="row.sell ? 'success' : 'info'"
              effect="light"
            >
              {{ row.sell ? '已上架' : '已下架' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          label="最後更新"
          min-width="170"
          sortable
          prop="updatedAt"
        >
          <template #default="{ row }">
            {{ formatDate(row.updatedAt) }}
          </template>
        </el-table-column>

        <el-table-column
          label="操作"
          fixed="right"
          width="110"
          align="center"
        >
          <template #default="{ row }">
            <RouterLink
              :to="`/admin/products/${row._id}/edit`"
              class="action-link"
            >
              <el-button
                size="small"
                plain
              >
                <el-icon>
                  <Edit />
                </el-icon>
                編輯
              </el-button>
            </RouterLink>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Edit, Plus, Search } from '@element-plus/icons-vue'
import { computed, ref } from 'vue'

import { useAdminProductsQuery } from '@/queries/products'
import {
  productCategoryOptions,
  type TCategoryOptions,
} from '@/types/products'

type ProductStatusFilter =
  | 'all'
  | 'selling'
  | 'hidden'

const {
  data: products,
  isLoading,
  error,
} = useAdminProductsQuery()

const search = ref('')
const selectedCategory = ref<TCategoryOptions | ''>('')
const selectedStatus = ref<ProductStatusFilter>('all')

const productList = computed(() => products.value ?? [])

const totalCount = computed(() => productList.value.length)

const sellingCount = computed(
  () => productList.value.filter(product => product.sell).length,
)

const hiddenCount = computed(
  () => productList.value.filter(product => !product.sell).length,
)

const hasActiveFilters = computed(
  () =>
    Boolean(search.value.trim())
    || Boolean(selectedCategory.value)
    || selectedStatus.value !== 'all',
)

const filteredProducts = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  return productList.value.filter(product => {
    const matchesKeyword =
      !keyword
      || [
        product.name,
        product.category,
        product.description,
        product._id,
      ].some(value =>
        String(value).toLowerCase().includes(keyword),
      )

    const matchesCategory =
      !selectedCategory.value
      || product.category === selectedCategory.value

    const matchesStatus =
      selectedStatus.value === 'all'
      || (
        selectedStatus.value === 'selling'
          ? product.sell
          : !product.sell
      )

    return (
      matchesKeyword
      && matchesCategory
      && matchesStatus
    )
  })
})

function resetFilters() {
  search.value = ''
  selectedCategory.value = ''
  selectedStatus.value = 'all'
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('zh-TW').format(value)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}
</script>

<style scoped lang="scss">
.admin-product-page {
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

.create-link,
.action-link {
  text-decoration: none;
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

.filter-panel,
.table-panel {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  background: var(--el-bg-color);
}

.filter-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px;
}

.filter-control {
  width: 180px;
}

.filter-search {
  width: min(100%, 380px);
}

.table-panel {
  overflow: hidden;
}

.product-table {
  width: 100%;
}

.product-cell {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
}

.product-image {
  width: 56px;
  height: 56px;
  flex: 0 0 56px;
  overflow: hidden;
  border-radius: 8px;
  background: var(--el-fill-color-light);
}

.product-image__fallback {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  color: var(--el-text-color-secondary);
  font-size: 0.75rem;
}

.product-cell__content {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
}

.product-name {
  overflow: hidden;
  color: var(--el-text-color-primary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-id {
  overflow: hidden;
  max-width: 190px;
  color: var(--el-text-color-secondary);
  font-size: 0.75rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.page-state,
.empty-state {
  display: grid;
  min-height: 280px;
  place-items: center;
  padding: 40px 24px;
  text-align: center;
}

.page-state--error {
  color: var(--el-color-danger);
}

.empty-state {
  align-content: center;

  h2 {
    margin: 12px 0 6px;
    font-size: 1.1rem;
  }

  p {
    margin: 0 0 18px;
    color: var(--el-text-color-secondary);
  }
}

.empty-state__icon {
  font-size: 2.25rem;
}

@media (max-width: 900px) {
  .page-header {
    align-items: stretch;
  }

  .overview-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
  }

  .page-header .create-link,
  .page-header .create-link :deep(.el-button) {
    width: 100%;
  }

  .filter-panel {
    flex-direction: column;
  }

  .filter-control,
  .filter-search {
    width: 100%;
  }
}
</style>

<route lang="yaml">
meta:
  layout: admin
  access: authenticated
  roles:
    - admin
  title: 商品管理
</route>
