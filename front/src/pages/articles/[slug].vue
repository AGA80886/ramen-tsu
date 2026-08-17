<template>
  <main class="article-detail-page">
    <div class="page-container">
      <!-- 返回論壇 -->
      <div class="article-nav">
        <RouterLink
          to="/articles"
          class="btn btn-outline-secondary"
        >
          返回拉麵論壇
        </RouterLink>
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

            <div class="article-reactions">
              <button
                type="button"
                class="btn"
                :class="
                  likeStatus?.liked
                    ? 'btn-primary'
                    : 'btn-outline-primary'
                "
                :disabled="
                  isMutatingLike ||
                    likeCountLoading
                "
                @click="toggleLike"
              >
                {{
                  likeStatus?.liked
                    ? '♥ 已按讚'
                    : '♡ 按讚'
                }}
                {{ likeCount?.count ?? 0 }}
              </button>

              <button
                type="button"
                class="btn"
                :class="
                  favoriteStatus?.favorited
                    ? 'btn-warning'
                    : 'btn-outline-secondary'
                "
                :disabled="
                  isMutatingFavorite
                "
                @click="toggleFavorite"
              >
                {{
                  favoriteStatus?.favorited
                    ? '★ 已收藏'
                    : '☆ 收藏'
                }}
              </button>
            </div>

            <p
              v-if="!user.isLoggedIn"
              class="article-reactions__hint"
            >
              登入會員後即可按讚與收藏文章。
            </p>
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


          <section class="comments">
            <div class="comments__header">
              <div>
                <h2>留言區</h2>

                <p>
                  與其他拉麵愛好者一起交流。
                </p>
              </div>

              <span class="comments__count">
                {{ comments?.length ?? 0 }} 則留言
              </span>
            </div>

            <!-- 留言輸入 -->
            <AppCard class="comments__form">
              <template v-if="user.isLoggedIn">
                <el-input
                  v-model="commentContent"
                  type="textarea"
                  :rows="4"
                  maxlength="1000"
                  show-word-limit
                  resize="vertical"
                  placeholder="分享你對這篇文章的想法..."
                  @keydown.ctrl.enter="
                    submitComment
                  "
                />

                <div class="comments__form-actions">
                  <span>
                    Ctrl + Enter 快速送出
                  </span>

                  <AppButton
                    type="primary"
                    :loading="isCreatingComment"
                    :disabled="
                      !commentContent.trim()
                    "
                    @click="submitComment"
                  >
                    送出留言
                  </AppButton>
                </div>
              </template>

              <div
                v-else
                class="comments__login"
              >
                <p>
                  登入後即可參與留言。
                </p>

                <AppButton
                  type="primary"
                  @click="goToLogin"
                >
                  前往登入
                </AppButton>
              </div>
            </AppCard>

            <!-- Comments Loading -->
            <AppLoading
              :loading="commentsLoading"
              text="正在載入留言..."
              min-height="180px"
            >
              <!-- Error -->
              <AppCard
                v-if="commentsError"
                class="comments__state"
              >
                <AppEmpty
                  description="目前無法取得留言"
                >
                  <AppButton
                    @click="refetchComments"
                  >
                    重新載入
                  </AppButton>
                </AppEmpty>
              </AppCard>

              <!-- Empty -->
              <AppCard
                v-else-if="
                  !comments?.length
                "
                class="comments__state"
              >
                <AppEmpty
                  description="目前還沒有留言，成為第一個留言的人吧！"
                />
              </AppCard>

              <!-- List -->
              <div
                v-else
                class="comments__list"
              >
                <AppCard
                  v-for="comment in comments"
                  :key="comment._id"
                  class="comment"
                >
                  <div class="comment__header">
                    <div class="comment__author">
                      <el-avatar
                        :size="42"
                        :src="
                          comment.author.avatar
                        "
                      >
                        {{
                          (
                            comment.author
                              .nickname ||
                            comment.author
                              .account
                          )
                            .charAt(0)
                            .toUpperCase()
                        }}
                      </el-avatar>

                      <div>
                        <strong>
                          {{
                            comment.author
                              .nickname ||
                              comment.author
                                .account
                          }}
                        </strong>

                        <div class="comment__time">
                          {{
                            formatDateTime(
                              comment.createdAt,
                            )
                          }}
                        </div>
                      </div>
                    </div>

                    <AppButton
                      v-if="
                        canDeleteComment(
                          comment.author.account,
                        )
                      "
                      type="danger"
                      plain
                      :loading="
                        deletingCommentId ===
                          comment._id
                      "
                      @click="
                        handleDeleteComment(
                          comment._id,
                        )
                      "
                    >
                      刪除
                    </AppButton>
                  </div>

                  <p class="comment__content">
                    {{ comment.content }}
                  </p>
                </AppCard>
              </div>
            </AppLoading>
          </section>
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

