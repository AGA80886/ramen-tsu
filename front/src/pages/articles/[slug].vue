<template>
  <main class="article-detail-page">
    <div class="page-container">
      <!-- 返回論壇 -->
      <div class="article-nav">
        <AppButton
          plain
          @click="router.push('/articles')"
        >
          ← 返回拉麵論壇
        </AppButton>
      </div>

      <AppLoading
        :loading="isLoading"
        text="正在載入文章..."
        min-height="420px"
      >
        <!-- API Error -->
        <AppCard v-if="error">
          <AppEmpty
            description="這篇文章不存在、尚未通過審核，或已被下架。"
          >
            <AppButton
              type="primary"
              @click="router.push('/articles')"
            >
              返回拉麵論壇
            </AppButton>
          </AppEmpty>
        </AppCard>

        <!-- Article 不存在 -->
        <AppCard v-else-if="!article">
          <AppEmpty
            description="這篇文章不存在、尚未通過審核，或已被下架。"
          >
            <AppButton
              type="primary"
              @click="router.push('/articles')"
            >
              返回拉麵論壇
            </AppButton>
          </AppEmpty>
        </AppCard>

        <!-- Article Detail -->
        <article
          v-else
          class="article"
        >
          <!-- Header -->
          <header class="article__header">
            <div class="article__tags">
              <el-tag
                type="primary"
                effect="light"
              >
                {{ article.category }}
              </el-tag>
            </div>

            <h1>
              {{ article.title }}
            </h1>

            <p class="article__summary">
              {{ article.summary }}
            </p>

            <div class="article__meta">
              <span v-if="article.author">
                作者：
                {{
                  article.author.nickname ||
                    article.author.account
                }}
              </span>

              <span>
                發布時間：
                {{
                  formatDateTime(
                    article.createdAt,
                  )
                }}
              </span>

              <span
                v-if="
                  article.updatedAt !==
                    article.createdAt
                "
              >
                更新時間：
                {{
                  formatDateTime(
                    article.updatedAt,
                  )
                }}
              </span>
            </div>
          </header>

          <!-- Cover -->
          <div class="article__cover">
            <el-image
              :src="
                article.coverImageUrl ||
                  article.coverImage
              "
              :alt="article.title"
              fit="cover"
            >
              <template #error>
                <div
                  class="
                    article__image-error
                  "
                >
                  圖片載入失敗
                </div>
              </template>
            </el-image>
          </div>

          <!-- Content -->
          <AppCard class="article__body">
            <div
              class="article__content"
            >
              {{ article.content }}
            </div>
          </AppCard>

          <!-- Footer -->
          <footer class="article__footer">
            <AppButton
              plain
              @click="router.push('/articles')"
            >
              ← 返回拉麵論壇
            </AppButton>
          </footer>
        </article>
      </AppLoading>
    </div>
  </main>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
} from 'vue'

import {
  useRoute,
  useRouter,
} from 'vue-router'

import { useQuery, } from '@pinia/colada'
import * as articleService from '@/services/article'

const route = useRoute()
const router = useRouter()

const slug = computed(() => {
  const params =
    route.params as Record<
      string,
      string | string[] | undefined
    >

  const value =
    params.slug

  if (Array.isArray(value)) {
    return value[0] ?? ''
  }

  return String(value ?? '')
})

const {
  data: article,
  error,
  isLoading,
  refetch,
} = useQuery({
  key: () => [
    'article',
    'detail',
    slug.value,
  ],

  query: async () => {
    const { data } =
      await articleService
        .getArticleBySlug(
          slug.value,
        )

    return data.result
  },

  enabled: () =>
    Boolean(slug.value),
})

const isReloading = ref(false)

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

async function reloadArticle():
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
  title: 文章內容
</route>

<style scoped lang="scss">
.article-detail-page {
  padding: 40px 0 72px;
}

.page-container {
  width: min(
    920px,
    calc(100% - 40px)
  );
  margin: 0 auto;
}

.article-nav {
  margin-bottom: 28px;

  :deep(.el-button) {
    margin-left: 0;
  }
}

.article {
  &__header {
    margin-bottom: 32px;

    h1 {
      margin: 16px 0;
      font-size: clamp(
        2rem,
        5vw,
        3rem
      );
      line-height: 1.3;
    }
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__summary {
    margin: 0;
    color:
      var(--color-text-secondary);
    font-size: 1.1rem;
    line-height: 1.8;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 24px;
    margin-top: 20px;
    color:
      var(--color-text-secondary);
    font-size: 0.9rem;
  }

  &__cover {
    overflow: hidden;
    margin-bottom: 32px;
    aspect-ratio: 16 / 9;
    border-radius: 16px;

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

  &__body {
    margin-bottom: 32px;
  }

  &__content {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    font-size: 1.05rem;
    line-height: 2;
  }

  &__footer {
    display: flex;
    justify-content: flex-start;

    :deep(.el-button) {
      margin-left: 0;
    }
  }
}

@media (max-width: 640px) {
  .article-detail-page {
    padding: 28px 0 48px;
  }

  .page-container {
    width: min(
      100%,
      calc(100% - 32px)
    );
  }

  .article {
    &__header {
      margin-bottom: 24px;
    }

    &__meta {
      flex-direction: column;
      gap: 6px;
    }

    &__cover {
      margin-bottom: 24px;
      border-radius: 12px;
    }

    &__content {
      font-size: 1rem;
      line-height: 1.9;
    }
  }
}
</style>
