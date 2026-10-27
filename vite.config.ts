import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/jobicy': {
        target: 'https://jobicy.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/jobicy/, '/api/jobs'),
      },
    },
  },
  preview: {
    proxy: {
      '/api/jobicy': {
        target: 'https://jobicy.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/jobicy/, '/api/jobs'),
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('/node_modules/')) return undefined
          if (/\/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react-vendor'
          if (/\/node_modules\/(react-router|react-router-dom|@remix-run)\//.test(id)) return 'router-vendor'
          if (/\/node_modules\/(framer-motion|motion-dom|motion-utils)\//.test(id)) return 'motion-vendor'
          if (/\/node_modules\/(react-hook-form|zod|@hookform)\//.test(id)) return 'forms-vendor'
          if (id.includes('/node_modules/lucide-react/')) return 'icons-vendor'
          if (/\/node_modules\/(zustand|axios)\//.test(id)) return 'data-vendor'
          return undefined
        },
      },
    },
  },
})
