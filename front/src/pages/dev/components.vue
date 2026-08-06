<template>
  <main class="components-showcase">
    <!-- 頁首 -->
    <header class="showcase-header">
      <div>
        <p class="showcase-header__eyebrow">
          Ramen Tsu Design System
        </p>

        <h1 class="showcase-header__title">
          共用 UI 元件
        </h1>

        <p class="showcase-header__description">
          集中展示拉麵通目前提供的共用元件，
          用來確認元件外觀、互動狀態、響應式排版及深色模式。
        </p>
      </div>
    </header>

    <!-- AppButton -->
    <section
      id="app-button"
      class="showcase-section"
    >
      <div class="section-heading">
        <div>
          <h2>AppButton</h2>
          <p>
            統一處理按鈕類型、尺寸、狀態及互動行為。
          </p>
        </div>

        <ElTag type="primary">
          Base Component
        </ElTag>
      </div>

      <AppCard title="按鈕類型">
        <div class="component-row">
          <AppButton>
            主要按鈕
          </AppButton>

          <AppButton type="success">
            成功按鈕
          </AppButton>

          <AppButton type="warning">
            警告按鈕
          </AppButton>

          <AppButton type="danger">
            危險按鈕
          </AppButton>

          <AppButton type="info">
            資訊按鈕
          </AppButton>
        </div>
      </AppCard>

      <AppCard title="按鈕狀態">
        <div class="component-row">
          <AppButton plain>
            Plain
          </AppButton>

          <AppButton round>
            Round
          </AppButton>

          <AppButton disabled>
            Disabled
          </AppButton>

          <AppButton loading>
            Loading
          </AppButton>

          <AppButton
            type="success"
            @click="buttonClickCount += 1"
          >
            點擊測試
          </AppButton>
        </div>

        <p class="component-result">
          按鈕已點擊：
          <strong>{{ buttonClickCount }}</strong>
          次
        </p>
      </AppCard>
    </section>

    <!-- AppCard -->
    <section
      id="app-card"
      class="showcase-section"
    >
      <div class="section-heading">
        <div>
          <h2>AppCard</h2>
          <p>
            統一卡片的標題、操作區域、邊框及內容樣式。
          </p>
        </div>

        <ElTag type="primary">
          Base Component
        </ElTag>
      </div>

      <div class="card-grid">
        <AppCard title="基本卡片">
          <p>
            這是一張使用預設標題的共用卡片。
          </p>
        </AppCard>

        <AppCard>
          <template #header>
            <div>
              <strong>自訂 Header</strong>
              <p class="card-subtitle">
                使用具名插槽建立標題內容
              </p>
            </div>
          </template>

          <template #actions>
            <AppButton
              size="small"
              plain
            >
              編輯
            </AppButton>
          </template>

          <p>
            AppCard 支援 header、actions 及預設內容插槽。
          </p>
        </AppCard>

        <AppCard
          title="Hover Shadow"
          shadow="hover"
        >
          <p>
            將滑鼠移到卡片上，可以確認陰影效果。
          </p>
        </AppCard>
      </div>
    </section>

    <!-- AppDialog -->
    <section
      id="app-dialog"
      class="showcase-section"
    >
      <div class="section-heading">
        <div>
          <h2>AppDialog</h2>
          <p>
            統一對話框標題、確認按鈕、取消按鈕及載入狀態。
          </p>
        </div>

        <ElTag type="warning">
          Feedback
        </ElTag>
      </div>

      <AppCard title="對話框測試">
        <div class="component-row">
          <AppButton @click="basicDialogVisible = true">
            開啟基本對話框
          </AppButton>

          <AppButton
            type="danger"
            @click="deleteDialogVisible = true"
          >
            開啟刪除確認
          </AppButton>
        </div>

        <p
          v-if="dialogResult"
          class="component-result"
        >
          最近操作：{{ dialogResult }}
        </p>
      </AppCard>
    </section>

    <!-- AppLoading -->
    <section
      id="app-loading"
      class="showcase-section"
    >
      <div class="section-heading">
        <div>
          <h2>AppLoading</h2>
          <p>
            在保留原有內容的情況下，顯示區塊載入狀態。
          </p>
        </div>

        <ElTag type="warning">
          Feedback
        </ElTag>
      </div>

      <AppCard title="載入狀態測試">
        <div class="loading-toolbar">
          <AppButton @click="toggleLoading">
            {{ loading ? '停止載入' : '開始載入' }}
          </AppButton>
        </div>

        <AppLoading
          :loading="loading"
          text="正在載入拉麵資料..."
          min-height="220px"
        >
          <div class="loading-demo">
            <div class="loading-demo__icon">
              🍜
            </div>

            <h3>豚骨拉麵</h3>

            <p>
              濃郁豚骨湯頭，搭配叉燒、溏心蛋及青蔥。
            </p>
          </div>
        </AppLoading>
      </AppCard>
    </section>

    <!-- AppEmpty -->
    <section
      id="app-empty"
      class="showcase-section"
    >
      <div class="section-heading">
        <div>
          <h2>AppEmpty</h2>
          <p>
            顯示搜尋結果、收藏、購物車等無資料狀態。
          </p>
        </div>

        <ElTag type="info">
          Data Display
        </ElTag>
      </div>

      <AppCard title="空資料狀態">
        <AppEmpty description="目前沒有符合條件的拉麵店">
          <AppButton @click="emptyActionCount += 1">
            重新搜尋
          </AppButton>
        </AppEmpty>

        <p
          v-if="emptyActionCount > 0"
          class="component-result component-result--center"
        >
          已執行重新搜尋 {{ emptyActionCount }} 次
        </p>
      </AppCard>
    </section>

    <!-- AppPagination -->
    <section
      id="app-pagination"
      class="showcase-section"
    >
      <div class="section-heading">
        <div>
          <h2>AppPagination</h2>
          <p>
            統一處理目前頁數、每頁筆數及換頁事件。
          </p>
        </div>

        <ElTag type="info">
          Navigation
        </ElTag>
      </div>

      <AppCard title="分頁測試">
        <div class="pagination-demo">
          <p>
            目前頁數：
            <strong>{{ currentPage }}</strong>
          </p>

          <p>
            每頁筆數：
            <strong>{{ pageSize }}</strong>
          </p>

          <p>
            顯示範圍：
            <strong>
              {{ paginationStart }}－{{ paginationEnd }}
            </strong>
          </p>
        </div>

        <AppPagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="totalItems"
          @change="handlePageChange"
        />
      </AppCard>
    </section>

    <!-- Dialog 實例 -->
    <AppDialog
      v-model="basicDialogVisible"
      title="基本對話框"
      confirm-text="確認"
      @confirm="handleBasicDialogConfirm"
      @cancel="dialogResult = '取消基本對話框'"
    >
      <p>
        這是 AppDialog 的基本內容。
      </p>

      <p>
        可以透過預設插槽放入表單、說明文字或其他元件。
      </p>
    </AppDialog>

    <AppDialog
      v-model="deleteDialogVisible"
      title="刪除拉麵資料"
      confirm-text="確認刪除"
      confirm-type="danger"
      :confirm-loading="deleteLoading"
      @confirm="handleDeleteConfirm"
      @cancel="dialogResult = '取消刪除操作'"
    >
      <ElAlert
        title="刪除後將無法復原"
        type="warning"
        :closable="false"
        show-icon
      />

      <p class="dialog-description">
        確定要刪除這筆拉麵資料嗎？
      </p>
    </AppDialog>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import {
  AppButton,
  AppCard,
  AppDialog,
  AppEmpty,
  AppLoading,
  AppPagination,
} from '@/components/common'

