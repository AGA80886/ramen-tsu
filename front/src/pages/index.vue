
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSnackbarStore } from '@/stores/snackbar'

const route = useRoute()
const router = useRouter()
const snackbar = useSnackbarStore()

onMounted(async () => {
  if (route.query.notice !== 'admin-only') {
    return
  }

  snackbar.add({
    text: '此區域僅限管理員使用，已為你返回首頁',
    color: 'warning',
  })

  await router.replace({
    path: '/',
  })
})
</script>

<route lang="yaml">
meta:
  title: 首頁
</route>
