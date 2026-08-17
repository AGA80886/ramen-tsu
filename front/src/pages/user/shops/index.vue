<template>
  <main class="my-shops-page">
    <section class="my-shops-hero">
      <div class="page-container my-shops-hero__inner">
        <div>
          <p class="eyebrow">
            MY RAMEN SHOPS
          </p>

          <h1>
            我的新增店家
          </h1>

          <p class="my-shops-hero__description">
            管理你建立的拉麵店家、查看審核狀態，
            並在需要時編輯或刪除資料。
          </p>
        </div>
      </div>
    </section>

    <section class="page-container my-shops-content">
      <div class="shops-overview">
        <div class="shops-overview__item">
          <strong>
            {{ myShops.length }}
          </strong>

          <span>
            全部店家
          </span>
        </div>

        <div class="shops-overview__item">
          <strong>
            {{ pendingCount }}
          </strong>

          <span>
            審核中
          </span>
        </div>

        <div class="shops-overview__item">
          <strong>
            {{ approvedCount }}
          </strong>

          <span>
            已通過
          </span>
        </div>

        <div class="shops-overview__item">
          <strong>
            {{ rejectedCount }}
          </strong>

          <span>
            未通過
          </span>
        </div>
      </div>

      <div
        v-if="loading"
        class="page-state"
      >
        店家資料讀取中...
      </div>

      <div
        v-else-if="error"
        class="page-state page-state--error"
      >
        {{ error }}
      </div>

      <div
        v-if="deleteError"
        class="page-state page-state--error page-state--compact"
      >
        {{ deleteError }}
      </div>

      <div
        v-else-if="!hasShops && !loading && !error"
        class="empty-state"
      >
        <div class="empty-state__icon">
          🍜
        </div>

        <h2>
          尚未建立任何店家
        </h2>

        <p>
          建立你的第一間拉麵店家，送出後將進入審核流程。
        </p>

        <RouterLink
          to="/user/shops/create"
          class="btn btn-primary"
        >
          新增第一間店家
        </RouterLink>
      </div>

      <div
        v-else-if="hasShops && !loading && !error"
        class="shops-list"
      >
        <article
          v-for="shop in myShops"
          :key="shop._id"
          class="shop-card"
        >
          <div class="shop-card__cover">
            <img
              v-if="shop.coverImage"
              :src="shop.coverImage"
              :alt="shop.name"
              class="shop-card__image"
            />

            <div
              v-else
              class="shop-card__placeholder"
            >
              暫無圖片
            </div>

            <span
              class="shop-card__status"
              :class="statusModifier[shop.status]"
            >
              {{ statusText[shop.status] }}
            </span>
          </div>

          <div class="shop-card__content">
            <div class="shop-card__meta">
              <span>
                {{ shop.city }}
                {{ shop.district }}
              </span>

              <span>
                建立於
                {{ formatDate(shop.createdAt) }}
              </span>
            </div>

            <h2 class="shop-card__title">
              {{ shop.name }}
            </h2>

            <p class="shop-card__address">
              {{ shop.address }}
            </p>

            <p class="shop-card__description">
              {{ shop.description }}
            </p>

            <div class="shop-card__details">
              <span v-if="shop.phone">
                電話：{{ shop.phone }}
              </span>

              <span v-if="shop.openingHours">
                營業時間：{{ shop.openingHours }}
              </span>
            </div>

            <div class="shop-card__footer">
              <div class="shop-card__actions">
                <RouterLink
                  :to="`/user/shops/${shop._id}/edit`"
                  class="btn btn-outline-primary"
                >
                  編輯
                </RouterLink>

                <RouterLink
                  v-if="shop.status === 'approved'"
                  :to="`/shops/${shop.slug}`"
                  class="btn btn-outline-secondary"
                >
                  查看公開頁
                </RouterLink>

                <button
                  type="button"
                  class="btn btn-outline-danger"
                  :disabled="deletingId === shop._id"
                  @click="handleDelete(shop._id, shop.name)"
                >
                  {{
                    deletingId === shop._id
                      ? '刪除中...'
                      : '刪除'
                  }}
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
definePage({
  meta: {
    access: 'authenticated',
  },
})

import {
  computed,
  onMounted,
  ref,
} from 'vue'
import { storeToRefs } from 'pinia'

import { useShopStore } from '@/stores/shop'

import type {
  ShopStatus,
} from '@/types/shop'

const shopStore = useShopStore()

const {
  myShops,
  loading,
  error,
} = storeToRefs(shopStore)

const statusText: Record<
  ShopStatus,
  string
> = {
  draft: '草稿',
  pending: '審核中',
  approved: '已通過',
  rejected: '未通過',
}

const statusModifier: Record<
  ShopStatus,
  string
> = {
  draft: 'shop-card__status--draft',
  pending: 'shop-card__status--pending',
  approved: 'shop-card__status--approved',
  rejected: 'shop-card__status--rejected',
}

const hasShops = computed(() => {
  return myShops.value.length > 0
})

const pendingCount = computed(() => {
  return myShops.value.filter(
    shop => shop.status === 'pending',
  ).length
})

const approvedCount = computed(() => {
  return myShops.value.filter(
    shop => shop.status === 'approved',
  ).length
})

const rejectedCount = computed(() => {
  return myShops.value.filter(
    shop => shop.status === 'rejected',
  ).length
})

const formatDate = (value: string) => {
  return new Date(value).toLocaleDateString(
    'zh-TW',
    {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    },
  )
}

onMounted(async () => {
  try {
    await shopStore.getMyShops()
  } catch (error) {
    console.error(
      '取得會員店家列表失敗：',
      error,
    )
  }
})

const deletingId =
  ref<string | null>(null)

const deleteError = ref('')

const handleDelete = async (
  id: string,
  name: string,
) => {
  const confirmed = window.confirm(
    `確定要刪除「${name}」嗎？\n\n刪除後將無法復原。`,
  )

  if (!confirmed) {
    return
  }

  deleteError.value = ''
  deletingId.value = id

  try {
    await shopStore.deleteShop(id)
  } catch (error) {
    console.error(
      '刪除店家失敗：',
      error,
    )

    deleteError.value =
      shopStore.error ??
      '刪除店家失敗'
  } finally {
    deletingId.value = null
  }
}
</script>

<style scoped lang="scss">
.my-shops-page {
  min-height: 100vh;
}

.page-container {
  width: min(
    1180px,
    calc(100% - 40px)
  );
  margin: 0 auto;
}

.my-shops-hero {
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

  &__action {
    flex-shrink: 0;
  }
}

.eyebrow {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.16em;
}

.my-shops-content {
  padding-bottom: 72px;
}

.shops-overview {
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

.shops-list {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.shop-card {
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
    transform: translateY(-3px);
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
    min-height: 310px;
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

  &__address {
    margin: 8px 0 0;
    color:
      var(--color-text-secondary);
    font-size: 0.92rem;
  }

  &__description {
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

  &__details {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 14px;
    color:
      var(--color-text-secondary);
    font-size: 0.85rem;
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

  &--compact {
    padding: 18px 20px;
    margin-bottom: 20px;
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
  .shops-overview {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .shops-list {
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

  .my-shops-hero {
    padding: 40px 0 32px;

    &__inner {
      align-items: stretch;
      flex-direction: column;
    }

    &__action {
      width: 100%;
    }
  }

  .my-shops-content {
    padding-bottom: 48px;
  }

  .shops-overview {
    grid-template-columns: 1fr 1fr;
    gap: 10px;

    &__item {
      min-height: 84px;
      padding: 14px;
    }
  }

  .shop-card {
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
