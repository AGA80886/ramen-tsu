<template>
  <main class="profile-page">
    <section class="profile-hero">
      <div class="page-container profile-hero__inner">
        <div>
          <p class="profile-hero__eyebrow">
            MEMBER CENTER
          </p>

          <h1>會員中心</h1>

          <p class="profile-hero__description">
            查看並更新您的個人資料、會員頭像與帳號安全設定。
          </p>
        </div>
      </div>
    </section>

    <section class="page-container profile-content">
      <nav class="profile-shortcuts">
        <button
          type="button"
          class="btn btn-outline-secondary"
          @click="goToMyArticles"
        >
          我的投稿文章
        </button>

        <button
          type="button"
          class="btn btn-outline-secondary"
          @click="goToMyShops"
        >
          我的新增店家
        </button>

        <button
          type="button"
          class="btn btn-outline-secondary"
          @click="goToMyFavoriteArticles"
        >
          我的收藏文章
        </button>

        <button
          type="button"
          class="btn btn-outline-secondary"
          @click="goToMyFavoriteShops"
        >
          我的收藏店家
        </button>
      </nav>

      <AppLoading
        :loading="isLoading"
        text="正在載入會員資料..."
      >
        <!-- API 載入失敗 -->
        <AppCard
          v-if="error"
          class="profile-state"
        >
          <AppEmpty description="無法取得會員資料" />

          <div class="state-actions">
            <AppButton
              type="primary"
              :loading="isReloading"
              @click="reloadProfile"
            >
              重新載入
            </AppButton>
          </div>
        </AppCard>

        <!-- 成功取得會員資料 -->
        <AppCard
          v-else-if="profile"
          class="profile-card"
        >
          <div class="profile-layout">
            <!-- 頭像區 -->
            <section class="avatar-section">
              <el-avatar
                :size="128"
                :src="profile.avatar || undefined"
              >
                {{ avatarFallback }}
              </el-avatar>

              <div class="avatar-section__info">
                <h2>{{ displayName }}</h2>
                <p>{{ profile.account }}</p>

                <el-tag :type="profile.role === 'admin' ? 'danger' : 'primary'">
                  {{ profile.role === 'admin' ? '管理員' : '一般會員' }}
                </el-tag>
              </div>

              <input
                ref="avatarInput"
                class="avatar-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                @change="handleAvatarChange"
              />

              <AppButton
                type="primary"
                plain
                :loading="updateAvatarMutation.isLoading.value"
                @click="openAvatarPicker"
              >
                更換頭像
              </AppButton>

              <p class="avatar-section__hint">
                支援 JPG、PNG、WebP，檔案大小上限 2MB。
              </p>
            </section>

            <!-- 資料表單 -->
            <section class="profile-form-section">
              <el-form
                label-position="top"
                @submit.prevent="submitProfile"
              >
                <el-form-item label="帳號">
                  <el-input
                    :model-value="profile.account"
                    disabled
                  />
                </el-form-item>

                <el-form-item
                  label="暱稱"
                  :error="errors.nickname"
                >
                  <el-input
                    v-model="nickname"
                    maxlength="30"
                    show-word-limit
                    placeholder="請輸入暱稱"
                  />
                </el-form-item>

                <el-form-item
                  label="Email"
                  :error="errors.email"
                >
                  <el-input
                    v-model="email"
                    type="email"
                    placeholder="請輸入 Email"
                  />
                </el-form-item>

                <div class="email-verification">
                  <div class="email-verification__status">
                    <span class="email-verification__label">
                      Email 驗證狀態
                    </span>

                    <el-tag
                      v-if="profile.emailVerified"
                      type="success"
                      effect="light"
                    >
                      已驗證
                    </el-tag>

                    <el-tag
                      v-else
                      type="warning"
                      effect="light"
                    >
                      未驗證
                    </el-tag>
                  </div>

                  <p
                    v-if="
                      profile.emailVerified &&
                        profile.emailVerifiedAt
                    "
                    class="email-verification__time"
                  >
                    驗證時間：
                    {{ formatDate(profile.emailVerifiedAt) }}
                  </p>

                  <div
                    v-else-if="!profile.emailVerified"
                    class="email-verification__action"
                  >
                    <p>
                      驗證 Email 後，可提高帳號安全性並使用後續通知功能。
                    </p>

                    <AppButton
                      v-if="!profile.emailVerified"
                      type="primary"
                      plain
                      native-type="button"
                      :loading="
                        requestEmailVerificationMutation.isLoading.value
                      "
                      :disabled="
                        requestEmailVerificationMutation.isLoading.value
                      "
                      @click="requestVerificationEmail"
                    >
                      寄送驗證信
                    </AppButton>
                  </div>
                </div>

                <el-form-item label="會員角色">
                  <el-input
                    :model-value="profile.role === 'admin' ? '管理員' : '一般會員'"
                    disabled
                  />
                </el-form-item>

                <el-form-item label="建立時間">
                  <el-input
                    :model-value="formatDate(profile.createdAt)"
                    disabled
                  />
                </el-form-item>

                <div class="profile-actions">
                  <AppButton
                    native-type="button"
                    @click="resetProfileForm"
                  >
                    重設
                  </AppButton>

                  <AppButton
                    type="primary"
                    native-type="submit"
                    :loading="isSubmitting"
                    :disabled="
                      !isProfileChanged ||
                        updateProfileMutation.isLoading.value
                    "
                  >
                    儲存修改
                  </AppButton>
                </div>
              </el-form>
            </section>
          </div>
        </AppCard>

        <!-- 修改密碼 -->
        <AppCard
          v-if="profile"
          class="password-card"
        >
          <div class="password-section">
            <header class="password-section__header">
              <div>
                <h2>修改密碼</h2>

                <p>
                  為保護帳號安全，請先輸入目前密碼，再設定新密碼。
                </p>
              </div>
            </header>

            <el-form
              label-position="top"
              @submit.prevent="submitPassword"
            >
              <el-form-item
                label="目前密碼"
                :error="passwordErrors.currentPassword"
              >
                <el-input
                  v-model="currentPassword"
                  type="password"
                  show-password
                  autocomplete="current-password"
                  placeholder="請輸入目前密碼"
                />
              </el-form-item>

              <el-form-item
                label="新密碼"
                :error="passwordErrors.newPassword"
              >
                <el-input
                  v-model="newPassword"
                  type="password"
                  show-password
                  autocomplete="new-password"
                  maxlength="20"
                  show-word-limit
                  placeholder="請輸入 4 至 20 個字的新密碼"
                />
              </el-form-item>

              <el-form-item
                label="確認新密碼"
                :error="passwordErrors.confirmPassword"
              >
                <el-input
                  v-model="confirmPassword"
                  type="password"
                  show-password
                  autocomplete="new-password"
                  maxlength="20"
                  placeholder="請再次輸入新密碼"
                />
              </el-form-item>

              <div class="password-actions">
                <AppButton
                  native-type="button"
                  :disabled="
                    !passwordMeta.dirty ||
                      isPasswordSubmitting
                  "
                  @click="resetPasswordFields"
                >
                  重設
                </AppButton>

                <AppButton
                  type="primary"
                  native-type="submit"
                  :loading="
                    isPasswordSubmitting ||
                      updatePasswordMutation.isLoading.value
                  "
                  :disabled="!passwordMeta.dirty"
                >
                  修改密碼
                </AppButton>
              </div>
            </el-form>
          </div>
        </AppCard>

        <!-- API 已完成但沒有資料 -->
        <AppCard
          v-else
          class="profile-state"
        >
          <AppEmpty description="目前沒有會員資料" />
        </AppCard>
      </AppLoading>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import { onBeforeRouteLeave } from 'vue-router'
