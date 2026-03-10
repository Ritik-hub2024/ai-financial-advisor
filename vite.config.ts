import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  base: './',
  server: {
    host: '127.0.0.1',
    port: 3000
  },
  build: {
    assetsInlineLimit: 100000000,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
