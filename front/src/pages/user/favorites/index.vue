<template>
  <section class="favorites-page">
    <header class="favorites-page__header">
      <div>
        <h1>我的收藏</h1>

        <p>
          查看你收藏的拉麵論壇文章。
        </p>
      </div>

      <AppButton
        type="primary"
        plain
        @click="goToArticles"
      >
        前往拉麵論壇
      </AppButton>
    </header>

    <AppLoading
      :loading="isLoading"
      text="正在載入收藏文章..."
    >
      <!-- API Error -->
      <AppCard
        v-if="error"
        class="favorites-state"
      >
        <AppEmpty
          description="目前無法取得收藏文章"
        />

        <div class="state-actions">
          <AppButton
            type="primary"
            :loading="isReloading"
            @click="reloadFavorites"
          >
            重新載入
          </AppButton>
        </div>
      </AppCard>

      <!-- Empty -->
      <AppCard
        v-else-if="
          !favorites ||
            favorites.length === 0
        "
        class="favorites-state"
      >
        <AppEmpty
          description="目前還沒有收藏文章"
        />

        <div class="state-actions">
          <AppButton
            type="primary"
            @click="goToArticles"
          >
            去拉麵論壇看看
          </AppButton>
        </div>
      </AppCard>

      <!-- Favorite List -->
      <div
        v-else
        class="favorites-grid"
      >
        <AppCard
          v-for="favorite in favorites"
          :key="favorite._id"
          class="favorite-card"
        >
          <article>
            <div
              v-if="
                favorite.article.coverImageUrl ||
                  favorite.article.coverImage
              "
              class="favorite-card__image"
            >
              <img
                :src="
                  favorite.article.coverImageUrl ||
                    favorite.article.coverImage
                "
                :alt="favorite.article.title"
              />
            </div>

            <div class="favorite-card__body">
              <div
                class="
                  favorite-card__meta
                "
              >
                <el-tag
                  type="primary"
                  effect="light"
                >
                  {{
                    favorite.article
                      .category
                  }}
                </el-tag>

                <span>
                  收藏於
                  {{
                    formatDateTime(
                      favorite.createdAt,
                    )
                  }}
                </span>
              </div>

              <h2>
                {{
                  favorite.article.title
                }}
              </h2>

              <p
                v-if="
                  favorite.article.summary
                "
                class="
                  favorite-card__summary
                "
              >
                {{
                  favorite.article.summary
                }}
              </p>

              <div
                class="
                  favorite-card__actions
                "
              >
                <AppButton
                  type="primary"
                  @click="
                    openArticle(
                      favorite.article
                        .slug,
                    )
                  "
                >
                  查看文章
                </AppButton>

                <AppButton
                  type="danger"
                  plain
                  :loading="
                    removingArticleId ===
                      favorite.article._id
                  "
                  @click="
                    removeFavorite(
                      favorite.article._id,
                    )
                  "
                >
                  取消收藏
                </AppButton>
              </div>
            </div>
          </article>
        </AppCard>
      </div>
    </AppLoading>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, } from 'vue'
import { useRouter, } from 'vue-router'
import { useQuery, } from '@pinia/colada'
import { useUserStore, } from '@/stores/user'

import {
  articleReactionKeys,
  useRemoveArticleFavoriteMutation,
} from '@/queries/articleReaction'
import * as articleReactionService
  from '@/services/articleReaction'
import {
  useSnackbarStore,
} from '@/stores/snackbar'

const router = useRouter()
const snackbar = useSnackbarStore()

const user = useUserStore()

const userKey = computed(
  () => user.account || '',
)

// ========================================
// Favorites Query
// ========================================

const {
  data: favorites,
  error,
  isLoading,
  refetch,
} = useQuery({
  key: () =>
    articleReactionKeys.favorites(
      userKey.value,
    ),

  query: async () => {
    const { data } =
      await articleReactionService
        .getMyArticleFavorites()

    return data.result
  },

  enabled: () =>
    Boolean(userKey.value) &&
    user.isLoggedIn,
})

// ========================================
// Remove Favorite
// ========================================

const removeFavoriteMutation =
  useRemoveArticleFavoriteMutation()

const removingArticleId =
  ref<string | null>(null)

async function removeFavorite(
  articleId: string,
): Promise<void> {
  if (
    removingArticleId.value ||
    removeFavoriteMutation
      .isLoading.value
  ) {
    return
  }

  removingArticleId.value =
    articleId

  try {
    await removeFavoriteMutation
  .mutateAsync({
    articleId,
    userKey: userKey.value,
  })

    snackbar.add({
      text: '已取消收藏',
      color: 'success',
    })
  } catch (error) {
    snackbar.addError(error)
  } finally {
    removingArticleId.value =
      null
  }
}

// ========================================
// Reload
// ========================================

const isReloading = ref(false)

async function reloadFavorites():
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

// ========================================
// Navigation
// ========================================

function openArticle(
  slug: string,
): void {
  router.push(
    `/articles/${slug}`,
  )
}

function goToArticles(): void {
  router.push('/articles')
}

// ========================================
// Format
// ========================================

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
</script>

<style scoped lang="scss">
.favorites-page {
  width: min(100%, 1100px);
  margin: 0 auto;
  padding: 32px 20px;
}

.favorites-page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;

  h1 {
    margin: 0;
    color: var(--color-text);
    font-size: 28px;
  }

  p {
    margin: 8px 0 0;
    color:
      var(--color-text-secondary);
  }
}

.favorites-grid {
  display: grid;
  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );
  gap: 20px;
}

.favorite-card {
  overflow: hidden;

  article {
    height: auto;
  }
}

.favorite-card__image {
  overflow: hidden;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: var(--radius-md);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.favorite-card__body {
  display: flex;
  flex-direction: column;
  padding-top: 18px;

  h2 {
    margin: 14px 0 10px;
    color: var(--color-text);
    font-size: 20px;
    line-height: 1.4;
  }
}

.favorite-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color:
    var(--color-text-secondary);
  font-size: 13px;
}

.favorite-card__summary {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  color:
    var(--color-text-secondary);
  line-height: 1.7;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.favorite-card__actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;

  :deep(.el-button) {
    margin-left: 0;
  }
}

.favorites-state {
  padding: 32px;
}

.state-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .favorites-page {
    padding: 20px 12px;
  }

  .favorites-page__header {
    align-items: stretch;
    flex-direction: column;

    :deep(.el-button) {
      width: 100%;
    }
  }

  .favorites-grid {
    grid-template-columns: 1fr;
  }

  .favorite-card__meta {
    align-items: flex-start;
    flex-direction: column;
  }

  .favorite-card__actions {
    flex-direction: column;

    :deep(.el-button) {
      width: 100%;
    }
  }
}
</style>

<route lang="yaml">
meta:
  access: authenticated
  title: 我的收藏
</route>
