import { createApp } from 'vue'
import { pinia } from '@/plugins/pinia'
import { PiniaColada } from '@pinia/colada'
import { registerPlugins } from '@/plugins'
import App from './App.vue'
import router from './router'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import '@/styles/main.scss'

import { initTheme } from '@/plugins/theme'

const app = createApp(App)

initTheme()
registerPlugins(app)

app.use(ElementPlus)
app.use(pinia)
app.use(PiniaColada)
app.use(router)
app.mount('#app')
