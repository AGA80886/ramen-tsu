import { fileURLToPath, URL } from 'node:url'
import Vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import Layouts from 'vite-plugin-vue-layouts-next'
import VueRouter from 'vue-router/vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/ramen-tsu/',
  plugins: [
    VueRouter({ dts: 'src/typed-router.d.ts' }),
    Vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    Layouts(),
  ],
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  },
  server: {
    port: 3000,
  },
})
