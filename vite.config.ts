import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3005,
    host: true,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
}) 