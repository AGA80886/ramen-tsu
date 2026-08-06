<template>
  <main class="forgot-password-page">
    <AppCard class="forgot-password-card">
      <div class="forgot-password-header">
        <h1>忘記密碼</h1>

        <p>
          請輸入註冊時使用的 Email。
          如果帳號存在，我們會提供密碼重設連結。
        </p>
      </div>

      <el-form
        label-position="top"
        @submit.prevent="submitForgotPassword"
      >
        <el-form-item
          label="Email"
          :error="errors.email"
        >
          <el-input
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="請輸入 Email"
          />
        </el-form-item>

        <div class="forgot-password-actions">
          <AppButton
            native-type="button"
            @click="goToLogin"
          >
            返回登入
          </AppButton>

          <AppButton
            type="primary"
            native-type="submit"
            :loading="
              isSubmitting ||
                forgotPasswordMutation.isLoading.value
            "
            :disabled="
              isSubmitting ||
                forgotPasswordMutation.isLoading.value
            "
          >
            寄送重設連結
          </AppButton>
        </div>
      </el-form>
    </AppCard>
  </main>
</template>

<script setup lang="ts">
import * as yup from 'yup'
import { useForm } from 'vee-validate'
import { useRouter } from 'vue-router'

import { useForgotPasswordMutation } from '@/queries/auth'
import { useSnackbarStore } from '@/stores/snackbar'
import { getApiErrorMessage } from '@/utils/api-error'

const router = useRouter()
const snackbar = useSnackbarStore()

const forgotPasswordMutation =
  useForgotPasswordMutation()

const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .trim()
    .lowercase()
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
  validationSchema: forgotPasswordSchema,

  initialValues: {
    email: '',
  },
})

const [email] = defineField('email')

const submitForgotPassword = handleSubmit(
  async values => {
    if (forgotPasswordMutation.isLoading.value) {
      return
    }

    try {
      const response =
        await forgotPasswordMutation.mutateAsync({
          email: values.email.trim().toLowerCase(),
        })

      resetForm()

      snackbar.add({
        text:
          response.data.message ||
          '如果此 Email 已註冊，將收到密碼重設連結',
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

async function goToLogin(): Promise<void> {
  await router.push('/login')
}
</script>

<style scoped lang="scss">
.forgot-password-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 160px);
  padding: 40px 20px;
}

.forgot-password-card {
  width: min(100%, 520px);
}

.forgot-password-header {
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

.forgot-password-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .forgot-password-page {
    min-height: calc(100vh - 120px);
    padding: 24px 12px;
  }

  .forgot-password-actions {
    flex-direction: column-reverse;

    :deep(.el-button) {
      width: 100%;
      margin-left: 0;
    }
  }
}
</style>
