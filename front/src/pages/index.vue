<template>
  <div class="page-container">
    <el-row
      :gutter="16"
      class="filters"
    >
      <el-col
        :xs="24"
        :md="12"
      >
        <el-input
          v-model="search.text"
          clearable
          placeholder="搜尋商品"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </el-col>
      <el-col
        :xs="24"
        :md="12"
      >
        <el-select
          v-model="search.sort"
          value-key="text"
          placeholder="排序方式"
          style="width: 100%"
        >
          <el-option
            v-for="option in sortOptions"
            :key="option.text"
            :label="option.text"
            :value="option"
          />
        </el-select>
      </el-col>
      <el-col :span="24">
        <el-checkbox-group
          v-model="search.categories"
          class="category-group"
        >
          <el-checkbox-button
            v-for="option in categoryOptions"
            :key="option"
            :label="option"
            :value="option"
          />
        </el-checkbox-group>
      </el-col>
    </el-row>

    <el-empty
      v-if="pagedProducts.length === 0"
      description="沒有符合條件的商品"
    />
    <el-row
      v-else
      :gutter="20"
    >
      <el-col
        v-for="item in pagedProducts"
        :key="item._id"
        :xs="24"
        :sm="12"
        :lg="6"
        class="product-col"
      >
        <ProductCard v-bind="item" />
      </el-col>
    </el-row>

    <el-pagination
      v-if="pageCount > 1"
      v-model:current-page="page"
      class="pagination"
      background
      layout="prev, pager, next"
      :page-count="pageCount"
    />
  </div>
</template>

<script setup lang="ts">
import type { IProduct, TCategoryOptions } from '@/types/product'
import { Search } from '@element-plus/icons-vue'
import { computed, ref, watch } from 'vue'
import ProductCard from '@/components/ProductCard.vue'
import { useProductsQuery } from '@/queries/product'

interface Sort { text: string; key: keyof IProduct; direction: 1 | -1 }

const { data: products } = useProductsQuery()
const page = ref(1)
const itemsPerPage = 8
const categoryOptions: TCategoryOptions[] = ['3C', '食品', '衣服']
const sortOptions: Sort[] = [
  { text: '名稱', key: 'name', direction: 1 },
  { text: '價格：低到高', key: 'price', direction: 1 },
  { text: '價格：高到低', key: 'price', direction: -1 },
]
const search = ref<{ text: string; categories: TCategoryOptions[]; sort: Sort }>({
  text: '', categories: [], sort: sortOptions[0],
})

const filteredProducts = computed<IProduct[]>(() => {
  if (!products.value) return []
  return [...products.value]
    .filter(product => product.name.toLowerCase().includes(search.value.text.toLowerCase())
      && (search.value.categories.length === 0 || search.value.categories.includes(product.category)))
    .sort((a, b) => {
      const aValue = a[search.value.sort.key]
      const bValue = b[search.value.sort.key]
      if (aValue === bValue) return 0
      return (aValue > bValue ? 1 : -1) * search.value.sort.direction
    })
})
const pageCount = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage))
const pagedProducts = computed(() => filteredProducts.value.slice((page.value - 1) * itemsPerPage, page.value * itemsPerPage))
watch(search, () => { page.value = 1 }, { deep: true })
</script>

<style scoped>
.page-container { padding: 20px 0; }
.filters { row-gap: 16px; margin-bottom: 24px; }
.category-group { display: flex; flex-wrap: wrap; }
.product-col { margin-bottom: 20px; }
.pagination { justify-content: center; margin-top: 12px; }
</style>

<route lang="yaml">
meta:
  title: 首頁
</route>
