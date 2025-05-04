import { createApp } from 'vue'
import { createPinia } from 'pinia' // Importar Pinia

import App from './App.vue'
import router from './router' // Importar configuración del router

import './assets/main.css' // Importar CSS principal con Tailwind

const app = createApp(App)

app.use(createPinia()) // Usar Pinia
app.use(router) // Usar Vue Router

app.mount('#app')