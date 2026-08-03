<template>
  <ElButton
    class="app-button"
    :type="type"
    :size="size"
    :loading="loading"
    :disabled="disabled"
    :plain="plain"
    :round="round"
    :circle="circle"
    :text="text"
    :link="link"
    :native-type="nativeType"
    @click="handleClick"
  >
    <slot />
  </ElButton>
</template>

<script setup lang="ts">
import type { ButtonProps } from 'element-plus'

interface Props {
  type?: ButtonProps['type']
  size?: ButtonProps['size']
  nativeType?: ButtonProps['nativeType']
  loading?: boolean
  disabled?: boolean
  plain?: boolean
  round?: boolean
  circle?: boolean
  text?: boolean
  link?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'primary',
  size: 'default',
  nativeType: 'button',
  loading: false,
  disabled: false,
  plain: false,
  round: false,
  circle: false,
  text: false,
  link: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function handleClick(event: MouseEvent) {
  emit('click', event)
}
</script>

<style scoped lang="scss">
.app-button {
  font-weight: 600;
  transition:
    color var(--transition-fast),
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    opacity var(--transition-fast);
}
</style>
