<template>
  <div class="auth-page">
    <el-card class="auth-card">
      <template #header>
        <h1>登入</h1>
      </template>
      <el-form
        label-position="top"
        :disabled="isSubmitting"
        @submit.prevent="submit"
      >
        <el-form-item
          label="帳號"
          :error="errors.account"
        >
          <el-input
            v-model="account"
            placeholder="長度 4～20 的英數字"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item
          label="密碼"
          :error="errors.password"
        >
          <el-input
            v-model="password"
            placeholder="長度 4～20 字"
            show-password
            type="password"
            :prefix-icon="Lock"
          />
        </el-form-item>
        <el-button
          class="submit-button"
          type="primary"
          :loading="isSubmitting"
          native-type="submit"
        >
          登入
        </el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import validator from 'validator'
import { Lock, User } from '@element-plus/icons-vue'
import { useForm } from 'vee-validate'
import { useRouter } from 'vue-router'
import * as yup from 'yup'
import { useLoginMutation } from '@/queries/auth'
import { useSnackbarStore } from '@/stores/snackbar'

const { mutateAsync: login } = useLoginMutation()
const router = useRouter()
const snackbar = useSnackbarStore()
const schema = yup.object({
  account: yup.string().required('帳號必填').min(4, '帳號必需是 4 個字以上').max(20, '帳號必需是 20 個字以下').test('isAlphanumeric', '帳號只能是英數字', value => validator.isAlphanumeric(value || '')),
  password: yup.string().required('密碼必填').min(4, '密碼最少 4 個字').max(20, '密碼最長 20 個字'),
})
const { defineField, handleSubmit, isSubmitting, errors } = useForm({ validationSchema: schema, initialValues: { account: '', password: '' } })
const [account] = defineField('account')
const [password] = defineField('password')
const submit = handleSubmit(async values => {
  try {
    await login(values)
    snackbar.add({ text: '登入成功', color: 'success' })
    await router.push('/')
  } catch (error) { snackbar.addError(error) }
})
</script>

<style scoped>
.auth-page { display: grid; min-height: calc(100vh - 100px); place-items: center; }
.auth-card { width: min(460px, 100%); }
h1 { margin: 0; text-align: center; }
.submit-button { width: 100%; }
</style>

<route lang="yaml">
meta:
  title: 登入
  login: no-login-only
</route>
