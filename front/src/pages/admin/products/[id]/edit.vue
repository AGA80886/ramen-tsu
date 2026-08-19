<template>
  <div class="admin-product-edit-page">
    <div class="page-header">
      <div>
        <p class="page-eyebrow">
          PRODUCT MANAGEMENT
        </p>

        <h1>編輯商品</h1>

        <p class="page-description">
          修改商品資料、圖片與上下架狀態。
        </p>
      </div>

      <AppButton
        plain
        native-type="button"
        :disabled="submitting"
        @click="goBack"
      >
        返回商品管理
      </AppButton>
    </div>

    <AppCard
      v-if="isLoading"
      class="state-card"
    >
      <div class="page-state">
        商品資料讀取中...
      </div>
    </AppCard>

    <AppCard
      v-else-if="error"
      class="state-card"
    >
      <div class="page-state page-state--error">
        商品資料讀取失敗，請確認商品是否存在或稍後再試。
      </div>
    </AppCard>

    <AppCard
      v-else-if="product"
      class="product-form-card"
    >
      <el-form
        label-position="top"
        :disabled="submitting"
        @submit.prevent="submit"
      >
        <div class="form-grid">
          <div class="form-main">
            <section class="form-section">
              <div class="section-header">
                <div>
                  <h2>基本資料</h2>
                  <p>修改商品名稱、價格、分類與商品說明。</p>
                </div>
              </div>

              <el-form-item
                label="商品名稱"
                :error="errors.name"
              >
                <el-input
                  v-model="name"
                  maxlength="100"
                  show-word-limit
                  placeholder="例如：日清拉王 豚骨醬油拉麵"
                />
              </el-form-item>

              <div class="field-grid">
                <el-form-item
                  label="商品價格"
                  :error="errors.price"
                >
                  <el-input-number
                    v-model="price"
                    :min="0"
                    :precision="0"
                    :step="1"
                    controls-position="right"
                    class="full-width"
                  />
                </el-form-item>

                <el-form-item
                  label="商品分類"
                  :error="errors.category"
                >
                  <el-select
                    v-model="category"
                    placeholder="請選擇商品分類"
                    class="full-width"
                  >
                    <el-option
                      v-for="option in productCategoryOptions"
                      :key="option"
                      :label="option"
                      :value="option"
                    />
                  </el-select>
                </el-form-item>
              </div>

              <el-form-item
                label="商品說明"
                :error="errors.description"
              >
                <el-input
                  v-model="description"
                  type="textarea"
                  :rows="7"
                  resize="vertical"
                  placeholder="請輸入商品特色、內容物或其他商品資訊"
                />
              </el-form-item>
            </section>

            <section class="form-section">
              <div class="section-header">
                <div>
                  <h2>商品圖片</h2>
                  <p>
                    若不更換圖片，可保留目前商品圖片；更換時支援 JPG、PNG，檔案上限 1MB。
                  </p>
                </div>
              </div>

              <div class="current-image-block">
                <span class="current-image-label">
                  目前圖片
                </span>

                <el-image
                  class="current-image"
                  fit="cover"
                  :src="product.imageUrl"
                  :alt="product.name"
                  :preview-src-list="[product.imageUrl]"
                  preview-teleported
                >
                  <template #error>
                    <div class="current-image__fallback">
                      無法載入圖片
                    </div>
                  </template>
                </el-image>
              </div>

              <el-form-item
                label="更換商品圖片"
                :error="imageError"
              >
                <vue-file-agent
                  ref="fileAgent"
                  v-model="fileRecords"
                  v-model:raw-model-value="rawFileRecords"
                  accept="image/png,image/jpeg"
                  deletable
                  :error-text="{
                    type: '檔案類型無效',
                    size: '文件大小不應超過 1MB',
                  }"
                  help-text="若要更換圖片，請選擇或拖曳新圖片到此處"
                  :max-files="1"
                  max-size="1MB"
                  @select="clearImageError"
                />
              </el-form-item>
            </section>
          </div>

          <aside class="form-sidebar">
            <section class="publish-card">
              <div class="section-header">
                <div>
                  <h2>上架設定</h2>
                  <p>控制商品是否顯示在公開商城。</p>
                </div>
              </div>

              <el-form-item :error="errors.sell">
                <div class="sell-control">
                  <div>
                    <strong>
                      {{ sell ? '已上架' : '已下架' }}
                    </strong>

                    <p>
                      {{
                        sell
                          ? '商品目前會顯示在公開商城並可被購買。'
                          : '商品目前只會顯示在後台，不會出現在公開商城。'
                      }}
                    </p>
                  </div>

                  <el-switch
                    v-model="sell"
                    inline-prompt
                    active-text="上架"
                    inactive-text="下架"
                  />
                </div>
              </el-form-item>
            </section>

            <section class="notice-card">
              <h3>商品資訊</h3>

              <dl class="meta-list">
                <div>
                  <dt>商品 ID</dt>
                  <dd>{{ product._id }}</dd>
                </div>

                <div>
                  <dt>建立時間</dt>
                  <dd>{{ formatDate(product.createdAt) }}</dd>
                </div>

                <div>
                  <dt>最後更新</dt>
                  <dd>{{ formatDate(product.updatedAt) }}</dd>
                </div>
              </dl>
            </section>

            <section class="notice-card">
              <h3>編輯提醒</h3>

              <ul>
                <li>商品名稱最多 100 個字。</li>
                <li>價格使用新台幣整數，不接受小數。</li>
                <li>若沒有選擇新圖片，會保留目前商品圖片。</li>
                <li>下架商品不會顯示在公開商城。</li>
              </ul>
            </section>
          </aside>
        </div>

        <div class="form-actions">
          <AppButton
            plain
            native-type="button"
            :disabled="submitting"
            @click="goBack"
          >
            取消
          </AppButton>

          <AppButton
            type="primary"
            native-type="submit"
            :loading="submitting"
            :disabled="submitting"
          >
            儲存變更
          </AppButton>
        </div>
      </el-form>
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import * as yup from 'yup'

