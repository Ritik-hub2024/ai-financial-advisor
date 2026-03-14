import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/ai-financial-advisor/',
  plugins: [react()],
  server: {
    port: 3000
  }
})
