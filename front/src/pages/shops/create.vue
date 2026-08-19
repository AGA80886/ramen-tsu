<template>
  <main class="create-shop-page">
    <div class="page-container">
      <header class="page-header">
        <div>
          <p class="eyebrow">
            RAMEN SHOPS
          </p>

          <h1>新增店家</h1>

          <p>
            分享您推薦的拉麵店家。
            店家送出後將由管理員審核，通過後才會公開顯示。
          </p>
        </div>
      </header>

      <AppCard>
        <el-form
          label-position="top"
          @submit.prevent="submit"
        >
          <section class="form-section">
            <div class="form-section__header">
              <h2>基本資料</h2>
              <p>填寫店家名稱、網址識別與介紹。</p>
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
                建議使用英文小寫、數字與連字號。
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
              <p>填寫縣市、行政區與地址。</p>
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
              <p>以下欄位可依店家實際資料填寫。</p>
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
                和拉麵論壇相同，可點擊選擇圖片或直接拖曳圖片到上傳區。
              </p>
            </div>

            <el-form-item
              label="封面圖片"
              required
            >
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
          </section>

          <div class="submit-note">
            <el-alert
              title="店家送出後會進入待審核狀態"
              description="管理員審核通過後，店家才會出現在公開店家列表。"
              type="info"
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
              返回我的店家
            </AppButton>

            <AppButton
              type="primary"
              :loading="shopStore.loading"
              @click="submit"
            >
              送出審核
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
  reactive,
  ref,
} from 'vue'
import { useRouter } from 'vue-router'

import { useShopStore } from '@/stores/shop'

import type {
  CreateShopData,
} from '@/types/shop'

interface FileRecord {
  file?: File
  error?: unknown
}

const router = useRouter()
const shopStore = useShopStore()

const fileAgent = ref()
const fileRecords = ref<FileRecord[]>([])
const rawFileRecords = ref<File[]>([])
const submitError = ref('')

const form = reactive<
  Omit<CreateShopData, 'image'>
>({
  name: '',
  slug: '',
  description: '',

  city: '',
  district: '',
  address: '',

  phone: '',
  website: '',
  openingHours: '',

  images: [],
})

function validateForm(): boolean {
  submitError.value = ''

  if (!form.name.trim()) {
    submitError.value = '請輸入店家名稱'
    return false
  }

  if (!form.slug.trim()) {
    submitError.value = '請輸入店家 Slug'
    return false
  }

  if (!form.description.trim()) {
    submitError.value = '請輸入店家介紹'
    return false
  }

  if (
    !form.city.trim() ||
    !form.district.trim() ||
    !form.address.trim()
  ) {
    submitError.value = '請完整填寫地址資訊'
    return false
  }

  if (fileRecords.value[0]?.error) {
    submitError.value =
      '封面圖片格式或大小不符合規定'
    return false
  }

  if (fileRecords.value.length === 0) {
    submitError.value = '請選擇店家封面圖片'
    return false
  }

  return true
}

async function submit(): Promise<void> {
  if (
    shopStore.loading ||
    !validateForm()
  ) {
    return
  }

  const image =
    fileRecords.value[0]?.file

  if (!image) {
    submitError.value = '請選擇店家封面圖片'
    return
  }

  const data: CreateShopData = {
    name: form.name.trim(),
    slug: form.slug.trim(),
    description: form.description.trim(),
    city: form.city.trim(),
    district: form.district.trim(),
    address: form.address.trim(),
    phone: form.phone?.trim() ?? '',
    website: form.website?.trim() ?? '',
    openingHours:
      form.openingHours?.trim() ?? '',
    images: [],
    image,
  }

  try {
    await shopStore.createShop(data)
    await router.push('/user/shops')
  } catch (error) {
    console.error(
      '建立店家失敗：',
      error,
    )

    submitError.value =
      shopStore.error ??
      '建立店家失敗'
  }
}
</script>

<style scoped lang="scss">
.create-shop-page {
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

@media (max-width: 640px) {
  .create-shop-page {
    padding: 32px 0 48px;
  }

  .page-container {
    width: min(
      100%,
      calc(100% - 32px)
    );
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

<route lang="yaml">
meta:
  title: 新增店家
  access: authenticated
</route>
