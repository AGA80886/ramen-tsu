<template>
  <main class="shop-detail-page">
    <div class="page-container">
      <div class="shop-nav">
        <RouterLink
          to="/shops"
          class="btn btn-outline-secondary"
        >
          返回拉麵店家
        </RouterLink>
      </div>

      <div
        v-if="loading"
        class="shop-state"
      >
        店家資料讀取中...
      </div>

      <div
        v-else-if="error"
        class="shop-state shop-state--error"
      >
        <p>
          {{ error }}
        </p>

        <RouterLink
          to="/shops"
          class="btn btn-primary"
        >
          返回店家列表
        </RouterLink>
      </div>

      <article
        v-else-if="currentShop"
        class="shop-article"
      >
        <header class="shop-article__header">
          <div class="shop-article__tags">
            <span class="shop-tag">
              {{ currentShop.city }}
            </span>

            <span class="shop-tag">
              {{ currentShop.district }}
            </span>

            <span class="shop-tag shop-tag--approved">
              已通過審核
            </span>
          </div>

          <h1>
            {{ currentShop.name }}
          </h1>

          <p class="shop-article__summary">
            {{ currentShop.description }}
          </p>

          <div class="shop-article__meta">
            <span>
              地址：{{ fullAddress }}
            </span>

            <span v-if="currentShop.phone">
              電話：{{ currentShop.phone }}
            </span>
          </div>

          <div class="shop-reactions">
            <button
              type="button"
              class="btn"
              :class="
                isLiked
                  ? 'btn-primary'
                  : 'btn-outline-primary'
              "
              :disabled="isLikeLoading"
              @click="toggleLike"
            >
              {{
                isLiked
                  ? '♥ 已按讚'
                  : '♡ 按讚'
              }}
              {{ likeCount }}
            </button>

            <button
              type="button"
              class="btn"
              :class="
                isFavorited
                  ? 'btn-warning'
                  : 'btn-outline-secondary'
              "
              :disabled="isFavoriteLoading"
              @click="toggleFavorite"
            >
              {{
                isFavorited
                  ? '★ 已收藏'
                  : '☆ 收藏'
              }}
            </button>
          </div>

          <p
            v-if="!userStore.isLoggedIn"
            class="shop-reactions__hint"
          >
            登入會員後即可按讚與收藏店家。
          </p>
        </header>

        <div class="shop-article__cover">
          <img
            v-if="currentShop.coverImage"
            :src="currentShop.coverImage"
            :alt="currentShop.name"
            class="shop-article__cover-image"
          />

          <div
            v-else
            class="shop-article__image-error"
          >
            暫無封面圖片
          </div>
        </div>

        <section class="shop-card">
          <h2>
            店家介紹
          </h2>

          <div class="shop-card__content">
            {{ currentShop.description }}
          </div>
        </section>

        <section class="shop-card">
          <h2>
            店家資訊
          </h2>

          <dl class="shop-info-list">
            <div class="shop-info-list__item">
              <dt>
                地址
              </dt>

              <dd>
                {{ fullAddress }}
              </dd>
            </div>

            <div
              v-if="currentShop.phone"
              class="shop-info-list__item"
            >
              <dt>
                電話
              </dt>

              <dd>
                <a
                  :href="`tel:${currentShop.phone}`"
                >
                  {{ currentShop.phone }}
                </a>
              </dd>
            </div>

            <div
              v-if="currentShop.openingHours"
              class="shop-info-list__item"
            >
              <dt>
                營業時間
              </dt>

              <dd>
                {{ currentShop.openingHours }}
              </dd>
            </div>

            <div
              v-if="currentShop.website"
              class="shop-info-list__item"
            >
              <dt>
                官方網站
              </dt>

              <dd>
                <a
                  :href="currentShop.website"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  前往官方網站
                </a>
              </dd>
            </div>
          </dl>

          <div class="address-actions">
            <div class="address-actions__header">
              <h3>
                地址操作
              </h3>

              <p>
                可前往拉麵通地圖、使用 Google 地圖搜尋地址，
                或直接複製店家地址。
              </p>
            </div>

            <div class="address-actions__buttons">
              <RouterLink
                to="/map"
                class="btn btn-primary"
              >
                前往拉麵地圖
              </RouterLink>

              <a
                v-if="googleMapsSearchUrl"
                :href="googleMapsSearchUrl"
                class="btn btn-outline-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google 地圖搜尋地址
              </a>

              <button
                type="button"
                class="btn btn-outline-secondary"
                @click="copyAddress"
              >
                {{
                  addressCopied
                    ? '已複製地址'
                    : '複製地址'
                }}
              </button>
            </div>
          </div>
        </section>

        <section
          v-if="hasImages"
          class="shop-gallery"
        >
          <div class="shop-gallery__header">
            <div>
              <h2>
                店家照片
              </h2>

              <p>
                更多店家環境與餐點照片
              </p>
            </div>

            <span>
              {{ currentShop.images.length }}
              張
            </span>
          </div>

          <div class="shop-gallery__grid">
            <div
              v-for="(image, index) in currentShop.images"
              :key="`${image}-${index}`"
              class="shop-gallery__item"
            >
              <img
                :src="image"
                :alt="`${currentShop.name} 店家照片 ${index + 1}`"
                class="shop-gallery__image"
              />
            </div>
          </div>
        </section>
      </article>

      <div
        v-else
        class="shop-state"
      >
        <h1>
          找不到店家
        </h1>

        <p>
          這間店可能不存在，或尚未通過審核。
        </p>

        <RouterLink
          to="/shops"
          class="btn btn-primary"
        >
          返回店家列表
        </RouterLink>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import {
  computed,
  onMounted,
  ref,
} from 'vue'
import {
  storeToRefs,
} from 'pinia'
import {
  useRoute,
  useRouter,
} from 'vue-router'

