import { computed } from 'vue'
import { useDarkMode } from './useDark'

export type Theme = 'light' | 'dark'

export function useTheme() {
  const { isDark, toggleDark } = useDarkMode()

  const theme = computed<Theme>(() =>
    isDark.value ? 'dark' : 'light',
  )

  function setTheme(value: Theme): void {
    isDark.value = value === 'dark'
    document.documentElement.dataset.theme = value
  }

  function toggleTheme(): void {
    toggleDark()
    document.documentElement.dataset.theme =
      isDark.value ? 'dark' : 'light'
  }

  function initTheme(): void {
    document.documentElement.dataset.theme = theme.value
  }

  return {
    theme,
    isDark,
    toggleTheme,
    setTheme,
    initTheme,
  }
}
