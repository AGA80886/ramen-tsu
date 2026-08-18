<template>
  <main class="store-page">
    <section class="store-hero">
      <div class="page-container store-hero__inner">
        <div>
          <p class="store-hero__eyebrow">
            RAMEN STORE
          </p>

          <h1>拉麵商城</h1>

          <p class="store-hero__description">
            精選泡麵、拉麵食材、餐具與周邊商品，
            依照分類、關鍵字與價格排序快速找到想買的商品。
          </p>
        </div>
      </div>
    </section>

    <section class="page-container store-content">
      <div class="store-toolbar">
        <div class="store-search">
          <label
            for="product-keyword"
            class="form-label"
          >
            搜尋商品
          </label>

          <input
            id="product-keyword"
            v-model="keyword"
            type="search"
            class="form-control"
            placeholder="搜尋商品名稱、分類或商品說明"
          />
        </div>

        <div class="store-filters">
          <div class="store-filter-field">
            <label
              for="product-category"
              class="form-label"
            >
              商品分類
            </label>

            <select
              id="product-category"
              v-model="selectedCategory"
              class="form-select"
            >
              <option value="">
                全部分類
              </option>

              <option
                v-for="category in productCategoryOptions"
                :key="category"
                :value="category"
              >
                {{ category }}
              </option>
            </select>
          </div>

          <div class="store-filter-field">
            <label
              for="product-sort"
              class="form-label"
            >
              排序方式
            </label>

            <select
              id="product-sort"
              v-model="selectedSortKey"
              class="form-select"
            >
              <option
                v-for="option in sortOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

          <button
            type="button"
            class="btn btn-outline-secondary store-filter-reset"
            @click="resetFilters"
          >
            清除篩選
          </button>
        </div>

        <div class="store-toolbar__result">
          找到
          <strong>
            {{ filteredProducts.length }}
          </strong>
          件商品
        </div>
      </div>

      <div
        v-if="isLoading"
        class="store-state"
      >
        商品資料讀取中...
      </div>

      <div
        v-else-if="error"
        class="store-state store-state--error"
      >
        商品資料讀取失敗，請稍後再試。
      </div>

      <div
        v-else-if="!hasProducts"
        class="store-empty"
      >
        <h2>
          目前沒有公開商品
        </h2>

        <p>
          尚未有已上架的拉麵商城商品。
        </p>
      </div>

      <div
        v-else-if="!hasFilteredProducts"
        class="store-empty"
      >
        <h2>
          找不到符合條件的商品
        </h2>

        <p>
          請嘗試修改搜尋關鍵字、商品分類或排序方式。
        </p>

        <button
          type="button"
          class="btn btn-outline-primary"
          @click="resetFilters"
        >
          清除篩選
        </button>
      </div>

      <div
        v-else
        class="store-grid"
      >
        <ProductCard
          v-for="product in pagedProducts"
          :key="product._id"
          :product="product"
        />
      </div>

      <div
        v-if="
          !isLoading
            && !error
            && hasFilteredProducts
            && pageCount > 1
        "
        class="store-pagination"
      >
        <el-pagination
          v-model:current-page="page"
          background
          layout="prev, pager, next"
          :page-count="pageCount"
          :pager-count="pagerCount"
        />
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import type {
  IProduct,
  TCategoryOptions,
} from '@/types/products'

import {
  computed,
  ref,
  watch,
} from 'vue'

import ProductCard from '@/components/ProductCard.vue'
import { useProductsQuery } from '@/queries/products'
import {
  productCategoryOptions,
} from '@/types/products'

type SortKey =
  | 'name-asc'
  | 'price-asc'
  | 'price-desc'

interface SortOption {
  label: string
  value: SortKey
}

const {
  data: products,
  isLoading,
  error,
} = useProductsQuery()

const keyword = ref('')
const selectedCategory =
  ref<TCategoryOptions | ''>('')

const selectedSortKey =
  ref<SortKey>('name-asc')

const page = ref(1)
const itemsPerPage = 9

const sortOptions: SortOption[] = [
  {
    label: '名稱',
    value: 'name-asc',
  },
  {
    label: '價格：低到高',
    value: 'price-asc',
  },
  {
    label: '價格：高到低',
    value: 'price-desc',
  },
]

const productList = computed<IProduct[]>(
  () => products.value ?? [],
)

const hasProducts = computed(
  () => productList.value.length > 0,
)