import { ElMessageBox } from 'element-plus'

import {
  useProfileQuery,
  useRequestEmailVerificationMutation,
  useUpdateAvatarMutation,
  useUpdatePasswordMutation,
  useUpdateProfileMutation,
} from '@/queries/profile'
import { useSnackbarStore } from '@/stores/snackbar'
import { getApiErrorMessage } from '@/utils/api-error'

const snackbar = useSnackbarStore()

const router = useRouter()
function goToMyArticles(): void {
  router.push('/user/articles')
}

function goToMyShops(): void {
  router.push('/user/shops')
}

function goToMyFavoriteArticles(): void {
  router.push('/user/favorite-articles')
}

function goToMyFavoriteShops(): void {
  router.push('/user/favorite-shops')
}

const avatarInput = ref<HTMLInputElement | null>(null)

const {
  data: profile,
  error,
  isLoading,
  refetch,
} = useProfileQuery()

const isReloading = ref(false)

const updateProfileMutation = useUpdateProfileMutation()
const updateAvatarMutation = useUpdateAvatarMutation()
const updatePasswordMutation = useUpdatePasswordMutation()
const requestEmailVerificationMutation =
  useRequestEmailVerificationMutation()

const profileSchema = yup.object({
  nickname: yup
    .string()
    .trim()
    .max(30, '暱稱最多 30 個字'),
  email: yup
    .string()
    .trim()
    .required('Email 必填')
    .email('Email 格式錯誤'),
})

const {
  defineField,
  errors,
  handleSubmit,
  isSubmitting,
  resetForm,
} = useForm({
  validationSchema: profileSchema,
  initialValues: {
    nickname: '',
    email: '',
  },
})

const [nickname] = defineField('nickname')
const [email] = defineField('email')

