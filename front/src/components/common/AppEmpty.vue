<template>
  <div class="app-empty">
    <ElEmpty
      :description="description"
      :image-size="imageSize"
    >
      <slot />
    </ElEmpty>
  </div>
</template>

<script setup lang="ts">
interface Props {
  description?: string
  imageSize?: number
}

withDefaults(defineProps<Props>(), {
  description: '目前沒有資料',
  imageSize: 120,
})
</script>

<style scoped lang="scss">
.app-empty {
  display: flex;
  min-height: 240px;
  padding: 2rem 1rem;
  align-items: center;
  justify-content: center;
}
</style>
