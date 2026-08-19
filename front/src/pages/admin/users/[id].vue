<template>
  <section class="admin-user-detail-page">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">
          MEMBER MANAGEMENT
        </p>

        <h1>會員詳細資料</h1>

        <p class="page-description">
          查看會員基本資料、Email 驗證狀態與帳號角色。
        </p>
      </div>

      <AppButton
        plain
        @click="goBack"
      >
        返回會員管理
      </AppButton>
    </header>

    <AppLoading
      :loading="isLoading"
      text="正在載入會員資料..."
      min-height="360px"
    >
      <AppCard
        v-if="error"
        class="detail-card"
      >
        <AppEmpty description="無法取得會員資料">
          <AppButton
            type="primary"
            :loading="isReloading"
            @click="reloadUser"
          >
            重新載入
          </AppButton>
        </AppEmpty>
      </AppCard>

      <template v-else-if="user">
        <div class="detail-grid">
          <AppCard class="profile-card">
            <div class="profile-card__header">
              <el-avatar
                :size="72"
                :src="user.avatar || undefined"
              >
                {{ getUserInitial(user.account, user.nickname) }}
              </el-avatar>

              <div class="profile-card__identity">
                <h2>
                  {{ user.nickname || user.account }}
                </h2>

                <p>
                  @{{ user.account }}
                </p>

                <div class="profile-card__tags">
                  <el-tag
                    :type="user.role === 'admin' ? 'danger' : 'primary'"
                    effect="light"
                  >
                    {{ user.role === 'admin' ? '管理員' : '一般會員' }}
                  </el-tag>

                  <el-tag
                    :type="user.emailVerified ? 'success' : 'info'"
                    effect="light"
                  >
                    {{ user.emailVerified ? 'Email 已驗證' : 'Email 未驗證' }}
                  </el-tag>
                </div>
              </div>
            </div>

            <div class="info-list">
              <div class="info-row">
                <span>會員 ID</span>
                <strong class="mono">
                  {{ user._id }}
                </strong>
              </div>

              <div class="info-row">
                <span>帳號</span>
                <strong>
                  {{ user.account }}
                </strong>
              </div>

              <div class="info-row">
                <span>暱稱</span>
                <strong>
                  {{ user.nickname || '尚未設定' }}
                </strong>
              </div>

              <div class="info-row">
                <span>Email</span>
                <strong>
                  {{ user.email || '尚未設定' }}
                </strong>
              </div>

              <div class="info-row">
                <span>Email 驗證時間</span>
                <strong>
                  {{
                    user.emailVerifiedAt
                      ? formatDateTime(user.emailVerifiedAt)
                      : '尚未驗證'
                  }}
                </strong>
              </div>

              <div class="info-row">
                <span>加入時間</span>
                <strong>
                  {{ formatDateTime(user.createdAt) }}
                </strong>
              </div>

              <div class="info-row">
                <span>最後更新</span>
                <strong>
                  {{ formatDateTime(user.updatedAt) }}
                </strong>
              </div>
            </div>
          </AppCard>

          <AppCard class="role-card">
            <div class="role-card__heading">
              <div>
                <p class="section-eyebrow">
                  ROLE MANAGEMENT
                </p>

                <h2>角色管理</h2>

                <p>
                  調整會員的後台權限角色。
                </p>
              </div>
            </div>

            <el-form
              label-position="top"
              @submit.prevent="submitRole"
            >
              <el-form-item label="目前角色">
                <el-tag
                  :type="user.role === 'admin' ? 'danger' : 'primary'"
                  effect="light"
                >
                  {{ user.role === 'admin' ? '管理員' : '一般會員' }}
                </el-tag>
              </el-form-item>

              <el-form-item label="變更角色">
                <el-select
                  v-model="selectedRole"
                  class="role-select"
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
              </el-form-item>

              <el-alert
                class="role-alert"
                type="warning"
                :closable="false"
                show-icon
                title="角色變更會影響後台權限"
                description="目前 MVP 允許 user 與 admin 互相切換；停權與至少保留一位 Admin 的限制列為 Future Enhancement。"
              />

              <div class="role-actions">
                <AppButton
                  type="primary"
                  :loading="isUpdatingRole"
                  :disabled="!hasRoleChanged"
                  @click="submitRole"
                >
                  儲存角色
                </AppButton>

                <AppButton
                  plain
                  :disabled="!hasRoleChanged || isUpdatingRole"
                  @click="resetRole"
                >
                  還原
                </AppButton>
              </div>
            </el-form>
          </AppCard>
        </div>
      </template>
    </AppLoading>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import {
  useAdminUserByIdQuery,
  useUpdateAdminUserRoleMutation,
} from '@/queries/adminUsers'
import { useSnackbarStore } from '@/stores/snackbar'
import type { AdminUserRole } from '@/types/adminUsers'

