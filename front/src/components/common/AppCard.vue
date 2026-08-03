<template>
  <ElCard
    class="app-card"
    :shadow="shadow"
    :body-style="bodyStyle"
  >
    <template
      v-if="title || $slots.header || $slots.actions"
      #header
    >
      <div class="app-card__header">
        <slot name="header">
          <h2
            v-if="title"
            class="app-card__title"
          >
            {{ title }}
          </h2>
        </slot>

        <div
          v-if="$slots.actions"
          class="app-card__actions"
        >
          <slot name="actions" />
        </div>
      </div>
    </template>

    <slot />
  </ElCard>
</template>

<script setup lang="ts">
import type { CardProps } from 'element-plus'
import type { CSSProperties } from 'vue'

interface Props {
  title?: string
  shadow?: CardProps['shadow']
  bodyStyle?: CSSProperties
}

withDefaults(defineProps<Props>(), {
  title: '',
  shadow: 'never',
  bodyStyle: () => ({}),
})
</script>

<style scoped lang="scss">
.app-card {
  overflow: hidden;
  background-color: var(--color-surface);
  border-color: var(--color-border);
  border-radius: var(--radius-lg);
  transition:
    background-color var(--transition-normal),
    border-color var(--transition-normal),
    box-shadow var(--transition-fast);

  &__header {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
  }

  &__title {
    margin: 0;
    color: var(--color-heading);
    font-size: 1.125rem;
    font-weight: 700;
  }

  &__actions {
    display: flex;
    flex-shrink: 0;
    gap: 0.5rem;
    align-items: center;
  }
}
</style>
