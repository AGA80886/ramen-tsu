<script setup lang="ts">
import { Moon, Sunny } from '@element-plus/icons-vue'
import { useTheme } from '@/composables/useTheme'

const { isDark } = useTheme()
</script>

<template>
  <el-switch
    v-model="isDark"
    inline-prompt
    :active-icon="Moon"
    :inactive-icon="Sunny"
    aria-label="切換明暗主題"
  />
</template>
