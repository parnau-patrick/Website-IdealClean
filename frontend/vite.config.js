import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const proxy = {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true,
  },
  '/socket.io': {
    target: 'http://localhost:5000',
    changeOrigin: true,
    ws: true,
  },
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server:  { proxy },  // npm run dev
  preview: { proxy },  // npm run preview (build)
})
