import { AxiosError } from 'axios'
import { ElMessage } from 'element-plus'
import { defineStore } from 'pinia'

export interface SnackbarMessage {
  text: string
  color?: 'green' | 'red' | 'warning' | 'info' | string
}

export const useSnackbarStore = defineStore('snackbar', () => {
  const add = (message: SnackbarMessage) => {
    const type = message.color === 'green'
      ? 'success'
      : message.color === 'red'
        ? 'error'
        : message.color === 'warning'
          ? 'warning'
          : 'info'

    ElMessage({ message: message.text, type })
  }

  const addError = (error: unknown) => {
    let text = '發生錯誤'
    if (error instanceof AxiosError) {
      text = error.response?.data?.message || '發生錯誤'
    }
    ElMessage.error(text)
  }

  return { add, addError }
})
