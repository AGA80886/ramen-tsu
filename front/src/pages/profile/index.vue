<template>
  <section class="profile-page">
    <div class="profile-page__header">
      <div>
        <h1>會員中心</h1>
        <p>查看並更新你的個人資料與會員頭像。</p>
      </div>
    </div>

    <AppLoading
      :loading="isLoading"
      text="正在載入會員資料..."
    >
      <AppCard
        v-if="profile"
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
                  :disabled="!isProfileChanged"
                >
                  儲存修改
                </AppButton>
              </div>
            </el-form>
          </section>
        </div>
      </AppCard>

      <AppEmpty
        v-else
        description="無法取得會員資料"
      />
    </AppLoading>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useForm } from 'vee-validate'
import * as yup from 'yup'

import {
  useProfileQuery,
  useUpdateAvatarMutation,
  useUpdateProfileMutation,
} from '@/queries/profile'
import { useSnackbarStore } from '@/stores/snackbar'
import { getApiErrorMessage } from '@/utils/api-error'

const snackbar = useSnackbarStore()

const avatarInput = ref<HTMLInputElement | null>(null)

const {
  data: profile,
  isLoading,
} = useProfileQuery()

const updateProfileMutation = useUpdateProfileMutation()
const updateAvatarMutation = useUpdateAvatarMutation()

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

  return (
    nickname.value.trim() !== profile.value.nickname ||
    email.value.trim().toLowerCase() !== profile.value.email
  )
})

function formatDate(value: string): string {
  return new Date(value).toLocaleString('zh-TW')
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
</script>

<route lang="yaml">
meta:
  layout: default
  access: authenticated
  title: 會員中心
</route>

<style scoped lang="scss">
.profile-page {
  width: min(100%, 960px);
  margin: 0 auto;
  padding: 32px 20px;
}

.profile-page__header {
  margin-bottom: 24px;

  h1 {
    margin: 0;
    color: var(--color-text);
    font-size: 28px;
  }

  p {
    margin: 8px 0 0;
    color: var(--color-text-secondary);
  }
}

.profile-card {
  overflow: hidden;
}

.profile-layout {
  display: grid;
  grid-template-columns: minmax(220px, 280px) minmax(0, 1fr);
  gap: 40px;
}

.avatar-section {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  text-align: center;
  border-right: 1px solid var(--color-border);
}

.avatar-section__info {
  h2 {
    margin: 0 0 6px;
    color: var(--color-text);
    font-size: 22px;
  }

  p {
    margin: 0 0 12px;
    color: var(--color-text-secondary);
  }
}

.avatar-input {
  display: none;
}

.avatar-section__hint {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.6;
}

.profile-form-section {
  padding: 24px;
}

.profile-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .profile-page {
    padding: 20px 12px;
  }

  .profile-layout {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .avatar-section {
    border-right: 0;
    border-bottom: 1px solid var(--color-border);
  }

  .profile-actions {
    flex-direction: column-reverse;

    :deep(.el-button) {
      width: 100%;
    }
  }
}
</style>
