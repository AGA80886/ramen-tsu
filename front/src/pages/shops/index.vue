<template>
  <main class="shops-page">
    <section class="shops-hero">
      <div class="page-container shops-hero__inner">
        <div>
          <p class="shops-hero__eyebrow">
            RAMEN SHOPS
          </p>

          <h1>拉麵店家</h1>

          <p class="shops-hero__description">
            探索通過審核的拉麵店家，
            依照縣市、行政區與關鍵字快速找到想吃的拉麵。
          </p>
        </div>

        <RouterLink
          to="/shops/create"
          class="btn btn-primary shops-hero__action"
        >
          新增店家
        </RouterLink>
      </div>
    </section>

    <section class="page-container shops-content">
      <div class="shops-toolbar">
        <div class="shops-search">
          <label
            for="shop-keyword"
            class="form-label"
          >
            搜尋店家
          </label>

          <input
            id="shop-keyword"
            v-model="keyword"
            type="search"
            class="form-control"
            placeholder="搜尋店名、地址、地區"
          />
        </div>

        <div class="shops-filters">
          <div class="shops-filter-field">
            <label
              for="shop-city"
              class="form-label"
            >
              縣市
            </label>

            <select
              id="shop-city"
              v-model="selectedCity"
              class="form-select"
              @change="handleCityChange"
            >
              <option value="">
                全部縣市
              </option>

              <option
                v-for="city in cityOptions"
                :key="city"
                :value="city"
              >
                {{ city }}
              </option>
            </select>
          </div>

          <div class="shops-filter-field">
            <label
              for="shop-district"
              class="form-label"
            >
              行政區
            </label>

            <select
              id="shop-district"
              v-model="selectedDistrict"
              class="form-select"
              :disabled="!selectedCity"
            >
              <option value="">
                全部行政區
              </option>

              <option
                v-for="district in districtOptions"
                :key="district"
                :value="district"
              >
                {{ district }}
              </option>
            </select>
          </div>

          <button
            type="button"
            class="btn btn-outline-secondary shops-filter-reset"
            @click="resetFilters"
          >
            清除篩選
          </button>
        </div>

        <div class="shops-toolbar__result">
          找到
          <strong>
            {{ filteredShops.length }}
          </strong>
          間店家
        </div>
      </div>

      <div
        v-if="loading"
        class="shops-state"
      >
        店家資料讀取中...
      </div>

      <div
        v-else-if="error"
        class="shops-state shops-state--error"
      >
        {{ error }}
      </div>

      <div
        v-else-if="!hasShops"
        class="shops-empty"
      >
        <h2>
          目前沒有公開店家
        </h2>

        <p>
          尚未有通過審核的拉麵店家。
        </p>
      </div>

      <div
        v-else-if="!hasFilteredShops"
        class="shops-empty"
      >
        <h2>
          找不到符合條件的店家
        </h2>

        <p>
          請嘗試修改搜尋關鍵字或地區。
        </p>

        <button
          type="button"
          class="btn btn-outline-primary"
          @click="resetFilters"
        >
          清除篩選
        </button>
      </div>

      <div
        v-else
        class="shops-grid"
      >
        <article
          v-for="shop in filteredShops"
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
              class="shop-card__image-error"
            >
              暫無圖片
            </div>

            <span class="shop-card__location-tag">
              {{ shop.city }}
              {{ shop.district }}
            </span>
          </div>

          <div class="shop-card__body">
            <div class="shop-card__meta">
              <span>
                {{ shop.address }}
              </span>
            </div>

            <h2>
              {{ shop.name }}
            </h2>

            <p class="shop-card__summary">
              {{ shop.description }}
            </p>

            <RouterLink
              :to="`/shops/${shop.slug}`"
              class="shop-card__footer"
            >
              <span>
                查看店家
              </span>
            </RouterLink>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'

import { useShopStore } from '@/stores/shop'

const shopStore = useShopStore()

const {
  shops,
  loading,
  error,
} = storeToRefs(shopStore)

const selectedCity = ref('')
const selectedDistrict = ref('')
const keyword = ref('')

