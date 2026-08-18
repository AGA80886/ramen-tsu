<template>
  <div class="admin-home-page">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">
          ADMIN DASHBOARD
        </p>

        <h1>後台管理</h1>

        <p class="page-description">
          從這裡快速進入拉麵通各項後台管理功能。
        </p>
      </div>
    </header>

    <section class="management-section">
      <div class="section-heading">
        <div>
          <h2>管理項目</h2>
          <p>選擇要管理的內容。</p>
        </div>
      </div>

      <div class="management-grid">
        <RouterLink
          v-for="item in managementItems"
          :key="item.to"
          :to="item.to"
          class="management-link"
        >
          <el-card
            shadow="hover"
            class="management-card"
          >
            <div class="management-card__content">
              <div class="management-card__icon">
                <el-icon :size="26">
                  <component :is="item.icon" />
                </el-icon>
              </div>

              <div class="management-card__body">
                <strong>{{ item.title }}</strong>

                <p>{{ item.description }}</p>
              </div>

              <el-icon class="management-card__arrow">
                <ArrowRight />
              </el-icon>
            </div>
          </el-card>
        </RouterLink>
      </div>
    </section>

    <section class="notice-panel">
      <div class="notice-panel__icon">
        <el-icon :size="22">
          <InfoFilled />
        </el-icon>
      </div>

      <div>
        <h2>管理提醒</h2>

        <p>
          商品、文章與店家內容的上下架或審核狀態，會直接影響前台顯示結果；
          修改後建議同步確認公開頁面。
        </p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowRight,
  Document,
  Goods,
  InfoFilled,
  Shop,
  Tickets,
} from '@element-plus/icons-vue'

const managementItems = [
  {
    title: '文章管理',
    description: '管理拉麵文章、內容與審核狀態。',
    to: '/admin/articles',
    icon: Document,
  },
  {
    title: '店家管理',
    description: '管理拉麵店家資料與審核狀態。',
    to: '/admin/shops',
    icon: Shop,
  },
  {
    title: '訂單管理',
    description: '查看會員訂單與處理訂單狀態。',
    to: '/admin/orders',
    icon: Tickets,
  },
  {
    title: '商品管理',
    description: '管理商城商品、價格、分類與上下架。',
    to: '/admin/products',
    icon: Goods,
  },
] as const
</script>

<style scoped lang="scss">
.admin-home-page {
  display: grid;
  gap: 24px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;

  h1 {
    margin: 4px 0 6px;
    font-size: 1.75rem;
    line-height: 1.25;
  }
}

.page-eyebrow {
  margin: 0;
  color: var(--el-color-primary);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.page-description {
  margin: 0;
  color: var(--el-text-color-secondary);
  line-height: 1.6;
}

.management-section {
  display: grid;
  gap: 16px;
}

.section-heading {
  h2 {
    margin: 0;
    color: var(--el-text-color-primary);
    font-size: 1.05rem;
  }

  p {
    margin: 6px 0 0;
    color: var(--el-text-color-secondary);
    font-size: 0.875rem;
  }
}

.management-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.management-link {
  min-width: 0;
  color: inherit;
  text-decoration: none;
}

.management-card {
  height: 100%;
  border-radius: 12px;

  :deep(.el-card__body) {
    height: 100%;
    padding: 20px;
  }
}

.management-card__content {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  min-height: 82px;
}

.management-card__icon {
  display: grid;
  width: 52px;
  height: 52px;
  place-items: center;
  border-radius: 12px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.management-card__body {
  min-width: 0;

  strong {
    display: block;
    margin-bottom: 6px;
    color: var(--el-text-color-primary);
    font-size: 1rem;
  }

  p {
    margin: 0;
    color: var(--el-text-color-secondary);
    font-size: 0.875rem;
    line-height: 1.6;
  }
}

.management-card__arrow {
  color: var(--el-text-color-placeholder);
  transition:
    color 0.2s ease,
    transform 0.2s ease;
}

.management-link:hover {
  .management-card__arrow {
    color: var(--el-color-primary);
    transform: translateX(3px);
  }
}

.notice-panel {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px 20px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  background: var(--el-fill-color-extra-light);

  h2 {
    margin: 0 0 6px;
    color: var(--el-text-color-primary);
    font-size: 0.95rem;
  }

  p {
    margin: 0;
    color: var(--el-text-color-secondary);
    font-size: 0.875rem;
    line-height: 1.7;
  }
}

.notice-panel__icon {
  display: grid;
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 10px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

@media (max-width: 900px) {
  .management-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .admin-home-page {
    gap: 20px;
  }

  .page-header {
    flex-direction: column;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .management-grid {
    gap: 12px;
  }

  .management-card {
    :deep(.el-card__body) {
      padding: 16px;
    }
  }

  .management-card__content {
    grid-template-columns: 44px minmax(0, 1fr) auto;
    gap: 12px;
    min-height: 72px;
  }

  .management-card__icon {
    width: 44px;
    height: 44px;
    border-radius: 10px;
  }

  .management-card__body {
    p {
      font-size: 0.8125rem;
    }
  }

  .notice-panel {
    padding: 16px;
  }
}

@media (max-width: 420px) {
  .management-card__content {
    grid-template-columns: 40px minmax(0, 1fr);
  }

  .management-card__icon {
    width: 40px;
    height: 40px;
  }

  .management-card__arrow {
    display: none;
  }

  .notice-panel {
    align-items: flex-start;
  }
}
</style>

<route lang="yaml">
meta:
  layout: admin
  access: authenticated
  roles:
    - admin
  title: 後台管理
</route>
