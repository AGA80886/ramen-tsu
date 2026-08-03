<template>
  <div class="app-pagination">
    <ElPagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="pageSizes"
      :background="background"
      :layout="layout"
      :hide-on-single-page="hideOnSinglePage"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  total: number
  pageSizes?: number[]
  background?: boolean
  layout?: string
  hideOnSinglePage?: boolean
}

withDefaults(defineProps<Props>(), {
  pageSizes: () => [10, 20, 30, 50],
  background: true,
  layout: 'total, sizes, prev, pager, next',
  hideOnSinglePage: false,
})

const currentPage = defineModel<number>('currentPage', {
  default: 1,
})

const pageSize = defineModel<number>('pageSize', {
  default: 10,
})

const emit = defineEmits<{
  change: [page: number, pageSize: number]
}>()

function handleCurrentChange(page: number) {
  emit('change', page, pageSize.value)
}

function handleSizeChange(size: number) {
  currentPage.value = 1
  emit('change', 1, size)
}
</script>

<style scoped lang="scss">
.app-pagination {
  display: flex;
  width: 100%;
  margin-top: 2rem;
  overflow-x: auto;
  justify-content: center;
}
</style>
