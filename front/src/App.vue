<template>
  <AppConfigProvider>
    <RouterView />
  </AppConfigProvider>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppConfigProvider from '@/components/providers/AppConfigProvider.vue'
</script>


