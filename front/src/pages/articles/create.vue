<template>
  <main class="create-article-page">
    <div class="page-container">
      <header class="page-header">
        <div>
          <p class="eyebrow">
            RAMEN FORUM
          </p>

          <h1>投稿文章</h1>

          <p>
            分享您的拉麵食記、知識與最新情報。
            文章送出後將由管理員審核，通過後才會公開顯示。
          </p>
        </div>
      </header>

      <AppCard>
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
            label="文章網址 Slug"
            required
          >
            <el-input
              v-model="form.slug"
              maxlength="120"
              placeholder="例如：my-ramen-review"
            />
          </el-form-item>

          <el-form-item
            label="文章分類"
            required
          >
            <el-select
              v-model="form.category"
              placeholder="請選擇文章分類"
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
              placeholder="簡單介紹這篇文章"
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
              placeholder="請輸入文章內容"
            />
          </el-form-item>

          <el-form-item
            label="封面圖片"
            required
          >
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
              :max-files="2"
              max-size="2MB"
            />
          </el-form-item>

          <div class="submit-note">
            <el-alert
              title="文章送出後會進入待審核狀態"
              description="管理員審核通過後，文章才會出現在拉麵論壇。"
              type="info"
              :closable="false"
              show-icon
            />
          </div>

          <div class="form-actions">
            <AppButton
              @click="router.push('/articles')"
            >
              返回論壇
            </AppButton>

            <AppButton
              type="primary"
              :loading="isSubmitting"
              @click="submitArticle"
            >
              送出審核
            </AppButton>
          </div>
        </el-form>
      </AppCard>
    </div>
  </main>
</template>

<script setup lang="ts">
import type {
  ICreateArticle,
  TArticleCategory,
} from '@/types/article'

import {
  reactive,
  ref,
} from 'vue'
import { useRouter } from 'vue-router'

import { useCreateArticleMutation } from '@/queries/article'
import { useSnackbarStore } from '@/stores/snackbar'

interface FileRecord {
  file?: File
  error?: unknown
}

const router = useRouter()
const snackbar = useSnackbarStore()

const createArticleMutation =
  useCreateArticleMutation()

const fileAgent = ref()
const fileRecords =
  ref<FileRecord[]>([])
const rawFileRecords =
  ref<File[]>([])

const isSubmitting =
  createArticleMutation.isLoading

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

const form = reactive<ICreateArticle>({
  title: '',
  slug: '',
  summary: '',
  content: '',
  category: '其他',
})

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

  if (fileRecords.value.length === 0) {
    snackbar.add({
      text: '請選擇文章封面圖片',
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

  const image =
    fileRecords.value[0]?.file

  if (!image) {
    snackbar.add({
      text: '請選擇文章封面圖片',
      color: 'warning',
    })
    return
  }

  const data: ICreateArticle = {
    title: form.title.trim(),
    slug: form.slug.trim(),
    summary: form.summary.trim(),
    content: form.content.trim(),
    category: form.category,
    image,
  }

  try {
    await createArticleMutation
      .mutateAsync(data)

    snackbar.add({
      text: '文章已送出，等待管理員審核',
      color: 'success',
    })

    await router.push('/articles')
  } catch (error) {
    snackbar.addError(error)
  }
}
</script>

<style scoped lang="scss">
.create-article-page {
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

.submit-note {
  margin: 24px 0;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;

  :deep(.el-button) {
    margin-left: 0;
  }
}

@media (max-width: 640px) {
  .create-article-page {
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
  title: 投稿文章
  access: authenticated
</route>
