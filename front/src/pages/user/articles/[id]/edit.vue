<template>
  <main class="edit-article-page">
    <div class="page-container">
      <header class="page-header">
        <div>
          <p class="eyebrow">
            RAMEN FORUM
          </p>

          <h1>編輯文章</h1>

          <p>
            修改文章後將重新進入待審核狀態，
            管理員再次審核通過後才會重新公開。
          </p>
        </div>
      </header>

      <AppLoading
        :loading="
          isLoading ||
            !ownershipChecked
        "
        text="正在確認文章權限..."
        min-height="360px"
      >
        <AppCard v-if="error">
          <AppEmpty description="無法取得文章資料">
            <AppButton
              type="primary"
              @click="router.push('/user/articles')"
            >
              返回我發表的文章
            </AppButton>
          </AppEmpty>
        </AppCard>

        <AppCard v-else-if="!article">
          <AppEmpty description="找不到這篇文章">
            <AppButton
              type="primary"
              @click="router.push('/user/articles')"
            >
              返回我的文章
            </AppButton>
          </AppEmpty>
        </AppCard>

        <AppCard v-else>
          <div class="current-status">
            <span>目前狀態</span>

            <el-tag
              :type="articleStatusType(article.status)"
            >
              {{ articleStatusText(article.status) }}
            </el-tag>
          </div>

          <el-alert
            v-if="article.status === 'approved'"
            title="修改已公開文章後，文章會暫時下架並重新進入待審核狀態。"
            type="warning"
            :closable="false"
            show-icon
            class="status-alert"
          />

          <el-alert
            v-else-if="article.status === 'rejected'"
            title="此文章尚未通過審核，你可以修改內容後重新送審。"
            type="info"
            :closable="false"
            show-icon
            class="status-alert"
          />

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
              />
            </el-form-item>

            <el-form-item
              label="文章網址 Slug"
              required
            >
              <el-input
                v-model="form.slug"
              />
            </el-form-item>

            <el-form-item
              label="文章分類"
              required
            >
              <el-select
                v-model="form.category"
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
              />
            </el-form-item>

            <el-form-item
              label="文章內容"
              required
            >
              <el-input
                v-model="form.content"
                type="textarea"
                :rows="14"
              />
            </el-form-item>

            <el-form-item label="目前封面">
              <el-image
                :src="
                  article.coverImageUrl ||
                    article.coverImage
                "
                fit="cover"
                class="current-cover"
              />
            </el-form-item>

            <el-form-item label="更換封面">
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
                help-text="如需更換封面，可選擇圖片或拖曳到此處"
                :max-files="2"
                max-size="2MB"
              />

              <p class="field-hint">
                沒有選擇新圖片時，會保留目前封面。
              </p>
            </el-form-item>

            <div class="form-actions">
              <AppButton
                @click="router.push('/user/articles')"
              >
                取消
              </AppButton>

              <AppButton
                type="primary"
                :loading="isSubmitting"
                @click="submitArticle"
              >
                儲存並重新送審
              </AppButton>
            </div>
          </el-form>
        </AppCard>
      </AppLoading>
    </div>
  </main>
</template>

<script setup lang="ts">
import type {
  IUpdateArticle,
  TArticleCategory,
  TArticleStatus,
} from '@/types/article'

import {
  computed,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue'
import {
  useRoute,
  useRouter,
} from 'vue-router'

import {
  useMyArticlesQuery,
  useUpdateArticleMutation,
} from '@/queries/article'

import { useSnackbarStore } from '@/stores/snackbar'

interface FileRecord {
  file?: File
  error?: unknown
}

type ArticleTagType =
  | 'primary'
  | 'success'
  | 'warning'
  | 'info'
  | 'danger'

const route = useRoute()
const router = useRouter()
const snackbar = useSnackbarStore()

const {
  data: articles,
  error,
  isLoading,
  refetch,
} = useMyArticlesQuery()

const updateArticleMutation =
  useUpdateArticleMutation()

const articleId = computed(() => {
  const id = route.params.id

  if (Array.isArray(id)) {
    return id[0] ?? ''
  }

  return String(id ?? '')
})

const article = computed(() =>
  (articles.value ?? []).find(
    item => item._id === articleId.value,
  ),
)

const categoryOptions:
TArticleCategory[] = [
  '公告',
  '拉麵科普',
  '食記分享',
  '最新情報',
  '議題討論',
  '即食拉麵',
  '其他',
]

const form = reactive({
  title: '',
  slug: '',
  summary: '',
  content: '',
  category: '其他' as TArticleCategory,
})

const fileAgent = ref()
const fileRecords =
  ref<FileRecord[]>([])
const rawFileRecords =
  ref<File[]>([])

const isSubmitting =
  updateArticleMutation.isLoading

const initialized = ref(false)

watch(
  article,
  value => {
    if (
      !value ||
      initialized.value
    ) {
      return
    }

    form.title = value.title
    form.slug = value.slug
    form.summary = value.summary
    form.content = value.content
    form.category = value.category

    initialized.value = true
  },
  {
    immediate: true,
  },
)

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

  if (fileRecords.value[0]?.error) {
    snackbar.add({
      text: '封面圖片格式或大小不符合規定',
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
    !article.value ||
    !validateForm()
  ) {
    return
  }

  const data: IUpdateArticle = {
    title: form.title.trim(),
    slug: form.slug.trim(),
    summary: form.summary.trim(),
    content: form.content.trim(),
    category: form.category,
  }

  const image =
    fileRecords.value[0]?.file

  if (image) {
    data.image = image
  }

  try {
    await updateArticleMutation
      .mutateAsync({
        id: article.value._id,
        data,
      })

    snackbar.add({
      text: '文章已更新，等待管理員重新審核',
      color: 'success',
    })

    await router.push(
      '/user/articles',
    )
  } catch (error) {
    snackbar.addError(error)
  }
}

const ownershipChecked = ref(false)

onMounted(async () => {
  // 不直接相信舊 cache，
  // 進入編輯頁先重新向 Backend 取得目前登入會員的文章
  await refetch()

  const target = (articles.value ?? []).find(
    item => item._id === articleId.value,
  )

  if (!target) {
    await router.replace('/')
    return
  }

  ownershipChecked.value = true
})

</script>

<style scoped lang="scss">
.edit-article-page {
  padding: 48px 0 72px;
}

.page-container {
  width: min(
    860px,
    calc(100% - 40px)
  );
  margin: 0 auto;
}

.page-header {
  margin-bottom: 28px;

  h1 {
    margin: 4px 0 12px;
    font-size: 2rem;
  }

  p {
    margin: 0;
    line-height: 1.8;
    color:
      var(--color-text-secondary);
  }
}

.eyebrow {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.16em;
}

.current-status {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
  font-weight: 600;
}

.status-alert {
  margin-bottom: 24px;
}

.current-cover {
  width: min(100%, 420px);
  aspect-ratio: 16 / 9;
  border-radius: 10px;
}

.field-hint {
  width: 100%;
  margin: 8px 0 0;
  color:
    var(--color-text-secondary);
  font-size: 0.85rem;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 28px;

  :deep(.el-button) {
    margin-left: 0;
  }
}

@media (max-width: 640px) {
  .edit-article-page {
    padding: 32px 0 48px;
  }

  .page-container {
    width: min(
      100%,
      calc(100% - 32px)
    );
  }

  .form-actions {
    flex-direction: column-reverse;

    :deep(.el-button) {
      width: 100%;
    }
  }
}
</style>

<route lang="yaml">
meta:
  title: 編輯文章
  access: authenticated
</route>
