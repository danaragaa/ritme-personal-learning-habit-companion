import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('@ionic') || id.includes('ionicons') || id.includes('@stencil')) {
            return 'vendor-ionic'
          }
          if (
            id.includes('vue-router') ||
            id.includes('vue-i18n') ||
            id.includes('@intlify') ||
            id.includes('pinia') ||
            id.includes('/vue/') ||
            id.includes('\\vue\\') ||
            id.includes('@vue')
          ) {
            return 'vendor-vue'
          }
          if (id.includes('dexie') || id.includes('@capacitor')) {
            return 'vendor-storage'
          }
        },
      },
    },
  },
})
