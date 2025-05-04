// src/services/apiAuthService.js
import axios from 'axios'; // Necesitarás instalar axios: npm install axios

// Lee la URL base de tu API desde las variables de entorno de Vite
// Asegúrate de tener VITE_API_BASE_URL en tu archivo .env del frontend
// ej: VITE_API_BASE_URL=http://127.0.0.1:5000/api/v1
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api/v1'; // Valor por defecto por si acaso

// Crear una instancia de Axios preconfigurada para tu API
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    // Podrías añadir otros headers por defecto si fueran necesarios
  }
});

/**
 * Llama al endpoint de login del backend.
 * @param {object} credentials - Objeto con email y password.
 * @returns {Promise<object>} - Promesa que resuelve con los datos de sesión/usuario o rechaza con error.
 */
export const loginUser = async (credentials) => {
  try {
    // Realiza la petición POST a la ruta relativa '/auth/login'
    const response = await apiClient.post('/auth/login', credentials);
    // Devuelve los datos de la respuesta exitosa (token, user info)
    return response.data;
  } catch (error) {
    // Loguea el error para depuración
    console.error("Error en servicio loginUser:", error.response || error.message);
    // Relanza el error para que el componente Vue (LoginView) lo capture y muestre un mensaje
    // Intenta devolver el mensaje de error del backend si existe
    throw error.response?.data || { message: 'Error de conexión o del servidor al intentar iniciar sesión.' };
  }
};

// --- Funciones Adicionales (Ejemplos - A implementar si se necesitan) ---

/**
 * Llama al endpoint de logout del backend.
 * Requiere el token actual para invalidar la sesión correcta en el backend.
 * @param {string} token - El access_token actual.
 * @returns {Promise<object>} - Promesa que resuelve en logout exitoso.
 */
// export const logoutUser = async (token) => {
//   try {
//     const response = await apiClient.post('/auth/logout', null, { // Logout no suele llevar body
//       headers: {
//         'Authorization': `Bearer ${token}` // Enviar token para invalidar sesión
//       }
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Error en servicio logoutUser:", error.response || error.message);
//     throw error.response?.data || { message: 'Error de conexión o del servidor al intentar cerrar sesión.' };
//   }
// }

// Exportar las funciones que necesites usar en tus componentes
export default {
  loginUser,
  // logoutUser // Exportar si la implementas
};