const cityOptions = computed(() => {
  const cities = shops.value
    .map(shop => shop.city)
    .filter(Boolean)

  return [...new Set(cities)].sort()
})

const districtOptions = computed(() => {
  if (!selectedCity.value) {
    return []
  }

  const districts = shops.value
    .filter(shop => shop.city === selectedCity.value)
    .map(shop => shop.district)
    .filter(Boolean)

  return [...new Set(districts)].sort()
})

const filteredShops = computed(() => {
  const normalizedKeyword = keyword.value.trim().toLowerCase()

  return shops.value.filter(shop => {
    const matchesCity =
      !selectedCity.value ||
      shop.city === selectedCity.value

    const matchesDistrict =
      !selectedDistrict.value ||
      shop.district === selectedDistrict.value

    const matchesKeyword =
      !normalizedKeyword ||
      [
        shop.name,
        shop.city,
        shop.district,
        shop.address,
      ].some(value =>
        value
          ?.toLowerCase()
          .includes(normalizedKeyword),
      )

    return (
      matchesCity &&
      matchesDistrict &&
      matchesKeyword
    )
  })
})

const hasShops = computed(() => {
  return shops.value.length > 0
})

const hasFilteredShops = computed(() => {
  return filteredShops.value.length > 0
})

const handleCityChange = () => {
  selectedDistrict.value = ''
}

const resetFilters = () => {
  selectedCity.value = ''
  selectedDistrict.value = ''
  keyword.value = ''
}

onMounted(async () => {
  await shopStore.getShops()
})
</script>


<style scoped lang="scss">
.shops-page {
  min-height: 100vh;
}

.page-container {
  width: min(
    1200px,
    calc(100% - 40px)
  );
  margin: 0 auto;
}

.shops-hero {
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

  &__action {
    flex-shrink: 0;
  }
}

.shops-content {
  padding-bottom: 72px;
}

.shops-toolbar {
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

.shops-search {
  width: min(100%, 480px);
  margin: 0 auto;

  .form-label {
    display: block;
    margin-bottom: 8px;
    text-align: center;
    font-weight: 600;
  }
}

.shops-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: end;
  justify-content: center;
}

.shops-filter-field {
  width: min(100%, 220px);
}

.shops-filter-reset {
  min-width: 110px;
}

.shops-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 24px;
}

.shop-card {
  overflow: hidden;
  border: 1px solid
    var(--color-border);
  border-radius: 16px;
  background: var(--color-background);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow:
      0 12px 30px
      rgb(0 0 0 / 10%);
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

  &__image-error {
    display: grid;
    width: 100%;
    height: 100%;
    place-items: center;
    color:
      var(--color-text-secondary);
  }

  &__location-tag {
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
    text-decoration: none;

    &:hover {
      color:
        var(--el-color-primary-light-3);
    }
  }
}

.shops-state,
.shops-empty {
  padding: 64px 24px;
  border: 1px solid
    var(--color-border);
  border-radius: 16px;
  text-align: center;
  background:
    var(--color-background);

  h2 {
    margin: 0;
    font-size: 1.25rem;
  }

  p {
    margin: 12px 0 0;
    color:
      var(--color-text-secondary);
  }

  .btn {
    margin-top: 20px;
  }
}

.shops-state {
  color:
    var(--color-text-secondary);

  &--error {
    color:
      var(--bs-danger);
  }
}

@media (max-width: 960px) {
  .shops-grid {
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

  .shops-hero {
    &__inner {
      flex-direction: column;
      align-items: stretch;
    }

    &__action {
      width: 100%;
    }
  }

  .shops-content {
    padding-bottom: 48px;
  }

  .shops-filters {
    align-items: stretch;
    flex-direction: column;
  }

  .shops-filter-field,
  .shops-filter-reset {
    width: 100%;
  }

  .shops-grid {
    grid-template-columns: 1fr;
  }

  .shop-card {
    &__body {
      min-height: auto;
    }
  }
}
</style>

<route lang="yaml">
meta:
  title: 拉麵店家
</route>
