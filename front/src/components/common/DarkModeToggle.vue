<template>
  <ElTooltip
    :content="isDark ? '切換為淺色模式' : '切換為深色模式'"
    placement="bottom"
  >
    <ElButton
      class="theme-toggle"
      circle
      text
      :aria-label="isDark ? '切換為淺色模式' : '切換為深色模式'"
      :aria-pressed="isDark"
      @click="toggleTheme"
    >
      <ElIcon>
        <Sunny v-if="isDark" />
        <Moon v-else />
      </ElIcon>
    </ElButton>
  </ElTooltip>
</template>

<script setup lang="ts">
import { Moon, Sunny } from '@element-plus/icons-vue'
import { useTheme } from '@/composables/useTheme'

const { isDark, toggleTheme } = useTheme()
</script>


<style scoped lang="scss">
.theme-toggle {
  color: var(--color-text);
  transition:
    color var(--transition-fast),
    background-color var(--transition-fast);

  &:hover {
    color: var(--color-primary);
    background-color: var(--color-primary-soft);
  }
}
</style>