import {
  useShopStore,
} from '@/stores/shop'
import {
  useUserStore,
} from '@/stores/user'
import {
  useSnackbarStore,
} from '@/stores/snackbar'

import {
  useAddShopFavoriteMutation,
  useAddShopLikeMutation,
  useMyShopFavoriteStatusQuery,
  useMyShopLikeStatusQuery,
  useRemoveShopFavoriteMutation,
  useRemoveShopLikeMutation,
  useShopLikeCountQuery,
} from '@/queries/shopReaction'

const route = useRoute('/shops/[slug]')
const router = useRouter()

const shopStore = useShopStore()
const userStore = useUserStore()
const snackbarStore = useSnackbarStore()

const {
  currentShop,
  loading,
  error,
} = storeToRefs(shopStore)

const slug = route.params.slug

const shopId = computed(() => {
  return currentShop.value?._id ?? ''
})

const {
  data: likeCountData,
} = useShopLikeCountQuery(
  () => shopId.value,
)

const {
  data: likeStatusData,
} = useMyShopLikeStatusQuery(
  () => shopId.value,
)

const {
  data: favoriteStatusData,
} = useMyShopFavoriteStatusQuery(
  () => shopId.value,
)

const addLikeMutation =
  useAddShopLikeMutation()

const removeLikeMutation =
  useRemoveShopLikeMutation()

const addFavoriteMutation =
  useAddShopFavoriteMutation()

const removeFavoriteMutation =
  useRemoveShopFavoriteMutation()

const likeCount = computed(() => {
  return likeCountData.value?.count ?? 0
})

const isLiked = computed(() => {
  return likeStatusData.value?.liked ?? false
})

const isFavorited = computed(() => {
  return (
    favoriteStatusData.value
      ?.favorited ?? false
  )
})

const isLikeLoading = computed(() => {
  return (
    addLikeMutation.isLoading.value ||
    removeLikeMutation.isLoading.value
  )
})

const isFavoriteLoading =
  computed(() => {
    return (
      addFavoriteMutation
        .isLoading.value ||
      removeFavoriteMutation
        .isLoading.value
    )
  })

const requireLogin = (): boolean => {
  if (userStore.isLoggedIn) {
    return true
  }

  snackbarStore.add({
    text: '請先登入會員',
    color: 'warning',
  })

  void router.push({
    path: '/login',
    query: {
      redirect: route.fullPath,
    },
  })

  return false
}

const toggleLike =
  async (): Promise<void> => {
    if (!requireLogin()) {
      return
    }

    if (!shopId.value) {
      return
    }

    try {
      if (isLiked.value) {
        await removeLikeMutation
          .mutateAsync(shopId.value)

        snackbarStore.add({
          text: '已取消店家按讚',
          color: 'success',
        })
      } else {
        await addLikeMutation
          .mutateAsync(shopId.value)

        snackbarStore.add({
          text: '店家按讚成功',
          color: 'success',
        })
      }
    } catch (error) {
      snackbarStore.addError(error)
    }
  }

const toggleFavorite =
  async (): Promise<void> => {
    if (!requireLogin()) {
      return
    }

    if (!shopId.value) {
      return
    }

    try {
      if (isFavorited.value) {
        await removeFavoriteMutation
          .mutateAsync(shopId.value)

        snackbarStore.add({
          text: '已取消收藏店家',
          color: 'success',
        })
      } else {
        await addFavoriteMutation
          .mutateAsync(shopId.value)

        snackbarStore.add({
          text: '收藏店家成功',
          color: 'success',
        })
      }
    } catch (error) {
      snackbarStore.addError(error)
    }
  }

const fullAddress = computed(() => {
  if (!currentShop.value) {
    return ''
  }

  return [
    currentShop.value.city,
    currentShop.value.district,
    currentShop.value.address,
  ]
    .filter(Boolean)
    .join(' ')
})

const hasImages = computed(() => {
  return Boolean(
    currentShop.value?.images?.length,
  )
})

const addressCopied = ref(false)

