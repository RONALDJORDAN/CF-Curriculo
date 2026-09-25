import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  // Mescla: mantém os HTMLs atuais como entradas (MPA).
  // O React monta por cima via <script type="module" src="/src/site.jsx"> etc.
  // Vanilla site.js / criar.js continuam como fallback até migração total.
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        modelos: resolve(__dirname, 'modelos.html'),
        sobre: resolve(__dirname, 'sobre.html'),
        criar: resolve(__dirname, 'criar.html'),
      },
    },
  },
  server: { port: 5173 },
})
