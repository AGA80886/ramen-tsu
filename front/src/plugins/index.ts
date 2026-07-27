import type { App } from 'vue'
import VueFileAgentNext from '@boindil/vue-file-agent-next'
import { createPinia } from 'pinia'
import router from '../router'
import '@boindil/vue-file-agent-next/dist/vue-file-agent-next.css'

export function registerPlugins (app: App) {
  app.use(createPinia())
  app.use(router)
  app.use(VueFileAgentNext)
}
