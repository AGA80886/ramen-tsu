<template>
  <section class="admin-users-page">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">
          MEMBER MANAGEMENT
        </p>

        <h1>會員管理</h1>

        <p class="page-description">
          查看會員資料、Email 驗證狀態與帳號角色。
        </p>
      </div>
    </header>

    <div class="overview-grid">
      <div class="overview-card">
        <span>全部會員</span>
        <strong>{{ totalCount }}</strong>
      </div>

      <div class="overview-card">
        <span>一般會員</span>
        <strong>{{ userCount }}</strong>
      </div>

      <div class="overview-card">
        <span>管理員</span>
        <strong>{{ adminCount }}</strong>
      </div>

      <div class="overview-card">
        <span>Email 已驗證</span>
        <strong>{{ verifiedCount }}</strong>
      </div>
    </div>

    <AppLoading
      :loading="isLoading"
      text="正在載入會員資料..."
      min-height="360px"
    >
      <AppCard
        v-if="error"
        class="management-card"
      >
        <AppEmpty description="無法取得會員資料">
          <AppButton
            type="primary"
            :loading="isReloading"
            @click="reloadUsers"
          >
            重新載入
          </AppButton>
        </AppEmpty>
      </AppCard>

      <AppCard
        v-else
        class="management-card"
      >
        <div class="toolbar">
          <el-input
            v-model="search"
            clearable
            placeholder="搜尋帳號、暱稱、Email 或會員 ID"
            :prefix-icon="Search"
          />

          <el-select
            v-model="selectedRole"
            clearable
            placeholder="會員角色"
          >
            <el-option
              label="一般會員"
              value="user"
            />

            <el-option
              label="管理員"
              value="admin"
            />
          </el-select>

          <el-select
            v-model="selectedVerification"
            clearable
            placeholder="Email 驗證狀態"
          >
            <el-option
              label="已驗證"
              value="verified"
            />

            <el-option
              label="未驗證"
              value="unverified"
            />
          </el-select>
        </div>

        <el-empty
          v-if="filteredUsers.length === 0"
          description="目前沒有符合條件的會員"
        />

        <el-table
          v-else
          :data="filteredUsers"
          row-key="_id"
          stripe
          class="management-table"
        >
          <el-table-column
            label="會員"
            min-width="260"
          >
            <template #default="{ row }">
              <div class="user-cell">
                <el-avatar
                  :size="44"
                  :src="row.avatar || undefined"
                >
                  {{ getUserInitial(row.account, row.nickname) }}
                </el-avatar>

                <div class="user-cell__content">
                  <strong>
                    {{ row.account }}
                  </strong>

                  <span>
                    {{ row.nickname || '尚未設定暱稱' }}
                  </span>

                  <small>
                    {{ row._id }}
                  </small>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column
            label="Email"
            min-width="230"
          >
            <template #default="{ row }">
              <div class="email-cell">
                <span>
                  {{ row.email || '尚未設定 Email' }}
                </span>

                <el-tag
                  :type="row.emailVerified ? 'success' : 'info'"
                  effect="light"
                >
                  {{ row.emailVerified ? '已驗證' : '未驗證' }}
                </el-tag>
              </div>
            </template>
          </el-table-column>

          <el-table-column
            label="角色"
            width="110"
          >
            <template #default="{ row }">
              <el-tag
                :type="row.role === 'admin' ? 'danger' : 'primary'"
                effect="light"
              >
                {{ row.role === 'admin' ? '管理員' : '一般會員' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column
            label="加入時間"
            min-width="170"
          >
            <template #default="{ row }">
              {{ formatDateTime(row.createdAt) }}
            </template>
          </el-table-column>

          <el-table-column
            label="更新時間"
            min-width="170"
          >
            <template #default="{ row }">
              {{ formatDateTime(row.updatedAt) }}
            </template>
          </el-table-column>

          <el-table-column
            label="操作"
            width="110"
            fixed="right"
          >
            <template #default="{ row }">
              <AppButton
                type="primary"
                plain
                @click="openUser(row._id)"
              >
                查看
              </AppButton>
            </template>
          </el-table-column>
        </el-table>
      </AppCard>
    </AppLoading>
  </section>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAdminUsersQuery } from '@/queries/adminUsers'
import type { AdminUserRole } from '@/types/adminUsers'

type VerificationFilter =
  | ''
  | 'verified'
  | 'unverified'

const router = useRouter()

const {
  data: users,
  isLoading,
  error,
  refetch,
} = useAdminUsersQuery()

const search = ref('')
const selectedRole = ref<AdminUserRole | ''>('')
const selectedVerification = ref<VerificationFilter>('')
const isReloading = ref(false)

const userList = computed(
  () => users.value ?? [],
)

const totalCount = computed(
  () => userList.value.length,
)

const userCount = computed(
  () =>
    userList.value.filter(
      user => user.role === 'user',
    ).length,
)

const adminCount = computed(
  () =>
    userList.value.filter(
      user => user.role === 'admin',
    ).length,
)

const verifiedCount = computed(
  () =>
    userList.value.filter(
      user => user.emailVerified,
    ).length,
)

const filteredUsers = computed(() => {
  const keyword =
    search.value.trim().toLowerCase()

  return userList.value.filter(user => {
    const matchesKeyword =
      !keyword
      || [
        user.account,
        user.nickname,
        user.email,
        user._id,
      ].some(value =>
        String(value ?? '')
          .toLowerCase()
          .includes(keyword),
      )

    const matchesRole =
      !selectedRole.value
      || user.role === selectedRole.value

    const matchesVerification =
      !selectedVerification.value
      || (
        selectedVerification.value === 'verified'
          ? user.emailVerified
          : !user.emailVerified
      )

    return (
      matchesKeyword
      && matchesRole
      && matchesVerification
    )
  })
})

function getUserInitial(
  account: string,
  nickname: string,
): string {
  const value = String(
    nickname || account || 'U',
  ).trim()

  return value
    ? value.charAt(0).toUpperCase()
    : 'U'
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
    },
  ).format(new Date(value))
}

