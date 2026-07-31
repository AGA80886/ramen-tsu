// useDark.ts
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark({
  storageKey: 'ramen-tsu-theme',
})

const toggleDark = useToggle(isDark)

export function useDarkMode() {
  return {
    isDark,
    toggleDark,
  }
}