const buttonClickCount = ref(0)
const emptyActionCount = ref(0)

const basicDialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const deleteLoading = ref(false)
const dialogResult = ref('')

const loading = ref(false)

const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(128)

const paginationStart = computed(() => {
  if (totalItems.value === 0) {
    return 0
  }

  return (currentPage.value - 1) * pageSize.value + 1
})

const paginationEnd = computed(() => {
  return Math.min(
    currentPage.value * pageSize.value,
    totalItems.value,
  )
})

function handleBasicDialogConfirm() {
  dialogResult.value = '確認基本對話框'
  basicDialogVisible.value = false
}

async function handleDeleteConfirm() {
  deleteLoading.value = true

  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, 800)
  })

  deleteLoading.value = false
  deleteDialogVisible.value = false
  dialogResult.value = '已完成模擬刪除操作'
}

function toggleLoading() {
  loading.value = !loading.value
}

function handlePageChange(page: number, size: number) {
  currentPage.value = page
  pageSize.value = size
}
</script>

<style scoped lang="scss">
.components-showcase {
  display: grid;
  width: min(1200px, 100%);
  padding: 32px 24px 64px;
  margin: 0 auto;
  gap: 40px;
}

.showcase-header {
  padding: 32px;
  background:
    linear-gradient(
      135deg,
      var(--color-surface),
      var(--color-background)
    );
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);

  &__eyebrow {
    margin: 0 0 8px;
    color: var(--el-color-primary);
    font-size: 0.875rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  &__title {
    margin: 0;
    color: var(--color-heading);
    font-size: clamp(2rem, 5vw, 3rem);
    line-height: 1.2;
  }

  &__description {
    max-width: 760px;
    margin: 16px 0 0;
    color: var(--color-text-secondary);
    line-height: 1.8;
  }
}

.showcase-section {
  display: grid;
  gap: 16px;
  scroll-margin-top: 80px;
}

.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;

  h2 {
    margin: 0;
    color: var(--color-heading);
    font-size: 1.5rem;
  }

  p {
    margin: 8px 0 0;
    color: var(--color-text-secondary);
    line-height: 1.7;
  }
}

.component-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.component-result {
  margin: 20px 0 0;
  color: var(--color-text-secondary);

  &--center {
    text-align: center;
  }
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.card-subtitle {
  margin: 4px 0 0;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.loading-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.loading-demo {
  display: grid;
  min-height: 220px;
  padding: 24px;
  text-align: center;
  background-color: var(--color-background);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  place-content: center;

  &__icon {
    font-size: 3rem;
  }

  h3 {
    margin: 12px 0 8px;
    color: var(--color-heading);
  }

  p {
    margin: 0;
    color: var(--color-text-secondary);
  }
}

.pagination-demo {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 32px;

  p {
    margin: 0;
    color: var(--color-text-secondary);
  }
}

.dialog-description {
  margin: 20px 0 0;
  color: var(--color-text);
}

@media (max-width: 900px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 576px) {
  .components-showcase {
    padding: 20px 12px 40px;
    gap: 32px;
  }

  .showcase-header {
    padding: 24px 20px;
  }

  .section-heading {
    flex-direction: column;
  }

  .component-row {
    align-items: stretch;

    :deep(.el-button) {
      width: 100%;
      margin-left: 0;
    }
  }

  .loading-toolbar {
    justify-content: stretch;

    :deep(.el-button) {
      width: 100%;
    }
  }
}
</style>

<route lang="yaml">
meta:
  title: 共用 UI 元件
</route>
