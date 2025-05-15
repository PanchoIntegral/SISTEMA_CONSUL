<template>
  <div id="app-container" class="flex flex-col min-h-screen bg-white dark:bg-dark text-navy dark:text-dark-primary transition-colors duration-300">
    <nav v-if="authStore.isAuthenticated" class="bg-primary dark:bg-dark-surface text-white shadow-md dark:shadow-dark-sm border-b-0 dark:border-b dark:border-dark-border">
      <div class="container mx-auto flex flex-col sm:flex-row justify-between items-center px-5 py-4">
        <div class="flex items-center mb-4 sm:mb-0">
          <div class="flex items-center">
            <span class="font-bold text-xl mr-1 text-white dark:text-white">Health</span>
            <span class="font-bold text-xl text-accent dark:text-secondary">Flow</span>
          </div>
          <span class="ml-2 text-xs texto-secundario dark:texto-secundario">INNOVACIÓN EN GESTIÓN CLÍNICA</span>
        </div>
        <div class="flex flex-wrap justify-center gap-3 sm:gap-2 sm:space-x-3 items-center">
          <RouterLink
            to="/"
            class="px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-light dark:hover:bg-dark-elevated transition-all duration-200"
            active-class="bg-secondary dark:bg-secondary-dark text-white dark:border-secondary-dark dark:border-b-2"
          >
            Citas
          </RouterLink>
          <RouterLink
            to="/patients"
            class="px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-light dark:hover:bg-dark-elevated transition-all duration-200"
            active-class="bg-secondary dark:bg-secondary-dark text-white dark:border-secondary-dark dark:border-b-2"
          >
            Pacientes
          </RouterLink>
          <RouterLink
            to="/dashboard"
            class="px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-light dark:hover:bg-dark-elevated transition-all duration-200"
            active-class="bg-secondary dark:bg-secondary-dark text-white dark:border-secondary-dark dark:border-b-2"
          >
            Dashboard
          </RouterLink>
          <div class="h-6 w-px bg-gray-600 dark:bg-dark-border-light mx-1 hidden sm:block"></div>
          <DarkModeSwitch class="mx-2" />
          <button @click="handleLogout" class="px-4 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 transition-all duration-200 dark:bg-dark-danger dark:hover:bg-red-700 shadow-sm dark:shadow-dark-sm">
            Salir
          </button>
        </div>
      </div>
    </nav>

    <main class="container mx-auto px-5 py-6 flex-grow theme-transition dark:bg-dark">
      <RouterView />
    </main>

    <footer class="bg-navy dark:bg-dark-elevated text-white py-4 mt-auto border-t-0 dark:border-t dark:border-dark-border shadow-none dark:shadow-dark-sm">
      <div class="container mx-auto px-5 text-center">
        <div class="flex justify-center items-center mb-2">
          <span class="font-bold text-xl mr-1 text-white dark:text-white">Health</span>
          <span class="font-bold text-xl text-accent dark:text-secondary">Flow</span>
        </div>
        <p class="text-sm texto-muted dark:texto-muted">© 2023 HealthFlow - Innovación en Gestión Clínica</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth';
import DarkModeSwitch from '@/components/DarkModeSwitch.vue';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        console.log("Cerrando sesión...");
        authStore.clearAuth();
        router.push({ name: 'login' });
        
    }
};
</script>

<style>
/* Estilos globales */
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #1A2A47;
  background-color: #f8f9fa;
  margin: 0;
  padding: 0;
  min-height: 100vh;
  transition: background-color 0.3s ease, color 0.3s ease;
}

html, body {
  height: 100%;
}

/* Mejoras para modo oscuro */
.dark body {
  background-color: #1A1A2E;
  color: #FFFFFF;
}

/* Textos en modo oscuro más legibles */
.dark h1, .dark h2, .dark h3 {
  color: #F0F4FF;
}

.dark p, .dark div, .dark span {
  color: #FFFFFF;
}

/* Clases de texto personalizadas */
.texto-muted {
  color: #6B7280;
}

.texto-secundario {
  color: #6B7280;
}

.texto-pequeno {
  font-size: 0.75rem;
  color: #6B7280;
}

.texto-nota {
  font-size: 0.75rem;
  font-style: italic;
  color: #6B7280;
}

/* Asegurar que los enlaces sean visibles */
.dark a {
  color: #00A286;
}

.dark a:hover {
  color: #00C7A0;
}

/* Mejora en los botones */
.dark button:not(.custom-button) {
  @apply bg-dark-button text-white border-dark-border;
}

/* Gradient para elementos de acento */
.brand-gradient {
  background: linear-gradient(90deg, #0F5FA3 0%, #00C7A0 50%, #19E8B5 100%);
}

.dark .brand-gradient {
  background: linear-gradient(90deg, #15254D 0%, #00A286 50%, #16C99D 100%);
}

/* Media queries para responsive */
@media (max-width: 640px) {
  .container {
    width: 100%;
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

/* Eliminamos el outline por defecto y lo reemplazamos por uno más acorde al tema */
:focus {
  outline: none;
}

:focus-visible {
  outline: 2px solid #00C7A0;
}

.dark :focus-visible {
  outline: 2px solid #00A286;
}

/* Mejoras específicas para interfaces de citas */
.dark .cita-card,
.dark .tarjeta-cita,
.dark .appointment-card {
  @apply bg-dark-card border-dark-border shadow-dark-card;
  background-image: linear-gradient(to right, rgba(0,0,0,0), rgba(80, 95, 150, 0.05));
  border-left: 4px solid theme('colors.secondary.dark');
}

/* Mejoras para enlaces activos en modo oscuro */
.dark .router-link-active {
  position: relative;
}

.dark .router-link-active::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: theme('colors.secondary.dark');
}

/* Mejorar la visibilidad de elementos recurrentes */
.dark .recurrente,
.dark .recurring {
  @apply bg-secondary-dark/30 text-white font-medium;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  padding: 2px 8px;
  border-radius: 12px;
}

.dark .status-badge {
  @apply font-medium;
  border: 1px solid rgba(255,255,255,0.1);
}
</style>