import {
  useAdminProductByIdQuery,
  useUpdateProductMutation,
} from '@/queries/products'
import { useSnackbarStore } from '@/stores/snackbar'
import {
  productCategoryOptions,
  type ProductForm,
  type TCategoryOptions,
} from '@/types/products'

interface FileAgentInstance {
  deleteFileRecord?: () => void
}

interface FileRecord {
  file?: File
  error?: unknown
}

const route = useRoute()
const router = useRouter()
const snackbar = useSnackbarStore()

const productId = () =>
  String(route.params.id ?? '')

const {
  data: product,
  isLoading,
  error,
} = useAdminProductByIdQuery(productId)

const updateProductMutation =
  useUpdateProductMutation()

const fileAgent =
  useTemplateRef<FileAgentInstance>('fileAgent')

const fileRecords = ref<FileRecord[]>([])
const rawFileRecords = ref<File[]>([])
const imageError = ref('')

const schema = yup.object({
  name: yup
    .string()
    .trim()
    .required('商品名稱必填')
    .max(100, '商品名稱最多 100 個字'),

  price: yup
    .number()
    .typeError('價格格式錯誤')
    .required('商品價格必填')
    .integer('價格必須為整數')
    .min(0, '價格不能小於 0'),

  description: yup
    .string()
    .trim()
    .required('商品說明必填'),

  category: yup
    .mixed<TCategoryOptions>()
    .oneOf(productCategoryOptions, '商品分類錯誤')
    .required('商品分類必填'),

  sell: yup
    .boolean()
    .required('上下架狀態必填'),
})

const {
  defineField,
  errors,
  handleSubmit,
  isSubmitting,
  resetForm,
} = useForm({
  validationSchema: schema,
  initialValues: {
    name: '',
    price: 0,
    description: '',
    category: undefined as TCategoryOptions | undefined,
    sell: false,
  },
})

const [name] = defineField('name')
const [price] = defineField('price')
const [description] = defineField('description')
const [category] = defineField('category')
const [sell] = defineField('sell')

watch(
  product,
  value => {
    if (!value) {
      return
    }

    resetForm({
      values: {
        name: value.name,
        price: value.price,
        description: value.description,
        category: value.category,
        sell: value.sell,
      },
    })
  },
  {
    immediate: true,
  },
)

const submitting = computed(
  () =>
    isSubmitting.value
    || updateProductMutation.isLoading.value,
)

function clearImageError(): void {
  imageError.value = ''
}

