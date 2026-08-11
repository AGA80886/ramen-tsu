<template>
  <section class="admin-articles-page">
    <header class="page-header">
      <div>
        <h1>文章管理</h1>
        <p>管理拉麵知識文章、草稿與發布狀態。</p>
      </div>

      <AppButton
        type="primary"
        @click="openCreateDialog"
      >
        新增文章
      </AppButton>
    </header>

    <AppLoading
      :loading="isLoading"
      text="正在載入文章..."
      min-height="360px"
    >
      <!-- API Error -->
      <AppCard v-if="error">
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

      <AppCard v-else>
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
          style="width: 100%"
        >
          <el-table-column
            label="文章"
            min-width="260"
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
            min-width="110"
          />

          <el-table-column
            label="作者"
            min-width="140"
          >
            <template #default="{ row }">
              {{ getAuthorName(row) }}
            </template>
          </el-table-column>

          <el-table-column
            label="狀態"
            width="100"
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
            width="340"
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

function openCreateDialog(): void {
  resetForm()

  dialogMode.value = 'create'
  dialogVisible.value = true
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

<route lang="yaml">
meta:
  layout: admin
  access: authenticated
  roles:
    - admin
  title: 文章管理
</route>

<style scoped lang="scss">
.admin-articles-page {
  padding: 24px;
}

.page-header {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;

  h1 {
    margin: 0;
    font-size: 28px;
  }

  p {
    margin: 8px 0 0;
    color: var(
      --color-text-secondary
    );
  }
}

.toolbar {
  display: grid;
  grid-template-columns:
    minmax(260px, 1fr)
    180px
    160px;
  gap: 16px;
  margin-bottom: 20px;
}

.article-cell {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;

  strong {
    color: var(--color-heading);
  }

  span,
  small {
    overflow: hidden;
    color: var(
      --color-text-secondary
    );
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    font-size: 0.8rem;
  }
}

.table-actions {
  display: flex;
  gap: 8px;

  :deep(.el-button) {
    margin-left: 0;
  }
}

.field-hint {
  margin: 6px 0 0;
  color: var(
    --color-text-secondary
  );
  font-size: 0.8rem;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;

  :deep(.el-button) {
    margin-left: 0;
  }
}

@media (max-width: 900px) {
  .toolbar {
    grid-template-columns:
      1fr 1fr;
  }

  .toolbar > :first-child {
    grid-column: 1 / -1;
  }
}

@media (max-width: 640px) {
  .admin-articles-page {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;

    > :deep(.el-button) {
      width: 100%;
    }
  }

  .toolbar {
    grid-template-columns: 1fr;
  }

  .toolbar > :first-child {
    grid-column: auto;
  }
}
</style>
