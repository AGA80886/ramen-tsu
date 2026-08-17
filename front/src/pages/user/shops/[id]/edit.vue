<template>
  <main class="edit-shop-page">
    <div class="page-container">
      <header class="page-header">
        <div>
          <p class="eyebrow">
            RAMEN SHOPS
          </p>

          <h1>編輯拉麵店家</h1>

          <p>
            修改店家資料後，店家會重新進入審核流程。
          </p>
        </div>

        <RouterLink
          to="/user/shops"
          class="btn btn-outline-secondary"
        >
          ← 返回我發表的店家
        </RouterLink>
      </header>

      <div
        v-if="initializing"
        class="page-state"
      >
        店家資料讀取中...
      </div>

      <div
        v-else-if="loadError"
        class="page-state page-state--error"
      >
        <p>
          {{ loadError }}
        </p>

        <RouterLink
          to="/user/shops"
          class="btn btn-primary"
        >
          返回我的店家
        </RouterLink>
      </div>

      <AppCard v-else>
        <el-form
          label-position="top"
          @submit.prevent="submit"
        >
          <section class="form-section">
            <div class="form-section__header">
              <h2>基本資料</h2>

              <p>
                修改店家名稱、網址識別與介紹。
              </p>
            </div>

            <el-form-item
              label="店家名稱"
              required
            >
              <el-input
                v-model="form.name"
                maxlength="100"
                show-word-limit
                placeholder="請輸入店家名稱"
              />
            </el-form-item>

            <el-form-item
              label="店家網址 Slug"
              required
            >
              <el-input
                v-model="form.slug"
                maxlength="120"
                placeholder="例如：ichiran-taipei"
              />

              <p class="field-help">
                修改 Slug 會影響公開店家網址。
              </p>
            </el-form-item>

            <el-form-item
              label="店家介紹"
              required
            >
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="6"
                maxlength="5000"
                show-word-limit
                placeholder="介紹店家特色、湯頭、麵體或推薦餐點"
              />
            </el-form-item>
          </section>

          <section class="form-section">
            <div class="form-section__header">
              <h2>地址資訊</h2>

              <p>
                修改縣市、行政區與地址。
              </p>
            </div>

            <div class="form-grid">
              <el-form-item
                label="縣市"
                required
              >
                <el-input
                  v-model="form.city"
                  placeholder="例如：台北市"
                />
              </el-form-item>

              <el-form-item
                label="行政區"
                required
              >
                <el-input
                  v-model="form.district"
                  placeholder="例如：中正區"
                />
              </el-form-item>
            </div>

            <el-form-item
              label="地址"
              required
            >
              <el-input
                v-model="form.address"
                placeholder="例如：台北市中正區忠孝西路一段..."
              />
            </el-form-item>
          </section>

          <section class="form-section">
            <div class="form-section__header">
              <h2>聯絡與營業資訊</h2>

              <p>
                可依店家最新資訊修改。
              </p>
            </div>

            <div class="form-grid">
              <el-form-item label="電話">
                <el-input
                  v-model="form.phone"
                  placeholder="例如：02-12345678"
                />
              </el-form-item>

              <el-form-item label="營業時間">
                <el-input
                  v-model="form.openingHours"
                  placeholder="例如：11:00 - 21:00"
                />
              </el-form-item>
            </div>

            <el-form-item label="官方網站">
              <el-input
                v-model="form.website"
                placeholder="https://example.com"
              />
            </el-form-item>
          </section>

          <section class="form-section">
            <div class="form-section__header">
              <h2>店家封面圖片</h2>

              <p>
                可保留目前封面，也可以拖曳或選擇新的 JPG / PNG 圖片取代。
              </p>
            </div>

            <div
              v-if="form.coverImage && fileRecords.length === 0"
              class="current-cover"
            >
              <p class="current-cover__label">
                目前封面
              </p>

              <img
                :src="form.coverImage"
                :alt="`${form.name || '店家'}目前封面`"
                class="current-cover__image"
              />
            </div>

            <el-form-item label="更換封面圖片">
              <vue-file-agent
                ref="fileAgent"
                v-model="fileRecords"
                v-model:raw-model-value="rawFileRecords"
                accept="image/png,image/jpeg"
                deletable
                :error-text="{
                  type: '檔案類型無效',
                  size: '圖片大小不可超過 2MB',
                }"
                help-text="選擇圖片或將圖片拖曳到此處"
                :max-files="1"
                max-size="2MB"
              />
            </el-form-item>

            <p class="field-help">
              如果不選擇新圖片，會保留目前封面。
            </p>
          </section>

          <div class="submit-note">
            <el-alert
              title="儲存後會重新進入待審核狀態"
              description="管理員重新審核通過後，修改內容才會再次公開。"
              type="warning"
              :closable="false"
              show-icon
            />
          </div>

          <div
            v-if="submitError"
            class="submit-error"
          >
            <el-alert
              :title="submitError"
              type="error"
              :closable="false"
              show-icon
            />
          </div>

          <div class="form-actions">
            <AppButton
              @click="router.push('/user/shops')"
            >
              取消
            </AppButton>

            <AppButton
              type="primary"
              :loading="shopStore.loading"
              @click="submit"
            >
              儲存修改
            </AppButton>
          </div>
        </el-form>
      </AppCard>
    </div>
  </main>
</template>

<script setup lang="ts">
definePage({
  meta: {
    access: 'authenticated',
  },
})

import {
  onMounted,
  reactive,
  ref,
} from 'vue'
import {
  useRoute,
  useRouter,
} from 'vue-router'

import { useShopStore } from '@/stores/shop'

