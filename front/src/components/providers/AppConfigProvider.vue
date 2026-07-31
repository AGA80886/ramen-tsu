<script setup lang="ts">
import { ElConfigProvider } from 'element-plus'
import { elementPlusConfig } from '@/config/element-plus'
</script>

<template>
  <ElConfigProvider
    :locale="elementPlusConfig.locale"
    :size="elementPlusConfig.size"
    :z-index="elementPlusConfig.zIndex"
    :namespace="elementPlusConfig.namespace"
  >
    <slot />
  </ElConfigProvider>
</template>
