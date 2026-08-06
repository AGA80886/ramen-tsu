<template>
  <main class="reset-password-page">
    <AppCard class="reset-password-card">
      <!-- 驗證 Token -->
      <AppLoading
        v-if="status === 'validating'"
        :loading="true"
        text="正在驗證重設密碼連結..."
        min-height="320px"
      />

      <!-- 重設成功 -->
      <el-result
        v-else-if="status === 'success'"
        icon="success"
        title="密碼重設成功"
        sub-title="你現在可以使用新密碼登入。"
      >
        <template #extra>
          <AppButton
            type="primary"
            @click="goToLogin"
          >
            前往登入
          </AppButton>
        </template>
      </el-result>

      <!-- Token 或 API 錯誤 -->
      <el-result
        v-else-if="status === 'error'"
        icon="error"
        title="密碼重設失敗"
        :sub-title="errorMessage"
      >
        <template #extra>
          <AppButton
            type="primary"
            @click="goToForgotPassword"
          >
            重新申請
          </AppButton>

          <AppButton @click="goToLogin">
            返回登入
          </AppButton>
        </template>
      </el-result>

      <!-- 密碼表單 -->
      <template v-else-if="status === 'form'">
        <header class="reset-password-header">
          <h1>重設密碼</h1>

          <p>
            請設定新的登入密碼。密碼長度須為
            4～20 個字。
          </p>
        </header>

        <el-form
          label-position="top"
          @submit.prevent="submitResetPassword"
        >
          <el-form-item
            label="新密碼"
            :error="errors.password"
          >
            <el-input
              v-model="password"
              type="password"
              show-password
              autocomplete="new-password"
              placeholder="請輸入新密碼"
            />
          </el-form-item>

          <el-form-item
            label="確認新密碼"
            :error="errors.confirmPassword"
          >
            <el-input
              v-model="confirmPassword"
              type="password"
              show-password
              autocomplete="new-password"
              placeholder="請再次輸入新密碼"
            />
          </el-form-item>

          <div class="reset-password-actions">
            <AppButton
              native-type="button"
              :disabled="isRequesting"
              @click="goToLogin"
            >
              返回登入
            </AppButton>

            <AppButton
              type="primary"
              native-type="submit"
              :loading="isRequesting"
              :disabled="isRequesting"
            >
              重設密碼
            </AppButton>
          </div>
        </el-form>
      </template>

      <el-result
        v-else
        icon="error"
        title="頁面狀態錯誤"
        sub-title="請重新開啟密碼重設連結。"
      >
        <template #extra>
          <AppButton
            type="primary"
            @click="goToForgotPassword"
          >
            重新申請
          </AppButton>
        </template>
      </el-result>
    </AppCard>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import * as yup from 'yup'

import {
  useResetPasswordMutation,
  useValidateResetPasswordTokenMutation,
} from '@/queries/auth'
import { getApiErrorMessage } from '@/utils/api-error'

type ResetPasswordStatus =
  | 'validating'
  | 'form'
  | 'success'
  | 'error'

const route = useRoute()
const router = useRouter()

const resetPasswordMutation =
  useResetPasswordMutation()

const status = ref<ResetPasswordStatus>('validating')
const validateTokenMutation = useValidateResetPasswordTokenMutation()
const errorMessage = ref('')

const token = computed(() => {
  return typeof route.query.token === 'string'
    ? route.query.token.trim()
    : ''
})

const resetPasswordSchema = yup.object({
  password: yup
    .string()
    .required('新密碼必填')
    .min(4, '新密碼至少需要 4 個字')
    .max(20, '新密碼最多 20 個字'),

  confirmPassword: yup
    .string()
    .required('確認密碼必填')
    .oneOf(
      [yup.ref('password')],
      '兩次輸入的密碼不一致',
    ),
})

const {
  defineField,
  errors,
  handleSubmit,
  isSubmitting,
} = useForm({
  validationSchema: resetPasswordSchema,

  initialValues: {
    password: '',
    confirmPassword: '',
  },
})

const [password] = defineField('password')
const [confirmPassword] =
  defineField('confirmPassword')

const isRequesting = computed(
  () =>
    isSubmitting.value ||
    resetPasswordMutation.isLoading.value,
)

const submitResetPassword = handleSubmit(
  async values => {
    if (!token.value) {
      errorMessage.value = '缺少重設密碼 Token'
      status.value = 'error'
      return
    }

    if (resetPasswordMutation.isLoading.value) {
      return
    }

    try {
      await resetPasswordMutation.mutateAsync({
        token: token.value,
        password: values.password,
        confirmPassword: values.confirmPassword,
      })

      status.value = 'success'
    } catch (error) {
      errorMessage.value = getApiErrorMessage(error)
      status.value = 'error'
    }
  },
)

async function goToLogin(): Promise<void> {
  await router.push('/login')
}

async function goToForgotPassword(): Promise<void> {
  await router.push('/forgot-password')
}

onMounted(async () => {
  if (!token.value) {
    errorMessage.value = '缺少重設密碼 Token'
    status.value = 'error'
    return
  }

  try {
    await validateTokenMutation.mutateAsync({
      token: token.value,
    })

    status.value = 'form'
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error)
    status.value = 'error'
  }
})
</script>

<route lang="yaml">
meta:
  layout: default
  title: 重設密碼
</route>

<style scoped lang="scss">
.reset-password-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 160px);
  padding: 40px 20px;
}

.reset-password-card {
  width: min(100%, 520px);
}

.reset-password-header {
  margin-bottom: 24px;
  text-align: center;

  h1 {
    margin: 0;
    font-size: 28px;
  }

  p {
    margin: 12px 0 0;
    color: var(--color-text-secondary);
    font-size: 14px;
    line-height: 1.7;
  }
}

.reset-password-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .reset-password-page {
    min-height: calc(100vh - 120px);
    padding: 24px 12px;
  }

  .reset-password-actions {
    flex-direction: column-reverse;

    :deep(.el-button) {
      width: 100%;
      margin-left: 0;
    }
  }
}
</style>
