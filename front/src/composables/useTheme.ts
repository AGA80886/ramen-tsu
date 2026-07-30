import { useDark } from '@vueuse/core'

const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: 'light',
  storageKey: 'ramen-tsu-theme',
})

export function useTheme() {
  function toggleDark() {
    isDark.value = !isDark.value
  }

  return {
    isDark,
    toggleDark,
  }
}