import {
  articleCommentKeys,
  useCreateArticleCommentMutation,
  useDeleteArticleCommentMutation,
} from '@/queries/articleComment'
import {
  articleReactionKeys,
  useAddArticleLikeMutation,
  useRemoveArticleLikeMutation,
  useAddArticleFavoriteMutation,
  useRemoveArticleFavoriteMutation,
} from '@/queries/articleReaction'
import * as articleService from '@/services/article'
import * as articleCommentService from '@/services/articleComment'
import * as articleReactionService
  from '@/services/articleReaction'

import { useUserStore } from '@/stores/user'
import { useSnackbarStore } from '@/stores/snackbar'

const route = useRoute()
const router = useRouter()

const user = useUserStore()
const snackbar = useSnackbarStore()

const commentContent = ref('')
const deletingCommentId = ref<string | null>(
  null,
)
const reactionUserKey = computed(
  () => user.account || '',
)


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

const articleId = computed(
  () => article.value?._id ?? '',
)

const {
  data: likeCount,
  isLoading: likeCountLoading,
} = useQuery({
  key: () =>
    articleReactionKeys.likeCount(
      articleId.value,
    ),

  query: async () => {
    const { data } =
      await articleReactionService
        .getArticleLikeCount(
          articleId.value,
        )

    return data.result
  },

  enabled: () =>
    Boolean(articleId.value),
})

const createCommentMutation =
  useCreateArticleCommentMutation()

const deleteCommentMutation =
  useDeleteArticleCommentMutation()

const addLikeMutation =
  useAddArticleLikeMutation()

const removeLikeMutation =
  useRemoveArticleLikeMutation()

const addFavoriteMutation =
  useAddArticleFavoriteMutation()

const removeFavoriteMutation =
  useRemoveArticleFavoriteMutation()

const isMutatingLike = computed(
  () =>
    addLikeMutation.isLoading.value ||
    removeLikeMutation.isLoading.value,
)

const isMutatingFavorite = computed(
  () =>
    addFavoriteMutation.isLoading.value ||
    removeFavoriteMutation.isLoading.value,
)

const isCreatingComment = computed(() => {
  return createCommentMutation
    .isLoading.value
})

const {
  data: comments,
  error: commentsError,
  isLoading: commentsLoading,
  refetch: refetchComments,
} = useQuery({
  key: () =>
    articleCommentKeys.list(
      articleId.value,
    ),

  query: async () => {
    const { data } =
      await articleCommentService
        .getArticleComments(
          articleId.value,
        )

    return data.result
  },

  enabled: () =>
    Boolean(articleId.value),
})

const {
  data: likeStatus,
} = useQuery({
  key: () =>
    articleReactionKeys.likeStatus(
      articleId.value,
      reactionUserKey.value,
    ),

  query: async () => {
    const { data } =
      await articleReactionService
        .getMyArticleLikeStatus(
          articleId.value,
        )

    return data.result
  },

  enabled: () =>
    Boolean(articleId.value) &&
    Boolean(reactionUserKey.value) &&
    user.isLoggedIn,
})

const {
  data: favoriteStatus,
} = useQuery({
  key: () =>
    articleReactionKeys
      .favoriteStatus(
        articleId.value,
        reactionUserKey.value,
      ),

  query: async () => {
    const { data } =
      await articleReactionService
        .getMyArticleFavoriteStatus(
          articleId.value,
        )

    return data.result
  },

  enabled: () =>
    Boolean(articleId.value) &&
    Boolean(reactionUserKey.value) &&
    user.isLoggedIn,
})

function canDeleteComment(
  authorAccount: string,
): boolean {
  if (!user.isLoggedIn) {
    return false
  }

  return (
    user.account === authorAccount ||
    user.role === 'admin'
  )
}

async function submitComment():
Promise<void> {
  if (!user.isLoggedIn) {
    await router.push({
      path: '/login',
      query: {
        redirect: route.fullPath,
      },
    })

    return
  }

  const content =
    commentContent.value.trim()

  if (!content) {
    snackbar.add({
      text: '請輸入留言內容',
      color: 'warning',
    })
    return
  }

  if (content.length > 1000) {
    snackbar.add({
      text: '留言內容最多 1000 個字',
      color: 'warning',
    })
    return
  }

  if (!articleId.value) {
    return
  }

  try {
    await createCommentMutation
      .mutateAsync({
        articleId: articleId.value,
        data: {
          content,
        },
      })

    commentContent.value = ''

    snackbar.add({
      text: '留言成功',
      color: 'success',
    })
  } catch (error) {
    snackbar.addError(error)
  }
}

