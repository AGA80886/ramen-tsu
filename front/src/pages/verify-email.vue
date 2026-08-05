<template>
  <section class="verify-email-page">
    <AppCard class="verify-email-card">
      <AppLoading
        :loading="verifyEmailMutation.isLoading.value"
        text="正在驗證 Email..."
      >
        <template v-if="status === 'success'">
          <el-result
            icon="success"
            title="Email 驗證成功"
            sub-title="你的 Email 已完成驗證。"
          >
            <template #extra>
              <AppButton
                type="primary"
                @click="goToProfile"
              >
                前往會員中心
              </AppButton>
            </template>
          </el-result>
        </template>

        <template v-else-if="status === 'error'">
          <el-result
            icon="error"
            title="Email 驗證失敗"
            :sub-title="errorMessage"
          >
            <template #extra>
              <AppButton @click="goToProfile">
                返回會員中心
              </AppButton>
            </template>
          </el-result>
        </template>

        <template v-else>
          <div class="verify-placeholder">
            正在處理驗證連結……
          </div>
        </template>
      </AppLoading>
    </AppCard>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useVerifyEmailMutation } from '@/queries/profile'
import { getApiErrorMessage } from '@/utils/api-error'

type VerifyStatus = 'pending' | 'success' | 'error'

const route = useRoute()
const router = useRouter()

const verifyEmailMutation = useVerifyEmailMutation()

const status = ref<VerifyStatus>('pending')
const errorMessage = ref('')

onMounted(async () => {
  const token =
    typeof route.query.token === 'string'
      ? route.query.token
      : ''

  if (!token) {
    status.value = 'error'
    errorMessage.value = '缺少 Email 驗證 Token'
    return
  }

  try {
    await verifyEmailMutation.mutateAsync({
      token,
    })

    status.value = 'success'
  } catch (error) {
    status.value = 'error'
    errorMessage.value =
      getApiErrorMessage(error)
  }
})

async function goToProfile(): Promise<void> {
  await router.push('/profile')
}
</script>

<style scoped lang="scss">
.verify-email-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 160px);
  padding: 40px 20px;
}

.verify-email-card {
  width: min(100%, 640px);
}

.verify-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 360px;
  color: var(--color-text-secondary);
}

@media (max-width: 768px) {
  .verify-email-page {
    min-height: calc(100vh - 120px);
    padding: 24px 12px;
  }
}
</style>

<route lang="yaml">
meta:
  layout: default
  title: Email 驗證
</route>
