import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
// Importar cliente Supabase si se usa para login/logout aquí
// import { supabase } from '@/supabaseClient'
// Importar servicio API si se usa el backend para login/logout
// import authService from '@/services/apiAuthService' // (Hay que crear este servicio)

export const useAuthStore = defineStore('auth', () => {
  // Estado (usando ref para reactividad)
  // Intentar cargar desde localStorage al inicio
  const sessionData = ref(JSON.parse(localStorage.getItem('authSession') || 'null'))
  const user = computed(() => sessionData.value?.user || null)
  const token = computed(() => sessionData.value?.access_token || null)
  const isAuthenticated = computed(() => !!token.value)

  // Acciones
  function setAuth(newSessionData) {
    sessionData.value = newSessionData
    if (newSessionData) {
      localStorage.setItem('authSession', JSON.stringify(newSessionData))
      // Guardar el token específico de Supabase que usa supabase-js para la sesión
      localStorage.setItem('sb-auth-token', JSON.stringify({
          access_token: newSessionData.access_token,
          refresh_token: newSessionData.refresh_token,
          // Supabase-js puede necesitar más campos, revisar su documentación
      }))
    } else {
      localStorage.removeItem('authSession')
      localStorage.removeItem('sb-auth-token') // Asegurarse de limpiar ambos
    }
  }

  function clearAuth() {
    setAuth(null)
    // Aquí podrías llamar a la API de logout si es necesario
    // await authService.logout(); // Ejemplo
  }

  // async function login(email, password) {
  //   // Lógica para llamar a la API de login (backend o Supabase directo)
  //   // const response = await authService.login({ email, password });
  //   // if (response) {
  //   //   setAuth(response); // Guardar sesión/token
  //   // }
  //   // Manejar errores...
  // }

  // Devolver estado y acciones
  return { user, token, isAuthenticated, setAuth, clearAuth }
})