async function handleDeleteComment(
  commentId: string,
): Promise<void> {
  if (
    !articleId.value ||
    deletingCommentId.value
  ) {
    return
  }

  deletingCommentId.value =
    commentId

  try {
    await deleteCommentMutation
      .mutateAsync({
        articleId: articleId.value,
        commentId,
      })

    snackbar.add({
      text: '留言已刪除',
      color: 'success',
    })
  } catch (error) {
    snackbar.addError(error)
  } finally {
    deletingCommentId.value =
      null
  }
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

async function goToLogin():
Promise<void> {
  await router.push({
    path: '/login',
    query: {
      redirect: route.fullPath,
    },
  })
}

async function toggleLike():
Promise<void> {
  if (!user.isLoggedIn) {
    await goToLogin()
    return
  }

  if (
    !articleId.value ||
    isMutatingLike.value
  ) {
    return
  }

  try {
    if (likeStatus.value?.liked) {
      await removeLikeMutation
        .mutateAsync({
          articleId: articleId.value,
          userKey: reactionUserKey.value
        })

      snackbar.add({
        text: '已取消按讚',
        color: 'success',
      })

      return
    }

    await addLikeMutation
      .mutateAsync({
        articleId: articleId.value,
        userKey: reactionUserKey.value
      })

    snackbar.add({
      text: '按讚成功',
      color: 'success',
    })
  } catch (error) {
    snackbar.addError(error)
  }
}

async function toggleFavorite():
Promise<void> {
  if (!user.isLoggedIn) {
    await goToLogin()
    return
  }

  if (
    !articleId.value ||
    isMutatingFavorite.value
  ) {
    return
  }

  try {
    if (
      favoriteStatus.value
        ?.favorited
    ) {
      await removeFavoriteMutation
        .mutateAsync({
          articleId: articleId.value,
          userKey: reactionUserKey.value
        })

      snackbar.add({
        text: '已取消收藏',
        color: 'success',
      })

      return
    }

    await addFavoriteMutation
      .mutateAsync({
        articleId: articleId.value,
        userKey: reactionUserKey.value
      })

    snackbar.add({
      text: '收藏成功',
      color: 'success',
    })
  } catch (error) {
    snackbar.addError(error)
  }
}
</script>

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

.comments {
  margin-top: 48px;

  &__header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 1.6rem;
    }

    p {
      margin: 6px 0 0;
      color:
        var(--color-text-secondary);
    }
  }

  &__count {
    flex-shrink: 0;
    color:
      var(--color-text-secondary);
    font-size: 0.9rem;
  }

  &__form {
    margin-bottom: 24px;
  }

  &__form-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 14px;

    span {
      color:
        var(--color-text-secondary);
      font-size: 0.85rem;
    }
  }

  &__login {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;

    p {
      margin: 0;
      color:
        var(--color-text-secondary);
    }
  }

  &__list {
    display: grid;
    gap: 16px;
  }

  &__state {
    margin-top: 16px;
  }
}

.comment {
  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
  }

  &__author {
    display: flex;
    align-items: center;
    gap: 12px;

    strong {
      display: block;
    }
  }

  &__time {
    margin-top: 3px;
    color:
      var(--color-text-secondary);
    font-size: 0.8rem;
  }

  &__content {
    margin:
      18px 0 0;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    line-height: 1.8;
  }
}

.article-reactions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 22px;

  .btn {
    min-width: 124px;
  }

  &__hint {
    margin: 10px 0 0;
    color:
      var(--color-text-secondary);
    font-size: 0.85rem;
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

  .comments {
    margin-top: 36px;

    &__header {
      align-items: flex-start;
      flex-direction: column;
      gap: 8px;
    }

    &__form-actions {
      align-items: stretch;
      flex-direction: column;

      :deep(.el-button) {
        width: 100%;
        margin-left: 0;
      }
    }

    &__login {
      align-items: stretch;
      flex-direction: column;

      :deep(.el-button) {
        width: 100%;
        margin-left: 0;
      }
    }
  }

  .comment {
    &__header {
      gap: 12px;
    }
  }

  .article-reactions {
    flex-direction: column;

    .btn {
      width: 100%;
    }
  }
}
</style>

<route lang="yaml">
meta:
  title: 文章內容
</route>