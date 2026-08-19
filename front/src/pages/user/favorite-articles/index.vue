<template>
  <main class="favorite-articles-page">
    <section class="favorite-articles-hero">
      <div class="page-container favorite-articles-hero__inner">
        <div>
          <p class="eyebrow">
            MY FAVORITES
          </p>

          <h1>我的收藏文章</h1>

          <p class="favorite-articles-hero__description">
            查看您收藏的拉麵論壇文章，快速回到想再次閱讀的內容。
          </p>
        </div>
      </div>
    </section>

    <section class="page-container favorite-articles-content">
      <div class="favorites-overview">
        <div class="favorites-overview__item">
          <strong>
            {{ favoriteCount }}
          </strong>

          <span>
            收藏文章
          </span>
        </div>
      </div>

      <AppLoading
        :loading="isLoading"
        text="正在載入收藏文章..."
        min-height="320px"
      >
        <div
          v-if="error"
          class="page-state page-state--error"
        >
          <p>
            無法取得收藏文章
          </p>

          <button
            type="button"
            class="btn btn-primary"
            :disabled="isReloading"
            @click="reloadFavorites"
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
            !favorites ||
              favorites.length === 0
          "
          class="empty-state"
        >
          <div class="empty-state__icon">
            ♡
          </div>

          <h2>
            目前還沒有收藏文章
          </h2>

          <p>
            到拉麵論壇看看感興趣的文章，收藏後就會出現在這裡。
          </p>

          <button
            type="button"
            class="btn btn-primary"
            @click="goToArticles"
          >
            去拉麵論壇看看
          </button>
        </div>

        <div
          v-else
          class="favorites-list"
        >
          <article
            v-for="favorite in favorites"
            :key="favorite._id"
            class="favorite-card"
          >
            <div class="favorite-card__cover">
              <img
                v-if="
                  favorite.article.coverImageUrl ||
                    favorite.article.coverImage
                "
                :src="
                  favorite.article.coverImageUrl ||
                    favorite.article.coverImage
                "
                :alt="favorite.article.title"
                class="favorite-card__image"
              />

              <div
                v-else
                class="favorite-card__placeholder"
              >
                暫無圖片
              </div>

              <span class="favorite-card__category">
                {{ favorite.article.category }}
              </span>
            </div>

            <div class="favorite-card__content">
              <div class="favorite-card__meta">
                <span>
                  收藏於
                  {{
                    formatDateTime(
                      favorite.createdAt,
                    )
                  }}
                </span>
              </div>

              <h2 class="favorite-card__title">
                {{ favorite.article.title }}
              </h2>

              <p
                v-if="favorite.article.summary"
                class="favorite-card__summary"
              >
                {{ favorite.article.summary }}
              </p>

              <div class="favorite-card__footer">
                <div class="favorite-card__actions">
                  <button
                    type="button"
                    class="btn btn-outline-primary"
                    @click="
                      openArticle(
                        favorite.article.slug,
                      )
                    "
                  >
                    查看文章
                  </button>

                  <button
                    type="button"
                    class="btn btn-outline-danger"
                    :disabled="
                      removingArticleId ===
                        favorite.article._id
                    "
                    @click="
                      removeFavorite(
                        favorite.article._id,
                      )
                    "
                  >
                    {{
                      removingArticleId ===
                        favorite.article._id
                        ? '取消收藏中...'
                        : '取消收藏'
                    }}
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
import {
  computed,
  ref,
} from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@pinia/colada'

import { useUserStore } from '@/stores/user'
import { useSnackbarStore } from '@/stores/snackbar'

import {
  articleReactionKeys,
  useRemoveArticleFavoriteMutation,
} from '@/queries/articleReaction'

import * as articleReactionService
  from '@/services/articleReaction'

const router = useRouter()
const snackbar = useSnackbarStore()
const user = useUserStore()

const userKey = computed(
  () => user.account || '',
)

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

const favoriteCount = computed(() => {
  return favorites.value?.length ?? 0
})

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

function openArticle(
  slug: string,
): void {
  void router.push(
    `/articles/${slug}`,
  )
}

function goToArticles(): void {
  void router.push('/articles')
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
</script>

<style scoped lang="scss">
.favorite-articles-page {
  min-height: 100vh;
}

.page-container {
  width: min(
    1180px,
    calc(100% - 40px)
  );
  margin: 0 auto;
}

.favorite-articles-hero {
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

.favorite-articles-content {
  padding-bottom: 72px;
}

.favorites-overview {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr);
  max-width: 280px;
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

.favorites-list {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.favorite-card {
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
  .favorites-list {
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

  .favorite-articles-hero {
    padding: 40px 0 32px;

    &__inner {
      align-items: stretch;
      flex-direction: column;
    }
  }

  .favorite-articles-content {
    padding-bottom: 48px;
  }

  .favorites-overview {
    max-width: none;
  }

  .favorite-card {
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

<route lang="yaml">
meta:
  access: authenticated
  title: 我的收藏
</route>
