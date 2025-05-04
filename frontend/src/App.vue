<template>
  <div id="app-container">
    <nav v-if="authStore.isAuthenticated" class="bg-gray-800 p-4 text-white mb-6 shadow-md">
      <div class="container mx-auto flex justify-between items-center">
        <span class="font-semibold text-xl tracking-tight">Gestión Citas</span>
        <div class="space-x-4">
          <RouterLink
            to="/"
            class="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
            active-class="bg-gray-900"
          >
            Citas
          </RouterLink>
          <RouterLink
            to="/patients"
            class="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
            active-class="bg-gray-900"
          >
            Pacientes
          </RouterLink>
          <RouterLink
            to="/dashboard"
            class="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
            active-class="bg-gray-900"
          >
            Dashboard
          </RouterLink>
          <button @click="handleLogout" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
            Salir
          </button>
        </div>
      </div>
    </nav>

    <main class="container mx-auto px-4 pb-8">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth';

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
/* Estilos globales o importación de main.css */
/* Asegúrate que main.css importe Tailwind */
</style>