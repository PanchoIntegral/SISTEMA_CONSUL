// vite.config.js
import { fileURLToPath, URL } from 'node:url' // Necesario para resolver rutas

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      // Aquí definimos que '@' equivale a la ruta './src'
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // Eliminamos la configuración explícita de PostCSS en Vite
  // ya que usaremos el archivo postcss.config.js
})