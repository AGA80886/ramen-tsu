<template>
  <main class="my-articles-page">
    <div class="page-container">
      <header class="page-header">
        <div>
          <p class="eyebrow">
            MY ARTICLES
          </p>

          <h1>我的文章</h1>

          <p>
            查看你的論壇投稿與文章審核狀態。
          </p>
        </div>

        <AppButton
          type="primary"
          @click="router.push('/articles/create')"
        >
          發表文章
        </AppButton>
      </header>

      <div class="status-filter">
        <el-radio-group
          v-model="statusFilter"
        >
          <el-radio-button value="">
            全部
          </el-radio-button>

          <el-radio-button value="draft">
            草稿
          </el-radio-button>

          <el-radio-button value="pending">
            待審核
          </el-radio-button>

          <el-radio-button value="approved">
            已通過
          </el-radio-button>

          <el-radio-button value="rejected">
            已拒絕
          </el-radio-button>
        </el-radio-group>
      </div>

      <AppLoading
        :loading="isLoading"
        text="正在載入文章..."
        min-height="320px"
      >
        <AppCard v-if="error">
          <AppEmpty description="無法取得我的文章">
            <AppButton
              type="primary"
              :loading="isReloading"
              @click="reloadArticles"
            >
              重新載入
            </AppButton>
          </AppEmpty>
        </AppCard>

        <el-empty
          v-else-if="
            filteredArticles.length === 0
          "
          description="目前沒有文章"
        />

        <div
          v-else
          class="articles-list"
        >
          <article
            v-for="
              article in filteredArticles
            "
            :key="article._id"
            class="article-card"
          >
            <div class="article-card__cover">
              <el-image
                :src="
                  article.coverImageUrl ||
                    article.coverImage
                "
                :alt="article.title"
                fit="cover"
                lazy
              >
                <template #error>
                  <div
                    class="
                      article-card__image-error
                    "
                  >
                    圖片載入失敗
                  </div>
                </template>
              </el-image>
            </div>

            <div class="article-card__content">
              <div class="article-card__top">
                <div class="article-tags">
                  <el-tag>
                    {{ article.category }}
                  </el-tag>

                  <el-tag
                    :type="
                      articleStatusType(
                        article.status,
                      )
                    "
                  >
                    {{
                      articleStatusText(
                        article.status,
                      )
                    }}
                  </el-tag>
                </div>
              </div>

              <h2>
                {{ article.title }}
              </h2>

              <p class="article-summary">
                {{ article.summary }}
              </p>

              <div class="article-dates">
                <span>
                  建立：
                  {{
                    formatDateTime(
                      article.createdAt,
                    )
                  }}
                </span>

                <span>
                  更新：
                  {{
                    formatDateTime(
                      article.updatedAt,
                    )
                  }}
                </span>
              </div>

              <div class="article-status-note">
                {{
                  articleStatusDescription(
                    article.status,
                  )
                }}
              </div>

              <div class="article-actions">
                <AppButton
                  type="primary"
                  plain
                  @click="
                    editArticle(article)
                  "
                >
                  編輯
                </AppButton>

                <AppButton
                  v-if="
                    article.status ===
                      'approved'
                  "
                  @click="
                    viewArticle(article)
                  "
                >
                  查看
                </AppButton>
              </div>
            </div>
          </article>
        </div>
      </AppLoading>
    </div>
  </main>
</template>

<script setup lang="ts">
import type {
  IArticle,
  TArticleStatus,
} from '@/types/article'

import {
  computed,
  ref,
} from 'vue'
import { useRouter } from 'vue-router'

import { useMyArticlesQuery } from '@/queries/article'

type StatusFilter =
  | ''
  | TArticleStatus

type ArticleTagType =
  | 'primary'
  | 'success'
  | 'warning'
  | 'info'
  | 'danger'

const router = useRouter()

const {
  data: articles,
  error,
  isLoading,
  refetch,
} = useMyArticlesQuery()

const statusFilter =
  ref<StatusFilter>('')

const isReloading = ref(false)

const filteredArticles =
  computed(() => {
    const list =
      articles.value ?? []

    if (!statusFilter.value) {
      return list
    }

    return list.filter(
      article =>
        article.status ===
        statusFilter.value,
    )
  })

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

function articleStatusDescription(
  status: TArticleStatus,
): string {
  const descriptions: Record<
    TArticleStatus,
    string
  > = {
    draft:
      '這篇文章尚未送出審核。',
    pending:
      '文章正在等待管理員審核。',
    approved:
      '文章已通過審核並公開顯示。',
    rejected:
      '文章未通過審核，可修改後重新送審。',
  }

  return descriptions[status]
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

function viewArticle(
  article: IArticle,
): void {
  router.push(
    `/articles/${article.slug}`,
  )
}

function editArticle(
  article: IArticle,
): void {
  router.push(
    `/user/articles/${article._id}/edit`,
  )
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
</script>

<route lang="yaml">
meta:
  title: 我的文章
  access: authenticated
</route>

<style scoped lang="scss">
.my-articles-page {
  padding: 48px 0 72px;
}

.page-container {
  width: min(
    1000px,
    calc(100% - 40px)
  );
  margin: 0 auto;
}

.page-header {
  display: flex;
  gap: 24px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;

  h1 {
    margin: 4px 0 10px;
    font-size: 2rem;
  }

  p {
    margin: 0;
    color:
      var(--color-text-secondary);
  }
}

.eyebrow {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.16em;
}

.status-filter {
  overflow-x: auto;
  margin-bottom: 28px;
  padding-bottom: 4px;
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.article-card {
  display: grid;
  overflow: hidden;
  grid-template-columns:
    240px minmax(0, 1fr);
  border: 1px solid
    var(--color-border);
  border-radius: 16px;
  background:
    var(--color-background);

  &__cover {
    min-height: 210px;

    :deep(.el-image) {
      width: 100%;
      height: 100%;
    }
  }

  &__image-error {
    display: grid;
    width: 100%;
    height: 100%;
    min-height: 210px;
    place-items: center;
    background:
      var(--el-fill-color-light);
    color:
      var(--color-text-secondary);
  }

  &__content {
    display: flex;
    min-width: 0;
    flex-direction: column;
    padding: 22px;
  }

  h2 {
    margin: 14px 0 8px;
    font-size: 1.35rem;
  }
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.article-summary {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  line-height: 1.7;
  color:
    var(--color-text-secondary);
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.article-dates {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  margin-top: 18px;
  color:
    var(--color-text-secondary);
  font-size: 0.85rem;
}

.article-status-note {
  margin-top: 12px;
  font-size: 0.9rem;
  color:
    var(--color-text-secondary);
}

.article-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: auto;
  padding-top: 20px;

  :deep(.el-button) {
    margin-left: 0;
  }
}

@media (max-width: 720px) {
  .page-header {
    align-items: stretch;
    flex-direction: column;

    :deep(.el-button) {
      width: 100%;
    }
  }

  .article-card {
    grid-template-columns: 1fr;

    &__cover {
      aspect-ratio: 16 / 9;
      min-height: 0;
    }
  }
}

@media (max-width: 480px) {
  .my-articles-page {
    padding: 32px 0 48px;
  }

  .page-container {
    width: min(
      100%,
      calc(100% - 32px)
    );
  }

  .article-actions {
    flex-direction: column;

    :deep(.el-button) {
      width: 100%;
    }
  }
}
</style>
