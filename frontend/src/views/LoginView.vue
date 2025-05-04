<template>
  <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
        Iniciar sesión
      </h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form class="space-y-6" @submit.prevent="handleLogin">
        <div>
          <label for="email" class="block text-sm font-medium leading-6 text-gray-900">Email</label>
          <div class="mt-2">
            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              placeholder="tu@email.com"
              class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-2"
            />
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between">
            <label for="password" class="block text-sm font-medium leading-6 text-gray-900">Contraseña</label>
            </div>
          <div class="mt-2">
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              placeholder="Tu contraseña"
              class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-2"
            />
          </div>
        </div>

        <div v-if="errorMessage" class="mt-4 text-center text-sm text-red-600" role="alert">
          {{ errorMessage }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isLoading">Ingresando...</span>
            <span v-else>Iniciar Sesión</span>
          </button>
        </div>
      </form>

      </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth'; // Importar store de Pinia
import { loginUser } from '@/services/apiAuthService'; // Importar servicio API

// --- Estado Reactivo ---
// Variables para enlazar con los inputs del formulario
const email = ref('');
const password = ref('');
// Variable para mostrar mensajes de error al usuario
const errorMessage = ref('');
// Variable para deshabilitar el botón mientras se procesa el login
const isLoading = ref(false);

// --- Instancias ---
// Hook de Vue Router para poder redirigir
const router = useRouter();
// Hook de Pinia para acceder al store de autenticación
const authStore = useAuthStore();

// --- Métodos ---
/**
 * Maneja el evento de envío del formulario de login.
 */
const handleLogin = async () => {
  // Indicar que la operación está en curso y limpiar errores
  isLoading.value = true;
  errorMessage.value = '';

  try {
    // Llamar a la función del servicio que contacta al backend
    const sessionData = await loginUser({
      email: email.value,
      password: password.value,
    });

    // Si la llamada fue exitosa (no lanzó error), guardar la sesión
    authStore.setAuth(sessionData); // <-- Guarda token y datos de usuario en Pinia/localStorage

    // Redirigir al usuario al dashboard principal (ruta nombrada 'appointments')
    // replace: true evita que el usuario pueda volver a la página de login con el botón "atrás" del navegador
    router.replace({ name: 'appointments' });

  } catch (error) {
    // Si hubo un error en la llamada API (capturado desde el servicio)
    // Mostrar un mensaje de error genérico o el específico del backend
    errorMessage.value = error.message || 'Error al iniciar sesión. Verifica tus credenciales.';
    // También es útil loguear el error completo en la consola para depuración
    console.error('Login failed:', error);
  } finally {
    // Quitar el estado de carga, independientemente del resultado
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Estilos específicos para este componente si fueran necesarios */
/* Tailwind se aplica globalmente si está bien configurado */
</style>
