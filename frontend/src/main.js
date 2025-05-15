import { createApp } from 'vue'
import { createPinia } from 'pinia' // Importar Pinia

import App from './App.vue'
import router from './router' // Importar configuración del router

import './assets/main.css' // Importar CSS principal con Tailwind
import './assets/darkmode.css' // Importar CSS para modo oscuro
import './assets/appointment-cards-fix.css' // Importar fix para tarjetas de citas
import './assets/modal-dark-fix.css' // Importar fix para modales en modo oscuro

// Inicializar el modo oscuro si está guardado en localStorage
const initializeDarkMode = () => {
  if (localStorage.getItem('darkMode') === 'true' || 
      (localStorage.getItem('darkMode') === null && 
       window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
};

// Ejecutar antes de montar la aplicación
initializeDarkMode();

const app = createApp(App)

app.use(createPinia()) // Usar Pinia
app.use(router) // Usar Vue Router

app.mount('#app')