import type {
  UpdateShopData,
} from '@/types/shop'

interface FileRecord {
  file?: File
  error?: unknown
}

const route =
  useRoute('/user/shops/[id]/edit')

const router = useRouter()
const shopStore = useShopStore()

const shopId = route.params.id

const initializing = ref(true)
const loadError = ref('')
const submitError = ref('')

const fileAgent = ref()
const fileRecords =
  ref<FileRecord[]>([])
const rawFileRecords = ref<File[]>([])

const form = reactive<UpdateShopData>({
  name: '',
  slug: '',
  description: '',

  city: '',
  district: '',
  address: '',

  phone: '',
  website: '',
  openingHours: '',

  coverImage: '',
  images: [],
})

function validateForm(): boolean {
  submitError.value = ''

  if (!form.name?.trim()) {
    submitError.value =
      '請輸入店家名稱'
    return false
  }

  if (!form.slug?.trim()) {
    submitError.value =
      '請輸入店家 Slug'
    return false
  }

  if (!form.description?.trim()) {
    submitError.value =
      '請輸入店家介紹'
    return false
  }

  if (
    !form.city?.trim() ||
    !form.district?.trim() ||
    !form.address?.trim()
  ) {
    submitError.value =
      '請完整填寫地址資訊'
    return false
  }

  if (fileRecords.value[0]?.error) {
    submitError.value =
      '封面圖片格式或大小不符合規定'
    return false
  }

  return true
}

const loadShop = async () => {
  initializing.value = true
  loadError.value = ''
  submitError.value = ''

  try {
    const shop =
      await shopStore.getMyShopById(
        shopId,
      )

    form.name = shop.name
    form.slug = shop.slug
    form.description =
      shop.description

    form.city = shop.city
    form.district = shop.district
    form.address = shop.address

    form.phone = shop.phone ?? ''
    form.website =
      shop.website ?? ''
    form.openingHours =
      shop.openingHours ?? ''

    form.coverImage =
      shop.coverImage ?? ''

    form.images = [
      ...(shop.images ?? []),
    ]
  } catch (error) {
    console.error(
      '載入店家資料失敗：',
      error,
    )

    loadError.value =
      shopStore.error ??
      '載入店家資料失敗'
  } finally {
    initializing.value = false
  }
}

const submit = async () => {
  if (
    shopStore.loading ||
    !validateForm()
  ) {
    return
  }

  const image =
    fileRecords.value[0]?.file

  const data: UpdateShopData = {
    name: form.name?.trim(),
    slug: form.slug?.trim(),
    description:
      form.description?.trim(),

    city: form.city?.trim(),
    district:
      form.district?.trim(),
    address: form.address?.trim(),

    phone:
      form.phone?.trim() ?? '',
    website:
      form.website?.trim() ?? '',
    openingHours:
      form.openingHours?.trim() ?? '',

    coverImage:
      form.coverImage ?? '',
    images: [
      ...(form.images ?? []),
    ],
  }

  if (image) {
    data.image = image
  }

  submitError.value = ''

  try {
    await shopStore.updateShop(
      shopId,
      data,
    )

    await router.push(
      '/user/shops',
    )
  } catch (error) {
    console.error(
      '修改店家失敗：',
      error,
    )

    submitError.value =
      shopStore.error ??
      '修改店家失敗'
  }
}

onMounted(() => {
  void loadShop()
})
</script>

<style scoped lang="scss">
.edit-shop-page {
  padding: 48px 0 72px;
}

.page-container {
  width: min(
    860px,
    calc(100% - 40px)
  );
  margin: 0 auto;
}

.page-header {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 28px;

  h1 {
    margin: 4px 0 12px;
    font-size: 2rem;
  }

  > div > p:not(.eyebrow) {
    margin: 0;
    line-height: 1.8;
    color:
      var(--color-text-secondary);
  }
}

.eyebrow {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.16em;
}

.form-section {
  & + & {
    padding-top: 28px;
    margin-top: 28px;
    border-top: 1px solid
      var(--color-border);
  }

  &__header {
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 1.25rem;
    }

    p {
      margin: 6px 0 0;
      color:
        var(--color-text-secondary);
      line-height: 1.7;
    }
  }
}

.form-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.field-help {
  margin: 6px 0 0;
  color:
    var(--color-text-secondary);
  font-size: 0.85rem;
}

.current-cover {
  margin-bottom: 20px;

  &__label {
    margin: 0 0 8px;
    color:
      var(--color-text-secondary);
    font-size: 0.9rem;
    font-weight: 600;
  }

  &__image {
    display: block;
    width: min(100%, 520px);
    aspect-ratio: 16 / 9;
    object-fit: cover;
    border: 1px solid
      var(--color-border);
    border-radius: 14px;
  }
}

.submit-note {
  margin: 24px 0;
}

.submit-error {
  margin-bottom: 24px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;

  :deep(.el-button) {
    margin-left: 0;
  }
}

.page-state {
  padding: 64px 24px;
  border: 1px solid
    var(--color-border);
  border-radius:
    var(--radius-md);
  background:
    var(--color-surface);
  text-align: center;

  p {
    margin: 0 0 20px;
  }

  &--error {
    color:
      var(--bs-danger);
  }
}

@media (max-width: 640px) {
  .edit-shop-page {
    padding: 32px 0 48px;
  }

  .page-container {
    width: min(
      100%,
      calc(100% - 32px)
    );
  }

  .page-header {
    align-items: stretch;
    flex-direction: column;

    .btn {
      width: 100%;
    }
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .form-actions {
    flex-direction: column-reverse;

    :deep(.el-button) {
      width: 100%;
    }
  }
}
</style>
