<template>
  <ElDialog
    v-model="visible"
    class="app-dialog"
    :title="title"
    :width="width"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :destroy-on-close="destroyOnClose"
    :align-center="alignCenter"
    @closed="emit('closed')"
  >
    <slot />

    <template
      v-if="showFooter"
      #footer
    >
      <slot name="footer">
        <div class="app-dialog__footer">
          <AppButton
            type="info"
            plain
            :disabled="confirmLoading"
            @click="handleCancel"
          >
            {{ cancelText }}
          </AppButton>

          <AppButton
            :type="confirmType"
            :loading="confirmLoading"
            @click="emit('confirm')"
          >
            {{ confirmText }}
          </AppButton>
        </div>
      </slot>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import type { ButtonProps } from 'element-plus'

interface Props {
  title?: string
  width?: string | number
  confirmText?: string
  cancelText?: string
  confirmType?: ButtonProps['type']
  confirmLoading?: boolean
  showFooter?: boolean
  closeOnClickModal?: boolean
  closeOnPressEscape?: boolean
  destroyOnClose?: boolean
  alignCenter?: boolean
}

withDefaults(defineProps<Props>(), {
  title: '',
  width: '500px',
  confirmText: '確認',
  cancelText: '取消',
  confirmType: 'primary',
  confirmLoading: false,
  showFooter: true,
  closeOnClickModal: false,
  closeOnPressEscape: true,
  destroyOnClose: true,
  alignCenter: true,
})

const visible = defineModel<boolean>({
  default: false,
})

const emit = defineEmits<{
  confirm: []
  cancel: []
  closed: []
}>()

function handleCancel() {
  visible.value = false
  emit('cancel')
}
</script>

<style scoped lang="scss">
.app-dialog {
  &__footer {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
  }
}
</style>
