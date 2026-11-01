import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Same-origin proxy for local development. MySQL/FastAPI deployment is unchanged.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true }
    }
  }
})
