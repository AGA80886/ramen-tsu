<template>
  <main class="articles-page">
    <section class="articles-hero">
      <div class="page-container articles-hero__inner">
        <div>
          <p class="articles-hero__eyebrow">
            RAMEN FORUM
          </p>

          <h1>拉麵論壇</h1>

          <p class="articles-hero__description">
            分享你的拉麵食記、知識與最新情報，
            和其他拉麵愛好者一起交流。
          </p>
        </div>

        <button
          type="button"
          class="btn btn-primary"
          @click="goToCreateArticle"
        >
          投稿文章
        </button>
      </div>
    </section>

    <section class="page-container articles-content">
      <div class="articles-toolbar">
        <div class="articles-search">
          <label
            for="article-keyword"
            class="form-label"
          >
            搜尋文章
          </label>

          <input
            id="article-keyword"
            v-model="search"
            type="search"
            class="form-control"
            placeholder="搜尋文章標題、摘要或分類"
          />
        </div>

        <div class="category-filter">
          <button
            type="button"
            class="btn"
            :class="
              selectedCategory === ''
                ? 'btn-primary'
                : 'btn-outline-secondary'
            "
            @click="selectedCategory = ''"
          >
            全部
          </button>

          <button
            v-for="category in categoryOptions"
            :key="category"
            type="button"
            class="btn"
            :class="
              selectedCategory === category
                ? 'btn-primary'
                : 'btn-outline-secondary'
            "
            @click="selectedCategory = category"
          >
            {{ category }}
          </button>

          <button
            type="button"
            class="btn btn-outline-secondary category-filter__reset"
            @click="resetFilters"
          >
            清除篩選
          </button>
        </div>

        <div class="articles-toolbar__result">
          找到
          <strong>
            {{ filteredArticles.length }}
          </strong>
          篇文章
        </div>
      </div>

      <AppLoading
        :loading="isLoading"
        text="正在載入文章..."
        min-height="360px"
      >
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

        <el-empty
          v-else-if="filteredArticles.length === 0"
          description="目前沒有符合條件的文章"
        />

        <div
          v-else
          class="articles-grid"
        >
          <article
            v-for="article in filteredArticles"
            :key="article._id"
            class="article-card"
            tabindex="0"
            role="link"
            @click="openArticle(article.slug)"
            @keydown.enter="openArticle(article.slug)"
            @keydown.space.prevent="
              openArticle(article.slug)
            "
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
                  <div class="article-card__image-error">
                    <span>圖片載入失敗</span>
                  </div>
                </template>
              </el-image>

              <span class="article-card__category">
                {{ article.category }}
              </span>
            </div>

            <div class="article-card__body">
              <div class="article-card__meta">
                <span>
                  {{ formatDate(article.createdAt) }}
                </span>

                <span v-if="getAuthorName(article)">
                  {{ getAuthorName(article) }}
                </span>
              </div>

              <h2>
                {{ article.title }}
              </h2>

              <p class="article-card__summary">
                {{ article.summary }}
              </p>

              <div class="article-card__footer">
                <span>
                  閱讀文章
                </span>
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
  TArticleCategory,
} from '@/types/article'

import {
  computed,
  ref,
} from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useArticlesQuery } from '@/queries/article'

const user = useUserStore()

async function goToCreateArticle():
Promise<void> {
  if (user.isLoggedIn) {
    await router.push(
      '/articles/create',
    )
    return
  }

  await router.push({
    path: '/login',
    query: {
      redirect: '/articles/create',
    },
  })
}

const router = useRouter()

const {
  data: articles,
  error,
  isLoading,
  refetch,
} = useArticlesQuery()

const search = ref('')

const selectedCategory =
  ref<TArticleCategory | ''>('')

const isReloading = ref(false)

const categoryOptions: TArticleCategory[] = [
  '公告',
  '拉麵科普',
  '食記分享',
  '最新情報',
  '議題討論',
  '即食拉麵',
  '其他',
]

const resetFilters = () => {
  search.value = ''
  selectedCategory.value = ''
}

