import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer,
      ],
    },
  },
  server: {
    proxy: {
      '/ais-stream': {
        target: 'wss://stream.aisstream.io/v0/stream',
        ws: true,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/ais-stream/, ''),
        headers: {
          'Origin': 'https://stream.aisstream.io'
        }
      }
    }
  }
})
