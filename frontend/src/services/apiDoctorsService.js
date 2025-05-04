// src/services/apiDoctorsService.js
import apiClient from './apiClient';

/**
 * Obtiene la lista de todos los doctores.
 * @returns {Promise<Array>} - Promesa que resuelve con el array de doctores.
 */
export const getDoctors = async () => {
  try {
    const response = await apiClient.get('/doctors');
    return response.data;
  } catch (error) {
    console.error("Error en servicio getDoctors:", error.response || error.message);
    throw error.response?.data || { message: 'Error al obtener los doctores.' };
  }
};

export default {
    getDoctors,
};