function goBack(): void {
  router.push('/admin/products')
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

const submit = handleSubmit(async values => {
  const fileRecord = fileRecords.value[0]

  if (fileRecord?.error) {
    imageError.value = '商品圖片格式或大小不符合規定'
    return
  }

  if (!values.category) {
    return
  }

  imageError.value = ''

  const data: ProductForm = {
    name: values.name.trim(),
    price: values.price,
    description: values.description.trim(),
    category: values.category,
    sell: values.sell,
  }

  if (fileRecord?.file) {
    data.image = fileRecord.file
  }

  try {
    await updateProductMutation.mutateAsync({
      id: productId(),
      data,
    })

    snackbar.add({
      text: '商品更新成功',
      color: 'success',
    })

    fileAgent.value?.deleteFileRecord?.()

    await router.push('/admin/products')
  } catch (submitError) {
    snackbar.addError(submitError)
  }
})
</script>

<style scoped lang="scss">
.admin-product-edit-page {
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

.product-form-card,
.state-card {
  overflow: hidden;
}

.page-state {
  display: grid;
  min-height: 240px;
  place-items: center;
  padding: 40px 24px;
  color: var(--el-text-color-secondary);
  text-align: center;
}

.page-state--error {
  color: var(--el-color-danger);
}

.form-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 24px;
}

.form-main {
  display: grid;
  gap: 28px;
}

.form-section {
  padding-bottom: 4px;

  & + & {
    padding-top: 24px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}

.section-header {
  margin-bottom: 18px;

  h2 {
    margin: 0;
    color: var(--el-text-color-primary);
    font-size: 1.05rem;
  }

  p {
    margin: 6px 0 0;
    color: var(--el-text-color-secondary);
    font-size: 0.875rem;
    line-height: 1.6;
  }
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.full-width {
  width: 100%;
}

.current-image-block {
  display: grid;
  gap: 10px;
  margin-bottom: 20px;
}

.current-image-label {
  color: var(--el-text-color-regular);
  font-size: 0.875rem;
}

.current-image {
  width: min(100%, 360px);
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  background: var(--el-fill-color-light);
}

.current-image__fallback {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  color: var(--el-text-color-secondary);
  font-size: 0.875rem;
}

.form-sidebar {
  display: grid;
  align-content: start;
  gap: 16px;
}

.publish-card,
.notice-card {
  padding: 18px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  background: var(--el-fill-color-extra-light);
}

.sell-control {
  display: flex;
  width: 100%;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;

  strong {
    display: block;
    color: var(--el-text-color-primary);
  }

  p {
    margin: 5px 0 0;
    color: var(--el-text-color-secondary);
    font-size: 0.82rem;
    line-height: 1.55;
  }
}

.notice-card {
  h3 {
    margin: 0 0 12px;
    font-size: 0.95rem;
  }

  ul {
    display: grid;
    gap: 8px;
    margin: 0;
    padding-left: 18px;
    color: var(--el-text-color-secondary);
    font-size: 0.84rem;
    line-height: 1.55;
  }
}

.meta-list {
  display: grid;
  gap: 12px;
  margin: 0;

  div {
    display: grid;
    gap: 4px;
  }

  dt {
    color: var(--el-text-color-secondary);
    font-size: 0.75rem;
  }

  dd {
    margin: 0;
    overflow-wrap: anywhere;
    color: var(--el-text-color-primary);
    font-size: 0.84rem;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color-lighter);
}

@media (max-width: 960px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
  }

  .page-header :deep(.app-button) {
    width: 100%;
  }

  .field-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column-reverse;

    :deep(.app-button) {
      width: 100%;
    }
  }

  .sell-control {
    flex-direction: column;
  }
}

/* Step 6-5.6 RWD final regression */
.admin-product-edit-page {
  width: 100%;
  min-width: 0;
}

@media (max-width: 1100px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-sidebar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .page-header :deep(.app-button) {
    width: 100%;
  }

  .field-grid,
  .form-sidebar {
    grid-template-columns: 1fr;
  }

  .current-image {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .product-form-card :deep(.el-card__body),
  .state-card :deep(.el-card__body) {
    padding: 16px;
  }

  .form-main {
    gap: 22px;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .form-actions :deep(.app-button) {
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
  title: 編輯商品
</route>
