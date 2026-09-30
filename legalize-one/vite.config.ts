import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // O chunk do visualizador 3D (three + R3F + drei, ~270 KB gzip) só é baixado
    // depois do clique em "Explorar modelo 3D"; os demais chunks seguem bem abaixo disso.
    chunkSizeWarningLimit: 1100,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