watch(
  profile,
  value => {
    if (!value) {
      return
    }

    resetForm({
      values: {
        nickname: value.nickname,
        email: value.email,
      },
    })
  },
  {
    immediate: true,
  },
)

const displayName = computed(() => {
  return profile.value?.nickname || profile.value?.account || '會員'
})

const avatarFallback = computed(() => {
  return displayName.value.slice(0, 1).toUpperCase()
})

const isProfileChanged = computed(() => {
  if (!profile.value) {
    return false
  }

  const originalNickname =
    profile.value.nickname.trim()

  const originalEmail =
    profile.value.email.trim().toLowerCase()

  return (
    nickname.value.trim() !== originalNickname ||
    email.value.trim().toLowerCase() !== originalEmail
  )
})

function formatDate(
  value: string | null | undefined,
): string {
  if (!value) {
    return '尚未設定'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '日期格式錯誤'
  }

  return date.toLocaleString('zh-TW')
}

function resetProfileForm(): void {
  if (!profile.value) {
    return
  }

  resetForm({
    values: {
      nickname: profile.value.nickname,
      email: profile.value.email,
    },
  })

  snackbar.add({
    text: '會員資料已重設',
    color: 'info',
  })
}

async function reloadProfile(): Promise<void> {
  isReloading.value = true

  try {
    await refetch()

    snackbar.add({
      text: '會員資料已重新載入',
      color: 'success',
    })
  } catch (reloadError) {
    snackbar.add({
      text: getApiErrorMessage(reloadError),
      color: 'error',
    })
  } finally {
    isReloading.value = false
  }
}

async function requestVerificationEmail(): Promise<void> {
  if (requestEmailVerificationMutation.isLoading.value) {
    return
  }

  try {
    const response =
      await requestEmailVerificationMutation.mutateAsync()

    snackbar.add({
      text: response.data.message || '驗證信已寄出',
      color: 'success',
    })
  } catch (error) {
    snackbar.add({
      text: getApiErrorMessage(error),
      color: 'error',
    })
  }
}

const submitProfile = handleSubmit(async values => {
  try {
    await updateProfileMutation.mutateAsync({
      nickname: values.nickname.trim(),
      email: values.email.trim().toLowerCase(),
    })

    snackbar.add({
      text: '會員資料更新成功',
      color: 'success',
    })
  } catch (error) {
    snackbar.add({
      text: getApiErrorMessage(error),
      color: 'error',
    })
  }
})

function openAvatarPicker(): void {
  avatarInput.value?.click()
}

async function handleAvatarChange(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  input.value = ''

  if (!file) {
    return
  }

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ]

  if (!allowedTypes.includes(file.type)) {
    snackbar.add({
      text: '頭像只支援 JPG、PNG 或 WebP',
      color: 'error',
    })
    return
  }

  const maxFileSize = 2 * 1024 * 1024

  if (file.size > maxFileSize) {
    snackbar.add({
      text: '頭像大小不可超過 2MB',
      color: 'error',
    })
    return
  }

  try {
    await updateAvatarMutation.mutateAsync(file)

    snackbar.add({
      text: '頭像更新成功',
      color: 'success',
    })
  } catch (error) {
    snackbar.add({
      text: getApiErrorMessage(error),
      color: 'error',
    })
  }
}

onBeforeRouteLeave(async () => {
  if (!isProfileChanged.value) {
    return true
  }

  try {
    await ElMessageBox.confirm(
      '目前有尚未儲存的會員資料，確定要離開嗎？',
      '尚未儲存',
      {
        confirmButtonText: '離開',
        cancelButtonText: '繼續編輯',
        type: 'warning',
      },
    )

    return true
  } catch {
    return false
  }
})

const passwordSchema = yup.object({
  currentPassword: yup
    .string()
    .required('請輸入目前密碼'),

  newPassword: yup
    .string()
    .required('請輸入新密碼')
    .min(4, '新密碼至少需要 4 個字')
    .max(20, '新密碼最多 20 個字'),

  confirmPassword: yup
    .string()
    .required('請再次輸入新密碼')
    .oneOf(
      [yup.ref('newPassword')],
      '兩次輸入的密碼不一致',
    ),
})

const {
  defineField: definePasswordField,
  errors: passwordErrors,
  handleSubmit: handlePasswordSubmit,
  isSubmitting: isPasswordSubmitting,
  resetForm: resetPasswordForm,
  meta: passwordMeta,
} = useForm({
  validationSchema: passwordSchema,

  initialValues: {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  },
})

const [currentPassword] = definePasswordField('currentPassword')
const [newPassword] = definePasswordField('newPassword')
const [confirmPassword] = definePasswordField('confirmPassword')

