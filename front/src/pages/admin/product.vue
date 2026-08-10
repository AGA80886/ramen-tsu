<template>
  <div class="admin-product-page">
    <div class="page-header">
      <h1>商品管理</h1>
      <el-button
        type="primary"
        @click="openDialog(null)"
      >
        <el-icon><Plus /></el-icon>
        新增商品
      </el-button>
    </div>

    <el-input
      v-model="search"
      class="search-input"
      clearable
      placeholder="搜尋商品"
      :prefix-icon="Search"
    />

    <el-table
      v-loading="isLoading"
      :data="filteredProducts"
      stripe
    >
      <el-table-column
        prop="_id"
        label="ID"
        min-width="220"
      />
      <el-table-column
        label="圖片"
        width="90"
      >
        <template #default="{ row }">
          <el-image
            class="table-image"
            fit="cover"
            :src="row.imageUrl"
          />
        </template>
      </el-table-column>
      <el-table-column
        prop="name"
        label="名稱"
        min-width="140"
        sortable
      />
      <el-table-column
        prop="price"
        label="價格"
        width="110"
        sortable
      />
      <el-table-column
        prop="category"
        label="分類"
        width="90"
      />
      <el-table-column
        prop="description"
        label="說明"
        min-width="220"
        show-overflow-tooltip
      />
      <el-table-column
        label="上架"
        width="80"
      >
        <template #default="{ row }">
          <el-icon v-if="row.sell">
            <Check />
          </el-icon><el-icon v-else>
            <Close />
          </el-icon>
        </template>
      </el-table-column>
      <el-table-column
        label="建立日期"
        min-width="180"
      >
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column
        label="修改日期"
        min-width="180"
      >
        <template #default="{ row }">
          {{ formatDate(row.updatedAt) }}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        fixed="right"
        width="90"
      >
        <template #default="{ row }">
          <el-button
            circle
            :icon="Edit"
            @click="openDialog(row)"
          />
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialog.open"
      :title="dialog.id ? '編輯商品' : '新增商品'"
      width="min(600px, 92vw)"
      :close-on-click-modal="false"
    >
      <el-form
        label-position="top"
        :disabled="isSubmitting"
        @submit.prevent="submit"
      >
        <el-form-item
          label="名稱"
          :error="errors.name"
        >
          <el-input v-model="name" />
        </el-form-item>
        <el-form-item
          label="價格"
          :error="errors.price"
        >
          <el-input-number
            v-model="price"
            :min="0"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item
          label="說明"
          :error="errors.description"
        >
          <el-input
            v-model="description"
            type="textarea"
            :rows="5"
          />
        </el-form-item>
        <el-form-item
          label="分類"
          :error="errors.category"
        >
          <el-select
            v-model="category"
            style="width: 100%"
          >
            <el-option
              v-for="option in categoryOptions"
              :key="option"
              :label="option"
              :value="option"
            />
          </el-select>
        </el-form-item>
        <el-form-item :error="errors.sell">
          <el-checkbox v-model="sell">
            上架
          </el-checkbox>
        </el-form-item>
        <el-form-item label="商品圖片">
          <vue-file-agent
            ref="fileAgent"
            v-model="fileRecords"
            v-model:raw-model-value="rawFileRecords"
            accept="image/png,image/jpeg"
            deletable
            :error-text="{ type: '檔案類型無效', size: '文件大小不應超過 1MB' }"
            help-text="選擇檔案或將檔案拖曳到此處"
            :max-files="1"
            max-size="1MB"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button
          :disabled="isSubmitting"
          @click="closeDialog"
        >
          取消
        </el-button>
        <el-button
          type="primary"
          :loading="isSubmitting"
          @click="submit"
        >
          送出
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import type { IProduct, TCategoryOptions } from '@/types/product'
import { Check, Close, Edit, Plus, Search } from '@element-plus/icons-vue'
import { useForm } from 'vee-validate'
import { computed, ref, useTemplateRef } from 'vue'
import * as yup from 'yup'
import {
  useAdminProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
} from '@/queries/product'
import { useSnackbarStore } from '@/stores/snackbar'

interface FileAgentInstance {
  deleteFileRecord?: () => void
}

interface FileRecord {
  file?: File
  error?: unknown
}

const createProductMutation = useCreateProductMutation()
const updateProductMutation = useUpdateProductMutation()

const fileAgent = useTemplateRef<FileAgentInstance>('fileAgent')
const snackbar = useSnackbarStore()
const {
  data: products,
  isLoading,
} = useAdminProductsQuery()
const search = ref('')
const dialog = ref({ open: false, id: '' })


const categoryOptions: TCategoryOptions[] = ['3C', '食品', '衣服']

const filteredProducts = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  if (!keyword) return products.value || []
  return (products.value || []).filter(item => [item._id, item.name, item.category, item.description, item.price].some(value => String(value).toLowerCase().includes(keyword)))
})

const schema = yup.object({
  name: yup.string().required('名稱必填'),
  price: yup.number().typeError('資料格式錯誤').required('價格必填').min(0, '價格錯誤'),
  description: yup.string().required('說明必填'),
  category: yup.string().required('分類必填').oneOf(categoryOptions, '分類錯誤'),
  sell: yup.boolean().required('上下架必填'),
})
const { defineField, errors, isSubmitting, resetForm, handleSubmit } = useForm({
  validationSchema: schema,
  initialValues: { name: '', price: 0, description: '', category: '' as TCategoryOptions | '', sell: false },
})
const [name] = defineField('name')
const [price] = defineField('price')
const [description] = defineField('description')
const [category] = defineField('category')
const [sell] = defineField('sell')
const fileRecords = ref<FileRecord[]>([])
const rawFileRecords = ref<File[]>([])

function formatDate (value: string) { return new Date(value).toLocaleString('zh-TW') }
function openDialog (item: IProduct | null) {
  resetForm({ values: item ? { name: item.name, price: item.price, description: item.description, category: item.category, sell: item.sell } : { name: '', price: 0, description: '', category: '', sell: false } })
  fileRecords.value = []
  rawFileRecords.value = []
  dialog.value = { open: true, id: item?._id || '' }
}
function closeDialog () {
  fileAgent.value?.deleteFileRecord?.()
  dialog.value.open = false
}
const submit = handleSubmit(async values => {
  if (fileRecords.value[0]?.error) return snackbar.add({ text: '檔案格式錯誤', color: 'error' })
  if (!dialog.value.id && fileRecords.value.length === 0) return snackbar.add({ text: '缺少圖片', color: 'error' })
  try {
    const data = { ...values, category: values.category as TCategoryOptions, image: fileRecords.value[0]?.file }
    if (dialog.value.id) {
  await updateProductMutation.mutateAsync({
    id: dialog.value.id,
    data,
  })
} else {
  await createProductMutation.mutateAsync(data)
}
    snackbar.add({ text: '儲存成功', color: 'success' })
    closeDialog()
  } catch (error) { snackbar.addError(error) }
})
</script>

<style scoped>
.page-header { align-items: center; display: flex; justify-content: space-between; }
.search-input { margin: 16px 0; max-width: 420px; }
.table-image { border-radius: 4px; height: 48px; width: 48px; }
</style>

<route lang="yaml">
meta:
  layout: admin
  access: authenticated
  roles:
    - admin
  title: 商品管理
</route>
