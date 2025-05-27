import axios from 'axios';
import { useAuthStore } from '@/stores/auth'; // Importar store para obtener token
import { supabase } from '@/supabaseClient'; // Import Supabase client
import router from '@/router'; // Import router for redirection

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // Timeout global de 15 segundos
  // Configuración para reintentos en caso de fallos
  retry: 2,
  retryDelay: 1000
});

// Interceptor para añadir el token de autorización a CADA petición
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore(); // Obtener store DENTRO del interceptor
    const token = authStore.token; // Obtener token del estado de Pinia
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Error en la solicitud HTTP:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => {
    // Procesar respuesta exitosa
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    // Manejar errores de respuesta
    if (error.code === 'ECONNABORTED') {
      console.error('Tiempo de espera agotado:', error);
      error.message = 'La solicitud ha tardado demasiado tiempo. Por favor, inténtalo de nuevo.';
    } else if (error.message === 'Network Error') {
      console.error('Error de red:', error);
      error.message = 'Error de conexión. Verifica tu conexión a internet o que el servidor esté en funcionamiento.';
    } else if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      console.error(`Error ${error.response.status}:`, error.response.data);
      
      // Personalizar mensajes según el código de estado
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true; // Mark the request as retried
        const authStore = useAuthStore();
        try {
          console.log("Attempting to refresh token...");
          const { data: sessionData, error: refreshError } = await supabase.auth.refreshSession();

          if (refreshError || !sessionData || !sessionData.session) {
            console.error("Failed to refresh token:", refreshError?.message || "No session data");
            authStore.clearAuth();
            router.push({ name: 'login' }); // Redirect to login
            return Promise.reject(refreshError || new Error('Failed to refresh token'));
          }
          
          console.log("Token refreshed successfully. New session:", sessionData.session);
          
          // Update the auth store and localStorage with the new session
          // Ensure the structure matches what setAuth expects (access_token, refresh_token, user)
          const newAuthData = {
            access_token: sessionData.session.access_token,
            refresh_token: sessionData.session.refresh_token,
            user: sessionData.session.user,
            // Include other necessary fields if your setAuth expects them
            // expires_at: sessionData.session.expires_at, 
            // expires_in: sessionData.session.expires_in,
          };
          authStore.setAuth(newAuthData);
          
          // Update the authorization header for the original request
          originalRequest.headers['Authorization'] = `Bearer ${sessionData.session.access_token}`;
          
          // Retry the original request
          console.log("Retrying original request with new token.");
          return apiClient(originalRequest);

        } catch (e) {
          console.error("Error during token refresh attempt:", e);
          authStore.clearAuth();
          router.push({ name: 'login' }); // Redirect to login on any failure
          return Promise.reject(e);
        }
      } else if (error.response.status === 401 && originalRequest._retry) {
         // If refresh attempt also fails with 401 or it's a second 401
         console.warn("Token refresh attempt failed or request already retried. Logging out.");
         const authStore = useAuthStore();
         authStore.clearAuth();
         router.push({ name: 'login' });
         error.message = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
      }
      
      if (error.response.status !== 401) { // Only use switch for non-401 errors now
        switch (error.response.status) {
            case 403:
              error.message = 'Acceso denegado. No tienes permisos para esta acción.';
              break;
            case 404:
              error.message = 'El recurso solicitado no existe.';
              break;
            case 500:
              error.message = 'Error interno del servidor. Por favor, intenta más tarde.';
              break;
            default:
              // Preserve original error message if it exists and is more specific
              error.message = error.response?.data?.message || error.message || 'Ha ocurrido un error inesperado.';
          }
      }
    } else if (!error.message) { // Fallback for errors without a response object
        error.message = 'Ha ocurrido un error inesperado.';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;