import { AxiosError } from 'axios'
import { ElMessage } from 'element-plus'
import { defineStore } from 'pinia'

export type SnackbarColor =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
export interface SnackbarMessage {
  text: string
  color?: SnackbarColor
}

export const useSnackbarStore = defineStore('snackbar', () => {
  const add = (message: SnackbarMessage) => {
    const type = message.color === 'success'
      ? 'success'
      : message.color === 'error'
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
