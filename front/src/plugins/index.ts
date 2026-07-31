import type { App } from 'vue'
import VueFileAgentNext from '@boindil/vue-file-agent-next'
import '@boindil/vue-file-agent-next/dist/vue-file-agent-next.css'

export function registerPlugins(app: App): void {
  app.use(VueFileAgentNext)
}
