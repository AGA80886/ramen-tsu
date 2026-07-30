/**
 * main.ts
 *
 * Bootstraps the Vue application and registered plugins.
 */

// Composables
import { createApp } from 'vue'
import ElementPlus from 'element-plus'

import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

const app = createApp(App)

registerPlugins(app)

app.mount('#app')
app.use(ElementPlus)
