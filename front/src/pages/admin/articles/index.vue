<template>
  <section class="admin-articles-page">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">
          ARTICLE MANAGEMENT
        </p>
        <h1>文章管理</h1>
        <p class="page-description">
          管理拉麵知識文章、草稿與發布狀態。
        </p>
      </div>
    </header>

    <div class="overview-grid">
      <div class="overview-card">
        <span>全部文章</span>
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
      :loading="isLoading"
      text="正在載入文章..."
      min-height="360px"
    >
      <!-- API Error -->
      <AppCard
        v-if="error"
        class="management-card"
      >
        <AppEmpty description="無法取得文章資料">
          <AppButton
            type="primary"
            :loading="isReloading"
            @click="reloadArticles"
          >
            重新載入
          </AppButton>
        </AppEmpty>
      </AppCard>

      <AppCard
        v-else
        class="management-card"
      >
        <!-- Filters -->
        <div class="toolbar">
          <el-input
            v-model="search"
            clearable
            placeholder="搜尋標題、Slug 或摘要"
          />

          <el-select
            v-model="categoryFilter"
            clearable
            placeholder="文章分類"
          >
            <el-option
              v-for="option in categoryOptions"
              :key="option"
              :label="option"
              :value="option"
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
          v-if="filteredArticles.length === 0"
          description="目前沒有符合條件的文章"
        />

        <!-- Article Table -->
        <el-table
          v-else
          :data="filteredArticles"
          row-key="_id"
          stripe
          class="management-table"
        >
          <el-table-column
            label="文章"
            min-width="220"
          >
            <template #default="{ row }">
              <div class="article-cell">
                <strong>{{ row.title }}</strong>

                <span>
                  /{{ row.slug }}
                </span>

                <small>
                  {{ row.summary }}
                </small>
              </div>
            </template>
          </el-table-column>

          <el-table-column
            label="分類"
            prop="category"
            min-width="90"
          />

          <el-table-column
            label="作者"
            min-width="110"
          >
            <template #default="{ row }">
              {{ getAuthorName(row) }}
            </template>
          </el-table-column>

          <el-table-column
            label="狀態"
            width="82"
          >
            <template #default="{ row }">
              <el-tag
                :type="articleStatusType(row.status)"
                effect="light"
              >
                {{ articleStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column
            label="建立時間"
            min-width="135"
          >
            <template #default="{ row }">
              {{ formatDateTime(row.createdAt) }}
            </template>
          </el-table-column>

          <el-table-column
            label="更新時間"
            min-width="135"
          >
            <template #default="{ row }">
              {{ formatDateTime(row.updatedAt) }}
            </template>
          </el-table-column>

          <el-table-column
            label="操作"
            width="220"
          >
            <template #default="{ row }">
              <div class="table-actions">
                <AppButton
                  v-if="row.status === 'pending'"
                  type="success"
                  plain
                  :loading="reviewingId === row._id"
                  @click="
                    reviewArticle(
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
                    reviewArticle(
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
                  @click="openEditDialog(row)"
                >
                  編輯
                </AppButton>

                <AppButton
                  type="danger"
                  plain
                  :loading="
                    deletingId === row._id
                  "
                  @click="confirmDelete(row)"
                >
                  刪除
                </AppButton>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </AppCard>
    </AppLoading>

    <!-- Create / Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="
        dialogMode === 'create'
          ? '新增文章'
          : '編輯文章'
      "
      width="min(760px, 94vw)"
      destroy-on-close
      @closed="resetForm"
    >
      <el-form
        label-position="top"
        @submit.prevent="submitArticle"
      >
        <el-form-item
          label="文章標題"
          required
        >
          <el-input
            v-model="form.title"
            maxlength="100"
            show-word-limit
            placeholder="請輸入文章標題"
          />
        </el-form-item>

        <el-form-item
          label="Slug"
          required
        >
          <el-input
            v-model="form.slug"
            maxlength="120"
            placeholder="例如：history-of-japanese-ramen"
          />

          <p class="field-hint">
            Slug 將作為文章公開網址的一部分。
          </p>
        </el-form-item>

        <el-form-item
          label="文章分類"
          required
        >
          <el-select
            v-model="form.category"
            placeholder="請選擇分類"
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

        <el-form-item
          label="文章摘要"
          required
        >
          <el-input
            v-model="form.summary"
            type="textarea"
            :rows="3"
            maxlength="300"
            show-word-limit
            placeholder="請輸入文章摘要"
          />
        </el-form-item>

        <el-form-item
          label="文章內容"
          required
        >
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="12"
            placeholder="請輸入文章內容"
          />
        </el-form-item>

        <vue-file-agent
          ref="fileAgent"
          v-model="fileRecords"
          v-model:raw-model-value="rawFileRecords"
          accept="image/png,image/jpeg"
          deletable
          :error-text="{
            type: '檔案類型無效',
            size: '圖片大小不可超過 2MB',
          }"
          help-text="選擇圖片或將圖片拖曳到此處"
          :max-files="1"
          max-size="2MB"
        />
      </el-form>

      <template #footer>
        <div class="dialog-actions">
          <AppButton
            :disabled="isSubmitting"
            @click="dialogVisible = false"
          >
            取消
          </AppButton>

          <AppButton
            type="primary"
            :loading="isSubmitting"
            @click="submitArticle"
          >
            {{
              dialogMode === 'create'
                ? '建立文章'
                : '儲存修改'
            }}
          </AppButton>
        </div>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import type {
  IArticle,
  ICreateArticle,
  TArticleCategory,
  TArticleStatus,
} from '@/types/article'

import { computed, reactive, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import {
  useAdminArticlesQuery,
  useCreateArticleMutation,
  useDeleteArticleMutation,
  useUpdateArticleMutation,
  useUpdateArticleStatusMutation,
} from '@/queries/article'
import { useSnackbarStore } from '@/stores/snackbar'

interface FileRecord {
  file?: File
  error?: unknown
}

type DialogMode =
  | 'create'
  | 'edit'

type StatusFilter =
  | ''
  | TArticleStatus

const fileAgent = ref()
const fileRecords = ref<FileRecord[]>([])
const rawFileRecords = ref<File[]>([])
const editingCoverImage = ref<string | null>(null)

const snackbar = useSnackbarStore()

const {
  data: articles,
  error,
  isLoading,
  refetch,
} = useAdminArticlesQuery()

const updateArticleStatusMutation =
  useUpdateArticleStatusMutation()

const reviewingId =
  ref<string | null>(null)

const createArticleMutation =
  useCreateArticleMutation()

const updateArticleMutation =
  useUpdateArticleMutation()

const deleteArticleMutation =
  useDeleteArticleMutation()

const search = ref('')
const categoryFilter =
  ref<TArticleCategory | ''>('')

const statusFilter =
  ref<StatusFilter>('')

const isReloading = ref(false)
const dialogVisible = ref(false)

const dialogMode =
  ref<DialogMode>('create')

const editingArticleId =
  ref<string | null>(null)

const deletingId =
  ref<string | null>(null)

/**
 * 注意：
 * 必須和 Backend articleCategoryOptions 完全一致。
 */
const categoryOptions: TArticleCategory[] = [
  '公告',
  '拉麵科普',
  '食記分享',
  '最新情報',
  '議題討論',
  '即食拉麵',
  '其他',
]

const initialForm = (): ICreateArticle => ({
  title: '',
  slug: '',
  summary: '',
  content: '',
  category: '其他',
})

const form = reactive<ICreateArticle>(
  initialForm(),
)

const isSubmitting = computed(() => {
  return (
    createArticleMutation.isLoading.value ||
    updateArticleMutation.isLoading.value
  )
})

const articleList = computed(() => articles.value ?? [])

const totalCount = computed(() => articleList.value.length)

const pendingCount = computed(
  () => articleList.value.filter(article => article.status === 'pending').length,
)

const approvedCount = computed(
  () => articleList.value.filter(article => article.status === 'approved').length,
)

const filteredArticles = computed(() => {
  const keyword =
    search.value
      .trim()
      .toLowerCase()

  return (articles.value ?? []).filter(
    article => {
      if (
        categoryFilter.value &&
        article.category !==
          categoryFilter.value
      ) {
        return false
      }

      if (
        statusFilter.value &&
        article.status !== statusFilter.value
      ) {
        return false
      }

      if (!keyword) {
        return true
      }

      return [
        article.title,
        article.slug,
        article.summary,
      ].some(value =>
        value
          .toLowerCase()
          .includes(keyword),
      )
    },
  )
})

function getAuthorName(
  article: IArticle,
): string {
  const author = article.author

  if (!author) {
    return '-'
  }

  if (typeof author === 'string') {
    return author
  }

  return (
    author.nickname ||
    author.account ||
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

function resetForm(): void {
  Object.assign(
    form,
    initialForm(),
  )

  fileRecords.value = []
  rawFileRecords.value = []

  editingArticleId.value = null
  editingCoverImage.value = null
  dialogMode.value = 'create'
}

function openEditDialog(
  article: IArticle,
): void {
  editingArticleId.value =
    article._id

  editingCoverImage.value =
    article.coverImage

  dialogMode.value = 'edit'

  Object.assign(form, {
  title: article.title,
  slug: article.slug,
  summary: article.summary,
  content: article.content,
  category: article.category,
})

  fileRecords.value = []
  rawFileRecords.value = []
  dialogVisible.value = true
}

function validateForm(): boolean {
  if (!form.title.trim()) {
    snackbar.add({
      text: '請輸入文章標題',
      color: 'warning',
    })
    return false
  }

  if (!form.slug.trim()) {
    snackbar.add({
      text: '請輸入文章 Slug',
      color: 'warning',
    })
    return false
  }

  if (!form.summary.trim()) {
    snackbar.add({
      text: '請輸入文章摘要',
      color: 'warning',
    })
    return false
  }

  if (!form.content.trim()) {
    snackbar.add({
      text: '請輸入文章內容',
      color: 'warning',
    })
    return false
  }

  return true
}

async function submitArticle():
Promise<void> {
  if (
    isSubmitting.value ||
    !validateForm()
  ) {
    return
  }

  if (fileRecords.value[0]?.error) {
  snackbar.add({
    text: '封面圖片格式或大小不符合規定',
    color: 'warning',
  })
  return
}

if (
  dialogMode.value === 'create' &&
  fileRecords.value.length === 0
) {
  snackbar.add({
    text: '文章封面圖片必填',
    color: 'warning',
  })
  return
}

const image = fileRecords.value[0]?.file

const data: ICreateArticle = {
  title: form.title.trim(),
  slug: form.slug.trim(),
  summary: form.summary.trim(),
  content: form.content.trim(),
  category: form.category,
}

if (image) {
  data.image = image
}


  try {
    if (
      dialogMode.value ===
      'create'
    ) {
      await createArticleMutation
        .mutateAsync(data)

      snackbar.add({
        text: '文章建立成功',
        color: 'success',
      })
    } else {
      if (!editingArticleId.value) {
        return
      }

      await updateArticleMutation
        .mutateAsync({
          id: editingArticleId.value,
          data,
        })

      snackbar.add({
        text: '文章更新成功',
        color: 'success',
      })
    }

    dialogVisible.value = false
  } catch (error) {
    snackbar.addError(error)
  }
}

async function reviewArticle(
  article: IArticle,
  status: 'approved' | 'rejected',
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
      `確定要${action}「${article.title}」嗎？`,
      '文章審核',
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

  reviewingId.value = article._id

  try {
    await updateArticleStatusMutation
      .mutateAsync({
        id: article._id,
        status,
      })

    snackbar.add({
      text:
        status === 'approved'
          ? '文章審核通過'
          : '文章已拒絕',
      color: 'success',
    })
  } catch (error) {
    snackbar.addError(error)
  } finally {
    reviewingId.value = null
  }
}

async function confirmDelete(
  article: IArticle,
): Promise<void> {
  if (deletingId.value) {
    return
  }

  try {
    await ElMessageBox.confirm(
      `確定要刪除「${article.title}」嗎？此操作無法復原。`,
      '刪除文章',
      {
        confirmButtonText: '刪除',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
  } catch {
    return
  }

  deletingId.value = article._id

  try {
    await deleteArticleMutation
      .mutateAsync(article._id)

    snackbar.add({
      text: '文章刪除成功',
      color: 'success',
    })
  } catch (error) {
    snackbar.addError(error)
  } finally {
    deletingId.value = null
  }
}

async function reloadArticles():
Promise<void> {
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

type ArticleTagType =
  | 'primary'
  | 'success'
  | 'warning'
  | 'info'
  | 'danger'

function articleStatusText(
  status: TArticleStatus,
): string {
  const labels: Record<
    TArticleStatus,
    string
  > = {
    draft: '草稿',
    pending: '待審核',
    approved: '已通過',
    rejected: '已拒絕',
  }

  return labels[status]
}

function articleStatusType(
  status: TArticleStatus,
): ArticleTagType {
  const types: Record<
    TArticleStatus,
    ArticleTagType
  > = {
    draft: 'info',
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
  }

  return types[status]
}
</script>

<style scoped lang="scss">
.admin-articles-page {
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
  grid-template-columns: minmax(280px, 1fr) 190px 170px;
  gap: 12px;
  margin-bottom: 18px;
  padding: 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  background: var(--el-fill-color-extra-light);
}

.management-table {
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.management-table :deep(.el-table__cell) {
  min-width: 0;
}

.management-table :deep(.cell) {
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}

.article-cell {
  display: flex;
  min-width: 0;
  max-width: 100%;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;

  strong,
  span,
  small {
    min-width: 0;
    overflow: hidden;
    color: var(--el-text-color-secondary);
    overflow-wrap: anywhere;
    word-break: break-word;
  }

  strong {
    color: var(--el-text-color-primary);
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }

  span {
    font-size: 0.8rem;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  small {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
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

.field-hint {
  margin: 6px 0 0;
  color: var(--el-text-color-secondary);
  font-size: 0.8rem;
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

  .page-header > :deep(.el-button) {
    width: 100%;
  }

  .toolbar {
    grid-template-columns: 1fr;
  }

  .toolbar > :first-child {
    grid-column: auto;
  }
}

/* Step 6-5.6 RWD final regression */
.admin-articles-page {
  width: 100%;
  min-width: 0;
}

@media (max-width: 1024px) {
  .overview-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  /*
   * 不設定固定 min-width，也不讓管理卡片產生水平捲軸。
   * Element Plus table 會依容器寬度收縮欄位。
   */
  .management-card {
    min-width: 0;
    overflow: hidden;
  }

  .management-table {
    width: 100%;
    max-width: 100%;
  }

  .management-table :deep(.el-table__inner-wrapper),
  .management-table :deep(.el-table__header-wrapper),
  .management-table :deep(.el-table__body-wrapper) {
    max-width: 100%;
  }

  .table-actions {
    flex-wrap: wrap;
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
}

</style>

<route lang="yaml">
meta:
  layout: admin
  access: authenticated
  roles:
    - admin
  title: 文章管理
</route>