const submitPassword = handlePasswordSubmit(
  async values => {
    try {
      await updatePasswordMutation.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })

      resetPasswordForm()

      snackbar.add({
        text: '密碼修改成功',
        color: 'success',
      })
    } catch (error) {
      snackbar.add({
        text: getApiErrorMessage(error),
        color: 'error',
      })
    }
  },
)

function resetPasswordFields(): void {
  resetPasswordForm()

  snackbar.add({
    text: '密碼欄位已清除',
    color: 'info',
  })
}


</script>

<style scoped lang="scss">
.profile-page {
  min-height: 100vh;
}

.page-container {
  width: min(
    1200px,
    calc(100% - 40px)
  );
  margin: 0 auto;
}

.profile-hero {
  padding: 72px 0 56px;

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
    color:
      var(--color-text-secondary);
    line-height: 1.8;
  }
}

.profile-content {
  padding-bottom: 72px;
}

.profile-shortcuts {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: flex-end;
  margin-bottom: 28px;

  .btn {
    min-width: 140px;
  }
}

.profile-card,
.password-card,
.profile-state {
  overflow: hidden;
  border: 1px solid
    var(--color-border);
  border-radius: 16px;
  background:
    var(--color-background);
  box-shadow:
    0 8px 24px
    rgb(0 0 0 / 4%);
}

.profile-layout {
  display: grid;
  grid-template-columns:
    minmax(240px, 300px)
    minmax(0, 1fr);
  gap: 0;
}

.avatar-section {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 16px;
  padding: 32px 28px;
  border-right: 1px solid
    var(--color-border);
  text-align: center;
}

.avatar-section__info {
  h2 {
    margin: 0 0 6px;
    color:
      var(--color-text);
    font-size: 22px;
  }

  p {
    margin: 0 0 12px;
    color:
      var(--color-text-secondary);
  }
}

.avatar-input {
  display: none;
}

.avatar-section__hint {
  margin: 0;
  color:
    var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.6;
}

.profile-form-section {
  padding: 32px;
}

.profile-actions,
.password-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;

  :deep(.el-button) {
    margin-left: 0;
  }
}

.profile-state {
  min-height: 360px;
  padding: 40px;
}

.email-verification {
  margin-bottom: 20px;
  padding: 18px;
  border: 1px solid
    var(--color-border);
  border-radius: 12px;
  background:
    var(--el-fill-color-light);
}

.email-verification__status {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.email-verification__label {
  color:
    var(--color-text);
  font-weight: 600;
}

.email-verification__time {
  margin: 12px 0 0;
  color:
    var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.6;
}

.email-verification__action {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;

  p {
    margin: 0;
    color:
      var(--color-text-secondary);
    font-size: 13px;
    line-height: 1.6;
  }
}

.state-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.password-card {
  margin-top: 24px;
}

.password-section {
  padding: 32px 40px;
}

.password-section__header {
  margin-bottom: 28px;
  padding-bottom: 16px;
  border-bottom: 1px solid
    var(--color-border);

  h2 {
    margin: 0;
    color:
      var(--color-text);
    font-size: 1.35rem;
  }

  p {
    margin: 8px 0 0;
    color:
      var(--color-text-secondary);
    font-size: 14px;
    line-height: 1.6;
  }
}

/*
 * 與拉麵論壇一致：
 * 使用 Bootstrap btn 的 hover / focus 行為。
 */
.profile-page {
  .btn-outline-secondary {
    transition:
      color 0.15s ease-in-out,
      background-color 0.15s ease-in-out,
      border-color 0.15s ease-in-out,
      box-shadow 0.15s ease-in-out;
  }

  .btn-outline-secondary:hover,
  .btn-outline-secondary:focus-visible {
    color:
      var(--bs-btn-hover-color);
    background-color:
      var(--bs-btn-hover-bg);
    border-color:
      var(--bs-btn-hover-border-color);
  }
}

@media (max-width: 900px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }

  .avatar-section {
    border-right: 0;
    border-bottom: 1px solid
      var(--color-border);
  }
}

@media (max-width: 640px) {
  .page-container {
    width: min(
      100%,
      calc(100% - 32px)
    );
  }

  .profile-hero {
    padding: 48px 0 40px;

    &__inner {
      align-items: stretch;
      flex-direction: column;
    }
  }

  .profile-content {
    padding-bottom: 48px;
  }

  .profile-shortcuts {
    flex-direction: column;

    .btn {
      width: 100%;
    }
  }

  .profile-form-section,
  .password-section {
    padding: 24px 20px;
  }

  .profile-actions,
  .password-actions {
    flex-direction: column-reverse;

    :deep(.el-button) {
      width: 100%;
    }
  }

  .email-verification__action {
    align-items: stretch;
    flex-direction: column;

    :deep(.el-button) {
      width: 100%;
      margin-left: 0;
    }
  }
}
</style>

<route lang="yaml">
meta:
  access: authenticated
  title: 會員中心
</route>
