import { useTheme } from '@/composables/useTheme'

let initialized = false

export function initTheme() {
  if (initialized) return

  const { initTheme } = useTheme()

  initTheme()
  initialized = true
}
