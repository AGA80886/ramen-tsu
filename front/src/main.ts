/**
 * main.ts
 *
 * Bootstraps the Vue application and registers global plugins.
 */

import { createApp } from 'vue'
import { PiniaColada } from '@pinia/colada'
import ElementPlus from 'element-plus'

import App from './App.vue'
import router from './router'

import { registerPlugins } from '@/plugins'
import { pinia } from '@/plugins/pinia'
import { initTheme } from '@/plugins/theme'

import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import '@/styles/main.scss'

const app = createApp(App)

initTheme()

app.use(ElementPlus)
app.use(pinia)
app.use(PiniaColada)

registerPlugins(app)

app.use(router)
app.mount('#app')
