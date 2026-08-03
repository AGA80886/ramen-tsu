<template>
  <div
    v-loading="loading && !fullscreen"
    v-loading.fullscreen.lock="loading && fullscreen"
    class="app-loading"
    :class="{ 'app-loading--active': loading }"
    :element-loading-text="text"
    :style="{ minHeight }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  loading?: boolean
  text?: string
  fullscreen?: boolean
  minHeight?: string
}

withDefaults(defineProps<Props>(), {
  loading: false,
  text: '載入中...',
  fullscreen: false,
  minHeight: '240px',
})
</script>

<style scoped lang="scss">
.app-loading {
  position: relative;
  width: 100%;

  &--active {
    pointer-events: none;
  }
}
</style>
