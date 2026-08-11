import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
  server: {
    proxy: {
      // Student Analyst dashboard calls the NestJS API in server/backend
      // (see server/README.md — run it with `npm run start:dev` there).
      '/api': {
        target: process.env.VITE_STUDENT_API_URL ?? 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
