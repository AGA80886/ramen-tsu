<template>
  <main class="my-articles-page">
    <section class="my-articles-hero">
      <div class="page-container my-articles-hero__inner">
        <div>
          <p class="eyebrow">
            MY ARTICLES
          </p>

          <h1>我的投稿文章</h1>

          <p class="my-articles-hero__description">
            查看你的論壇投稿、文章內容與審核狀態。
          </p>
        </div>
      </div>
    </section>

    <section class="page-container my-articles-content">
      <div class="articles-overview">
        <div class="articles-overview__item">
          <strong>
            {{ totalCount }}
          </strong>
          <span>
            全部文章
          </span>
        </div>

        <div class="articles-overview__item">
          <strong>
            {{ pendingCount }}
          </strong>
          <span>
            審核中
          </span>
        </div>

        <div class="articles-overview__item">
          <strong>
            {{ approvedCount }}
          </strong>
          <span>
            已通過
          </span>
        </div>

        <div class="articles-overview__item">
          <strong>
            {{ rejectedCount }}
          </strong>
          <span>
            未通過
          </span>
        </div>
      </div>

      <div class="status-filter">
        <button
          type="button"
          class="btn"
          :class="
            statusFilter === ''
              ? 'btn-primary'
              : 'btn-outline-secondary'
          "
          @click="statusFilter = ''"
        >
          全部
        </button>

        <button
          type="button"
          class="btn"
          :class="
            statusFilter === 'draft'
              ? 'btn-primary'
              : 'btn-outline-secondary'
          "
          @click="statusFilter = 'draft'"
        >
          草稿
        </button>

        <button
          type="button"
          class="btn"
          :class="
            statusFilter === 'pending'
              ? 'btn-primary'
              : 'btn-outline-secondary'
          "
          @click="statusFilter = 'pending'"
        >
          審核中
        </button>

        <button
          type="button"
          class="btn"
          :class="
            statusFilter === 'approved'
              ? 'btn-primary'
              : 'btn-outline-secondary'
          "
          @click="statusFilter = 'approved'"
        >
          已通過
        </button>

        <button
          type="button"
          class="btn"
          :class="
            statusFilter === 'rejected'
              ? 'btn-primary'
              : 'btn-outline-secondary'
          "
          @click="statusFilter = 'rejected'"
        >
          未通過
        </button>
      </div>

      <AppLoading
        :loading="isLoading"
        text="正在載入文章..."
        min-height="320px"
      >
        <div
          v-if="error"
          class="page-state page-state--error"
        >
          <p>
            無法取得我的文章
          </p>

          <button
            type="button"
            class="btn btn-primary"
            :disabled="isReloading"
            @click="reloadArticles"
          >
            {{
              isReloading
                ? '重新載入中...'
                : '重新載入'
            }}
          </button>
        </div>

        <div
          v-else-if="
            filteredArticles.length === 0 &&
              !isLoading
          "
          class="empty-state"
        >
          <div class="empty-state__icon">
            📝
          </div>

          <h2>
            目前沒有文章
          </h2>

          <p>
            {{
              statusFilter
                ? '目前沒有符合這個審核狀態的文章。'
                : '你目前還沒有投稿文章。'
            }}
          </p>

          <RouterLink
            to="/articles/create"
            class="btn btn-primary"
          >
            投稿第一篇文章
          </RouterLink>
        </div>

        <div
          v-else
          class="articles-list"
        >
          <article
            v-for="article in filteredArticles"
            :key="article._id"
            class="article-card"
          >
            <div class="article-card__cover">
              <img
                v-if="
                  article.coverImageUrl ||
                    article.coverImage
                "
                :src="
                  article.coverImageUrl ||
                    article.coverImage
                "
                :alt="article.title"
                class="article-card__image"
              />

              <div
                v-else
                class="article-card__placeholder"
              >
                暫無圖片
              </div>

              <span
                class="article-card__status"
                :class="
                  statusModifier[
                    article.status
                  ]
                "
              >
                {{
                  articleStatusText(
                    article.status,
                  )
                }}
              </span>
            </div>

            <div class="article-card__content">
              <div class="article-card__meta">
                <span>
                  {{ article.category }}
                </span>

                <span>
                  建立於
                  {{
                    formatDate(
                      article.createdAt,
                    )
                  }}
                </span>
              </div>

              <h2 class="article-card__title">
                {{ article.title }}
              </h2>

              <p class="article-card__summary">
                {{ article.summary }}
              </p>

              <div class="article-card__status-note">
                {{
                  articleStatusDescription(
                    article.status,
                  )
                }}
              </div>

              <div class="article-card__footer">
                <div class="article-card__actions">
                  <button
                    type="button"
                    class="btn btn-outline-primary"
                    @click="editArticle(article)"
                  >
                    編輯
                  </button>

                  <button
                    v-if="
                      article.status ===
                        'approved'
                    "
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="viewArticle(article)"
                  >
                    查看公開頁
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </AppLoading>
    </section>
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

const articleList = computed(() => {
  return articles.value ?? []
})

const filteredArticles =
  computed(() => {
    if (!statusFilter.value) {
      return articleList.value
    }

    return articleList.value.filter(
      article =>
        article.status ===
        statusFilter.value,
    )
  })

const totalCount = computed(() => {
  return articleList.value.length
})

const pendingCount = computed(() => {
  return articleList.value.filter(
    article =>
      article.status === 'pending',
  ).length
})

const approvedCount = computed(() => {
  return articleList.value.filter(
    article =>
      article.status === 'approved',
  ).length
})

const rejectedCount = computed(() => {
  return articleList.value.filter(
    article =>
      article.status === 'rejected',
  ).length
})