async function reloadUsers():
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

async function openUser(
  id: string,
): Promise<void> {
  await router.push(
    `/admin/users/${id}`,
  )
}
</script>

<style scoped lang="scss">
.admin-users-page {
  display: grid;
  gap: 20px;
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

.overview-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.overview-card {
  display: flex;
  min-height: 92px;
  flex-direction: column;
  justify-content: center;
  padding: 18px 20px;
  border: 1px solid
    var(--el-border-color-lighter);
  border-radius: 12px;
  background: var(--el-bg-color);

  span {
    color:
      var(--el-text-color-secondary);
    font-size: 0.875rem;
  }

  strong {
    margin-top: 6px;
    color: var(--el-text-color-primary);
    font-size: 1.5rem;
  }
}

.management-card {
  overflow: hidden;
}

.toolbar {
  display: grid;
  grid-template-columns:
    minmax(280px, 1fr)
    190px
    190px;
  gap: 12px;
  margin-bottom: 18px;
  padding: 16px;
  border: 1px solid
    var(--el-border-color-lighter);
  border-radius: 12px;
  background:
    var(--el-fill-color-extra-light);
}

.management-table {
  width: 100%;
}

.user-cell {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
}

.user-cell__content {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;

  strong {
    color: var(--el-text-color-primary);
  }

  span,
  small {
    overflow: hidden;
    color:
      var(--el-text-color-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    font-size: 0.8rem;
  }

  small {
    max-width: 190px;
    font-family: monospace;
  }
}

.email-cell {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;

  > span {
    overflow: hidden;
    max-width: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

@media (max-width: 1000px) {
  .overview-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .toolbar {
    grid-template-columns: 1fr 1fr;
  }

  .toolbar > :first-child {
    grid-column: 1 / -1;
  }
}

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
  }

  .overview-grid {
    grid-template-columns: 1fr;
  }

  .toolbar {
    grid-template-columns: 1fr;
  }

  .toolbar > :first-child {
    grid-column: auto;
  }
}

/* Step 6-5.6 RWD final regression */
.admin-users-page {
  width: 100%;
  min-width: 0;
}

@media (max-width: 1024px) {
  .overview-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .management-card :deep(.el-card__body) {
    overflow-x: auto;
  }

  .management-table {
    min-width: 940px;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
  }

  .toolbar {
    grid-template-columns: 1fr;
  }

  .toolbar > :first-child {
    grid-column: auto;
  }
}

@media (max-width: 640px) {
  .overview-grid {
    grid-template-columns: 1fr;
  }

  .overview-card {
    min-height: 78px;
    padding: 14px 16px;
  }

  .toolbar {
    padding: 14px;
  }

  .user-cell__content small {
    max-width: 150px;
  }
}

</style>

<route lang="yaml">
meta:
  layout: admin
  access: authenticated
  roles:
    - admin
  title: 會員管理
</route>
