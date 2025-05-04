import axios from 'axios';
import { useAuthStore } from '@/stores/auth'; // Importar store para obtener token

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
  (error) => {
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
      switch (error.response.status) {
        case 401:
          error.message = 'No autorizado. Por favor, inicia sesión nuevamente.';
          break;
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
          error.message = error.response.data.message || 'Ha ocurrido un error inesperado.';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;