const statusModifier: Record<
  TArticleStatus,
  string
> = {
  draft: 'article-card__status--draft',
  pending: 'article-card__status--pending',
  approved: 'article-card__status--approved',
  rejected: 'article-card__status--rejected',
}

function articleStatusText(
  status: TArticleStatus,
): string {
  const labels: Record<
    TArticleStatus,
    string
  > = {
    draft: '草稿',
    pending: '審核中',
    approved: '已通過',
    rejected: '未通過',
  }

  return labels[status]
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

function formatDate(
  value: string,
): string {
  return new Date(
    value,
  ).toLocaleDateString(
    'zh-TW',
    {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    },
  )
}

function viewArticle(
  article: IArticle,
): void {
  void router.push(
    `/articles/${article.slug}`,
  )
}

function editArticle(
  article: IArticle,
): void {
  void router.push(
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
  min-height: 100vh;
}

.page-container {
  width: min(
    1180px,
    calc(100% - 40px)
  );
  margin: 0 auto;
}

.my-articles-hero {
  padding: 64px 0 48px;

  &__inner {
    display: flex;
    gap: 32px;
    align-items: center;
    justify-content: space-between;
  }

  h1 {
    margin: 4px 0 12px;
    font-size: clamp(
      2rem,
      5vw,
      3rem
    );
  }

  &__description {
    max-width: 620px;
    margin: 0;
    color:
      var(--color-text-secondary);
    line-height: 1.8;
  }
}

.eyebrow {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.16em;
}

.my-articles-content {
  padding-bottom: 72px;
}

.articles-overview {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 28px;

  &__item {
    display: flex;
    min-height: 96px;
    flex-direction: column;
    justify-content: center;
    padding: 18px 20px;
    border: 1px solid
      var(--color-border);
    border-radius: 14px;
    background:
      var(--color-surface);

    strong {
      font-size: 1.6rem;
      line-height: 1.2;
    }

    span {
      margin-top: 6px;
      color:
        var(--color-text-secondary);
      font-size: 0.9rem;
    }
  }
}

.status-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 28px;
}

.articles-list {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.article-card {
  overflow: hidden;
  border: 1px solid
    var(--color-border);
  border-radius: 16px;
  background:
    var(--color-surface);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform:
      translateY(-3px);
    box-shadow:
      0 12px 28px
      rgb(0 0 0 / 8%);
  }

  &__cover {
    position: relative;
    overflow: hidden;
    aspect-ratio: 16 / 9;
    background:
      var(--el-fill-color-light);
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__placeholder {
    display: grid;
    width: 100%;
    height: 100%;
    place-items: center;
    color:
      var(--color-text-secondary);
  }

  &__status {
    position: absolute;
    top: 14px;
    right: 14px;
    display: inline-flex;
    align-items: center;
    min-height: 30px;
    padding: 5px 11px;
    border-radius: 999px;
    backdrop-filter: blur(6px);
    font-size: 0.82rem;
    font-weight: 700;

    &--draft {
      background:
        rgb(108 117 125 / 88%);
      color: #fff;
    }

    &--pending {
      background:
        rgb(255 193 7 / 92%);
      color: #212529;
    }

    &--approved {
      background:
        rgb(25 135 84 / 92%);
      color: #fff;
    }

    &--rejected {
      background:
        rgb(220 53 69 / 92%);
      color: #fff;
    }
  }

  &__content {
    display: flex;
    min-height: 270px;
    flex-direction: column;
    padding: 22px;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 16px;
    margin-bottom: 10px;
    color:
      var(--color-text-secondary);
    font-size: 0.82rem;
  }

  &__title {
    margin: 0;
    font-size: 1.35rem;
    line-height: 1.45;
  }

  &__summary {
    display: -webkit-box;
    overflow: hidden;
    margin: 14px 0 0;
    color:
      var(--color-text-secondary);
    line-height: 1.75;
    -webkit-box-orient: vertical;
    line-clamp: 3;
    -webkit-line-clamp: 3;
  }

  &__status-note {
    margin-top: 14px;
    color:
      var(--color-text-secondary);
    font-size: 0.88rem;
    line-height: 1.6;
  }

  &__footer {
    padding-top: 20px;
    margin-top: auto;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}

.page-state,
.empty-state {
  padding: 56px 24px;
  border: 1px solid
    var(--color-border);
  border-radius: 16px;
  background:
    var(--color-surface);
  text-align: center;

  &--error {
    color:
      var(--bs-danger);
  }
}

.empty-state {
  &__icon {
    margin-bottom: 12px;
    font-size: 2.25rem;
  }

  h2 {
    margin: 0;
    font-size: 1.35rem;
  }

  p {
    margin: 10px 0 22px;
    color:
      var(--color-text-secondary);
  }
}

@media (max-width: 900px) {
  .articles-overview {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .articles-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .page-container {
    width: min(
      100%,
      calc(100% - 32px)
    );
  }

  .my-articles-hero {
    padding: 40px 0 32px;

    &__inner {
      align-items: stretch;
      flex-direction: column;
    }
  }

  .my-articles-content {
    padding-bottom: 48px;
  }

  .articles-overview {
    grid-template-columns:
      1fr 1fr;
    gap: 10px;

    &__item {
      min-height: 84px;
      padding: 14px;
    }
  }

  .status-filter {
    flex-direction: column;

    .btn {
      width: 100%;
    }
  }

  .article-card {
    &__content {
      min-height: auto;
    }

    &__actions {
      flex-direction: column;

      .btn {
        width: 100%;
      }
    }
  }
}
</style>
