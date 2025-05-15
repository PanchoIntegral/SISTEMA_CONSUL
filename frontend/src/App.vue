<template>
  <div id="app-container" class="flex flex-col min-h-screen bg-white dark:bg-dark text-navy dark:text-dark-primary transition-colors duration-300">
    <nav v-if="authStore.isAuthenticated" class="bg-navy dark:bg-dark-elevated text-white shadow-sm dark:shadow-dark-sm border-b-0 dark:border-b dark:border-dark-border sticky top-0 z-50 rounded-b-md">
      <div class="container mx-auto flex flex-col sm:flex-row justify-between items-center px-5 py-3">
        <div class="flex items-center mb-4 sm:mb-0">
          <div class="flex items-center">
            <span class="font-bold text-2xl mr-1 text-white dark:text-white">Health</span>
            <span class="font-bold text-2xl text-accent dark:text-secondary">Flow</span>
          </div>
          <span class="ml-3 text-xs font-medium tracking-wider text-gray-200 dark:text-gray-300 uppercase">INNOVACIÓN EN GESTIÓN CLÍNICA</span>
        </div>
        <div class="flex flex-wrap justify-center gap-4 sm:gap-2 items-center">
          <div class="flex space-x-4">
            <RouterLink
              to="/"
              class="px-4 py-2 text-sm font-medium hover:bg-white hover:bg-opacity-10 dark:hover:bg-white dark:hover:bg-opacity-5 transition-all duration-200 relative flex items-center rounded-lg"
              :class="{ 'nav-active': $route.path === '/' }"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Citas
            </RouterLink>
            <RouterLink
              to="/patients"
              class="px-4 py-2 text-sm font-medium hover:bg-white hover:bg-opacity-10 dark:hover:bg-white dark:hover:bg-opacity-5 transition-all duration-200 relative flex items-center rounded-lg"
              :class="{ 'nav-active': $route.path === '/patients' }"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Pacientes
            </RouterLink>
            <RouterLink
              to="/dashboard"
              class="px-4 py-2 text-sm font-medium hover:bg-white hover:bg-opacity-10 dark:hover:bg-white dark:hover:bg-opacity-5 transition-all duration-200 relative flex items-center rounded-lg"
              :class="{ 'nav-active': $route.path === '/dashboard' }"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Dashboard
            </RouterLink>
          </div>
          <div class="h-6 w-px bg-white bg-opacity-20 dark:bg-dark-border-light mx-3 hidden sm:block"></div>
          <div class="flex items-center space-x-3">
            <DarkModeSwitch class="rounded-full" />
            <button @click="showLogoutConfirm = true" class="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 transition-all duration-200 dark:bg-dark-danger dark:hover:bg-red-700 flex items-center rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Salir
            </button>
          </div>
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
        <p class="text-sm texto-muted dark:texto-muted">© 2025 HealthFlow - Innovación en Gestión Clínica</p>
      </div>
    </footer>

    <!-- Diálogo de confirmación para cerrar sesión -->
    <ConfirmDialog
      :show="showLogoutConfirm"
      title="Cerrar Sesión"
      message="¿Estás seguro de que deseas cerrar sesión?"
      confirm-text="Aceptar"
      cancel-text="Cancelar"
      @confirm="handleLogoutConfirmed"
      @cancel="showLogoutConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth';
import DarkModeSwitch from '@/components/DarkModeSwitch.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

const authStore = useAuthStore();
const router = useRouter();
const showLogoutConfirm = ref(false);

const handleLogoutConfirmed = () => {
    console.log("Cerrando sesión...");
    authStore.clearAuth();
    router.push({ name: 'login' });
    showLogoutConfirm.value = false;
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

/* Navegación activa con estilo minimalista */
.nav-active {
  background-color: rgba(255, 255, 255, 0.1);
  font-weight: 500;
  color: white !important;
  border-radius: 0.5rem;
}

.dark .nav-active {
  background-color: rgba(255, 255, 255, 0.08);
  font-weight: 500;
  color: white !important;
  border-radius: 0.5rem;
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