const filteredArticles = computed(() => {
  const keyword = search.value
    .trim()
    .toLowerCase()

  return (articles.value ?? []).filter(
    article => {
      if (
        selectedCategory.value &&
        article.category !==
          selectedCategory.value
      ) {
        return false
      }

      if (!keyword) {
        return true
      }

      return [
        article.title,
        article.summary,
        article.category,
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
  return (
    article.author?.nickname ||
    article.author?.account ||
    ''
  )
}

function formatDate(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    'zh-TW',
    {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    },
  ).format(new Date(value))
}

function openArticle(
  slug: string,
): void {
  router.push(
    `/articles/${slug}`,
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

<style scoped lang="scss">
.articles-page {
  min-height: 100vh;
}

.page-container {
  width: min(
    1200px,
    calc(100% - 40px)
  );
  margin: 0 auto;
}

.articles-hero {
  padding: 72px 0 64px;

  &__inner {
    display: flex;
    gap: 32px;
    align-items: center;
    justify-content: space-between;
  }

  &__eyebrow {
    margin: 0 0 10px;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.18em;
  }

  h1 {
    margin: 0;
    font-size: clamp(
      2rem,
      5vw,
      3.4rem
    );
  }

  &__description {
    max-width: 620px;
    margin: 16px 0 0;
    line-height: 1.8;
    color:
      var(--color-text-secondary);
  }
}

.articles-content {
  padding-bottom: 72px;
}

.articles-toolbar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 32px;

  &__result {
    text-align: center;
    color:
      var(--color-text-secondary);
    font-size: 0.9rem;
  }
}

.articles-search {
  width: min(100%, 480px);
  margin: 0 auto;

  .form-label {
    display: block;
    margin-bottom: 8px;
    text-align: center;
    font-weight: 600;
  }
}

.category-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;

  .btn {
    min-width: 92px;
  }

  &__reset {
    min-width: 110px;
  }
}

/*
 * 與拉麵店家頁一致：
 * 按鈕 hover / focus 交由 Bootstrap 的 btn 樣式處理，
 * 不另外改寫背景色、文字色或 transform。
 */
.articles-page {
  .btn-primary,
  .btn-outline-secondary {
    transition:
      color 0.15s ease-in-out,
      background-color 0.15s ease-in-out,
      border-color 0.15s ease-in-out,
      box-shadow 0.15s ease-in-out;
  }

  .btn-primary:hover,
  .btn-primary:focus-visible {
    color: var(--bs-btn-hover-color);
    background-color:
      var(--bs-btn-hover-bg);
    border-color:
      var(--bs-btn-hover-border-color);
  }

  .btn-outline-secondary:hover,
  .btn-outline-secondary:focus-visible {
    color: var(--bs-btn-hover-color);
    background-color:
      var(--bs-btn-hover-bg);
    border-color:
      var(--bs-btn-hover-border-color);
  }
}

.articles-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 24px;
}

.article-card {
  overflow: hidden;
  border: 1px solid
    var(--color-border);
  border-radius: 16px;
  background: var(--color-background);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover,
  &:focus-visible {
    transform: translateY(-4px);
    box-shadow:
      0 12px 30px
      rgb(0 0 0 / 10%);
  }

  &:focus-visible {
    outline: 2px solid
      var(--el-color-primary);
    outline-offset: 3px;
  }

  &__cover {
    position: relative;
    overflow: hidden;
    aspect-ratio: 16 / 9;

    :deep(.el-image) {
      width: 100%;
      height: 100%;
    }
  }

  &__image-error {
    display: grid;
    width: 100%;
    height: 100%;
    place-items: center;
    background:
      var(--el-fill-color-light);
    color:
      var(--color-text-secondary);
  }

  &__category {
    position: absolute;
    top: 14px;
    left: 14px;
    padding: 6px 10px;
    border-radius: 999px;
    background:
      rgb(0 0 0 / 68%);
    color: #fff;
    font-size: 0.8rem;
    font-weight: 600;
  }

  &__body {
    display: flex;
    min-height: 230px;
    flex-direction: column;
    padding: 20px;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 16px;
    margin-bottom: 10px;
    color:
      var(--color-text-secondary);
    font-size: 0.8rem;
  }

  h2 {
    display: -webkit-box;
    overflow: hidden;
    margin: 0;
    font-size: 1.25rem;
    line-height: 1.5;
    -webkit-box-orient: vertical;
    line-clamp: 2;
    -webkit-line-clamp: 2;
  }

  &__summary {
    display: -webkit-box;
    overflow: hidden;
    margin: 12px 0 0;
    line-height: 1.7;
    color:
      var(--color-text-secondary);
    -webkit-box-orient: vertical;
    line-clamp: 3;
    -webkit-line-clamp: 3;
  }

  &__footer {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-top: auto;
    padding-top: 20px;
    font-weight: 600;
    color:
      var(--el-color-primary);
  }
}

@media (max-width: 960px) {
  .articles-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .page-container {
    width: min(
      100%,
      calc(100% - 32px)
    );
  }

  .articles-hero {
    &__inner {
      flex-direction: column;
      align-items: stretch;
    }

    :deep(.el-button) {
      width: 100%;
    }
  }

  .articles-content {
    padding-bottom: 48px;
  }

  .category-filter {
    align-items: stretch;
    flex-direction: column;

    .btn {
      width: 100%;
    }
  }

  .articles-grid {
    grid-template-columns: 1fr;
  }

  .article-card {
    &__body {
      min-height: auto;
    }
  }
}
</style>

<route lang="yaml">
meta:
  title: 拉麵論壇
</route>