const googleMapsSearchUrl = computed(() => {
  if (!fullAddress.value) {
    return ''
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress.value)}`
})

const copyAddress = async (): Promise<void> => {
  if (!fullAddress.value) {
    return
  }

  try {
    await navigator.clipboard.writeText(
      fullAddress.value,
    )

    addressCopied.value = true

    window.setTimeout(() => {
      addressCopied.value = false
    }, 2000)
  } catch (error) {
    console.error(
      '複製地址失敗：',
      error,
    )
  }
}

onMounted(async () => {
  await shopStore.getShopBySlug(slug)
})
</script>

<style scoped lang="scss">
.shop-detail-page {
  padding: 40px 0 72px;
}

.page-container {
  width: min(
    920px,
    calc(100% - 40px)
  );
  margin: 0 auto;
}

.shop-nav {
  margin-bottom: 28px;
}

.shop-article {
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
    white-space: pre-wrap;
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
    background:
      var(--el-fill-color-light);
  }

  &__cover-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  &__image-error {
    display: grid;
    width: 100%;
    height: 100%;
    place-items: center;
    color:
      var(--color-text-secondary);
  }
}


.shop-reactions {
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

.shop-tag {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 4px 10px;
  border: 1px solid
    var(--color-border);
  border-radius: 999px;
  background:
    var(--color-surface);
  color:
    var(--color-text-secondary);
  font-size: 0.82rem;
  font-weight: 600;

  &--approved {
    border-color:
      var(--el-color-success-light-5);
    background:
      var(--el-color-success-light-9);
    color:
      var(--el-color-success);
  }
}

.shop-card {
  margin-bottom: 32px;
  padding: 24px;
  border: 1px solid
    var(--color-border);
  border-radius:
    var(--radius-md);
  background:
    var(--color-surface);

  h2 {
    margin: 0 0 18px;
    font-size: 1.4rem;
  }

  &__content {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    font-size: 1.05rem;
    line-height: 2;
  }

  &__actions {
    display: flex;
    justify-content: flex-start;
    margin-top: 20px;
  }
}

.shop-info-list {
  margin: 0;

  &__item {
    display: grid;
    grid-template-columns:
      minmax(90px, 140px) 1fr;
    gap: 20px;
    padding: 16px 0;
    border-bottom: 1px solid
      var(--color-border);

    &:first-child {
      padding-top: 0;
    }

    &:last-child {
      padding-bottom: 0;
      border-bottom: 0;
    }

    dt {
      color:
        var(--color-text-secondary);
      font-size: 0.9rem;
      font-weight: 600;
    }

    dd {
      margin: 0;
      overflow-wrap: anywhere;
    }

    a {
      color:
        var(--el-color-primary);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.address-actions {
  padding-top: 22px;
  margin-top: 22px;
  border-top: 1px solid
    var(--color-border);

  &__header {
    margin-bottom: 16px;

    h3 {
      margin: 0;
      font-size: 1.05rem;
    }

    p {
      margin: 6px 0 0;
      color:
        var(--color-text-secondary);
      font-size: 0.9rem;
      line-height: 1.7;
    }
  }

  &__buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
}

.shop-gallery {
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

    > span {
      flex-shrink: 0;
      color:
        var(--color-text-secondary);
      font-size: 0.9rem;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  &__item {
    overflow: hidden;
    aspect-ratio: 4 / 3;
    border-radius: 14px;
    background:
      var(--el-fill-color-light);
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition:
      transform 0.2s ease;

    &:hover {
      transform: scale(1.03);
    }
  }
}

.shop-state {
  padding: 64px 24px;
  border: 1px solid
    var(--color-border);
  border-radius:
    var(--radius-md);
  background:
    var(--color-surface);
  text-align: center;

  h1 {
    margin: 0;
    font-size: 1.5rem;
  }

  p {
    margin: 12px 0 20px;
    color:
      var(--color-text-secondary);
  }

  &--error {
    color:
      var(--bs-danger);
  }
}

@media (max-width: 640px) {
  .shop-detail-page {
    padding: 28px 0 48px;
  }

  .page-container {
    width: min(
      100%,
      calc(100% - 32px)
    );
  }

  .shop-article {
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
  }

  .shop-reactions {
    flex-direction: column;

    .btn {
      width: 100%;
    }
  }

  .shop-card {
    padding: 20px;

    &__content {
      font-size: 1rem;
      line-height: 1.9;
    }

    &__actions {
      .btn {
        width: 100%;
      }
    }
  }

  .shop-info-list {
    &__item {
      grid-template-columns: 1fr;
      gap: 6px;
    }
  }

  .address-actions {
    &__buttons {
      flex-direction: column;

      .btn {
        width: 100%;
      }
    }
  }

  .shop-gallery {
    margin-top: 36px;

    &__header {
      align-items: flex-start;
      flex-direction: column;
      gap: 8px;
    }

    &__grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>

<route lang="yaml">
meta:
  title: 店家內容
</route>