const route = useRoute()
const router = useRouter()
const snackbar = useSnackbarStore()

const userId = () =>
  String(route.params.id ?? '')

const {
  data: user,
  isLoading,
  error,
  refetch,
} = useAdminUserByIdQuery(userId)

const updateRoleMutation =
  useUpdateAdminUserRoleMutation()

const selectedRole =
  ref<AdminUserRole>('user')

const isReloading = ref(false)

const isUpdatingRole = computed(
  () =>
    updateRoleMutation.isLoading.value,
)

const hasRoleChanged = computed(
  () =>
    Boolean(user.value)
    && selectedRole.value
      !== user.value!.role,
)

watch(
  user,
  currentUser => {
    if (!currentUser) {
      return
    }

    selectedRole.value =
      currentUser.role
  },
  {
    immediate: true,
  },
)

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

async function reloadUser():
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

function resetRole(): void {
  if (!user.value) {
    return
  }

  selectedRole.value =
    user.value.role
}

async function submitRole():
Promise<void> {
  if (
    !user.value
    || !hasRoleChanged.value
    || isUpdatingRole.value
  ) {
    return
  }

  try {
    await updateRoleMutation
      .mutateAsync({
        id: user.value._id,
        role: selectedRole.value,
      })

    snackbar.add({
      text: '會員角色已更新',
      color: 'success',
    })
  } catch (error) {
    snackbar.addError(error)
  }
}

async function goBack():
Promise<void> {
  await router.push('/admin/users')
}
</script>

<style scoped lang="scss">
.admin-user-detail-page {
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

.page-eyebrow,
.section-eyebrow {
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

.detail-grid {
  display: grid;
  grid-template-columns:
    minmax(0, 1.4fr)
    minmax(320px, 0.8fr);
  gap: 16px;
  align-items: start;
}

.profile-card__header {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 22px;
}

.profile-card__identity {
  min-width: 0;

  h2 {
    margin: 0;
    color: var(--el-text-color-primary);
    font-size: 1.35rem;
  }

  p {
    margin: 5px 0 10px;
    color: var(--el-text-color-secondary);
  }
}

.profile-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.info-list {
  display: grid;
  border-top: 1px solid
    var(--el-border-color-lighter);
}

.info-row {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid
    var(--el-border-color-lighter);

  span {
    color: var(--el-text-color-secondary);
    font-size: 0.875rem;
  }

  strong {
    min-width: 0;
    overflow-wrap: anywhere;
    color: var(--el-text-color-primary);
    font-weight: 500;
  }
}

.mono {
  font-family: monospace;
}

.role-card__heading {
  margin-bottom: 18px;

  h2 {
    margin: 4px 0 6px;
    font-size: 1.15rem;
  }

  p {
    margin: 0;
    color: var(--el-text-color-secondary);
    line-height: 1.6;
  }
}

.role-select {
  width: 100%;
}

.role-alert {
  margin-top: 8px;
}

.role-actions {
  display: flex;
  gap: 10px;
  margin-top: 18px;
}

@media (max-width: 1000px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
  }

  .profile-card__header {
    align-items: flex-start;
  }

  .info-row {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .role-actions {
    flex-direction: column;

    :deep(.el-button) {
      width: 100%;
      margin-left: 0;
    }
  }
}

/* Step 6-5.6 RWD final regression */
.admin-user-detail-page {
  width: 100%;
  min-width: 0;
}

@media (max-width: 1180px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .page-header :deep(.app-button) {
    width: 100%;
  }

  .profile-card__header {
    align-items: flex-start;
  }

  .info-row {
    grid-template-columns: 120px minmax(0, 1fr);
  }
}

@media (max-width: 640px) {
  .profile-card :deep(.el-card__body),
  .role-card :deep(.el-card__body),
  .detail-card :deep(.el-card__body) {
    padding: 16px;
  }

  .profile-card__header {
    flex-direction: column;
  }

  .info-row {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .role-actions {
    flex-direction: column;
  }

  .role-actions :deep(.el-button),
  .role-actions :deep(.app-button) {
    width: 100%;
    margin-left: 0;
  }
}

</style>

<route lang="yaml">
meta:
  layout: admin
  access: authenticated
  roles:
    - admin
  title: 會員詳細資料
</route>