const filteredProducts =
  computed<IProduct[]>(() => {
    const normalizedKeyword =
      keyword.value
        .trim()
        .toLowerCase()

    const result =
      productList.value.filter(product => {
        const matchesCategory =
          !selectedCategory.value
          || product.category
            === selectedCategory.value

        const matchesKeyword =
          !normalizedKeyword
          || [
            product.name,
            product.category,
            product.description,
          ].some(value =>
            value
              .toLowerCase()
              .includes(
                normalizedKeyword,
              ),
          )

        return (
          matchesCategory
          && matchesKeyword
        )
      })

    return [...result].sort(
      (a, b) => {
        switch (
          selectedSortKey.value
        ) {
          case 'price-asc':
            return a.price - b.price

          case 'price-desc':
            return b.price - a.price

          default:
            return a.name.localeCompare(
              b.name,
              'zh-TW',
            )
        }
      },
    )
  })

const hasFilteredProducts =
  computed(
    () =>
      filteredProducts.value.length > 0,
  )

const pageCount = computed(
  () =>
    Math.ceil(
      filteredProducts.value.length
        / itemsPerPage,
    ),
)

const pagedProducts = computed(
  () => {
    const start =
      (page.value - 1)
      * itemsPerPage

    return filteredProducts.value.slice(
      start,
      start + itemsPerPage,
    )
  },
)

const pagerCount = computed(
  () =>
    typeof window !== 'undefined'
      && window.innerWidth <= 640
      ? 5
      : 7,
)

const resetFilters = () => {
  keyword.value = ''
  selectedCategory.value = ''
  selectedSortKey.value = 'name-asc'
  page.value = 1
}

watch(
  [
    keyword,
    selectedCategory,
    selectedSortKey,
  ],
  () => {
    page.value = 1
  },
)
</script>

<style scoped lang="scss">
.store-page {
  min-height: 100vh;
}

.page-container {
  width: min(
    1200px,
    calc(100% - 40px)
  );
  margin: 0 auto;
}

.store-hero {
  padding: 72px 0 64px;

  &__inner {
    display: flex;
    gap: 32px;
    align-items: center;
    justify-content: space-between;
  }

  &__eyebrow {
    margin: 0 0 10px;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.18em;
  }

  h1 {
    margin: 0;
    font-size: clamp(
      2rem,
      5vw,
      3.4rem
    );
  }

  &__description {
    max-width: 620px;
    margin: 16px 0 0;
    color:
      var(--color-text-secondary);
    line-height: 1.8;
  }
}

.store-content {
  padding-bottom: 72px;
}

.store-toolbar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 32px;

  &__result {
    color:
      var(--color-text-secondary);
    font-size: 0.9rem;
    text-align: center;
  }
}

.store-search {
  width: min(100%, 480px);
  margin: 0 auto;

  .form-label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    text-align: center;
  }
}

.store-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: end;
  justify-content: center;
}

.store-filter-field {
  width: min(100%, 220px);
}

.store-filter-reset {
  min-width: 110px;
}

.store-grid {
  display: grid;
  grid-template-columns:
    repeat(
      3,
      minmax(0, 1fr)
    );
  gap: 24px;
}

.store-state,
.store-empty {
  padding: 64px 24px;
  border:
    1px solid
    var(--color-border);
  border-radius: 16px;
  background:
    var(--color-background);
  text-align: center;

  h2 {
    margin: 0;
    font-size: 1.25rem;
  }

  p {
    margin: 12px 0 0;
    color:
      var(--color-text-secondary);
  }

  .btn {
    margin-top: 20px;
  }
}

.store-state {
  color:
    var(--color-text-secondary);

  &--error {
    color:
      var(--bs-danger);
  }
}

.store-pagination {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

@media (max-width: 960px) {
  .store-grid {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }
}

@media (max-width: 640px) {
  .page-container {
    width: min(
      100%,
      calc(100% - 32px)
    );
  }

  .store-hero {
    padding: 56px 0 48px;

    &__inner {
      flex-direction: column;
      align-items: stretch;
    }
  }

  .store-content {
    padding-bottom: 48px;
  }

  .store-filters {
    align-items: stretch;
    flex-direction: column;
  }

  .store-filter-field,
  .store-filter-reset {
    width: 100%;
  }

  .store-grid {
    grid-template-columns: 1fr;
  }

  .store-pagination {
    overflow-x: auto;
    justify-content: flex-start;
    padding-bottom: 4px;
  }
}
</style>

<route lang="yaml">
meta:
  title: 拉麵商城
</route>
