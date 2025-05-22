// src/services/apiDoctorsService.js
import apiClient from './apiClient';

/**
 * Obtiene la lista de todos los doctores.
 * @returns {Promise<Array>} - Promesa que resuelve con el array de doctores.
 */
export const getDoctors = async () => {
  try {
    const response = await apiClient.get('/doctors');
    // Verificar que la respuesta sea un array
    if (!response.data || !Array.isArray(response.data)) {
      console.error("Formato de respuesta inválido en getDoctors:", response.data);
      return [];
    }
    return response.data;
  } catch (error) {
    console.error("Error en servicio getDoctors:", error.response || error.message);
    // Convertir el error en un formato más amigable
    const errorMsg = error.response?.data?.message || error.message || 'Error al obtener los doctores.';
    throw { message: errorMsg };
  }
};

/**
 * Obtiene los días bloqueados para un doctor.
 * @param {string|number} doctorId - ID del doctor
 * @returns {Promise<Array>} - Promesa que resuelve con el array de días bloqueados
 */
export const getBlockedDays = async (doctorId) => {
  if (!doctorId) {
    throw { message: 'ID de doctor no proporcionado' };
  }

  try {
    const response = await apiClient.get(`/doctors/blocked-days?doctor_id=${doctorId}`);
    // Verificar que la respuesta sea un array
    if (!response.data || !Array.isArray(response.data)) {
      console.error("Formato de respuesta inválido en getBlockedDays:", response.data);
      return [];
    }
    return response.data;
  } catch (error) {
    console.error("Error en servicio getBlockedDays:", error.response || error.message);
    const errorMsg = error.response?.data?.message || error.message || 'Error al obtener días bloqueados.';
    throw { message: errorMsg };
  }
};

/**
 * Agrega un día bloqueado para un doctor.
 * @param {string|number} doctorId - ID del doctor
 * @param {string} blockedDate - Fecha a bloquear (formato YYYY-MM-DD)
 * @param {string} reason - Motivo del bloqueo
 * @returns {Promise<Object>} - Promesa que resuelve con los datos del día bloqueado creado
 */
export const addBlockedDay = async (doctorId, blockedDate, reason = 'No disponible') => {
  // Validaciones básicas
  if (!doctorId) throw { message: 'ID de doctor no proporcionado' };
  if (!blockedDate) throw { message: 'Fecha no proporcionada' };

  try {
    const response = await apiClient.post('/doctors/blocked-days', {
      doctor_id: doctorId,
      blocked_date: blockedDate,
      reason
    });
    
    if (!response.data || typeof response.data !== 'object') {
      throw { message: 'Respuesta inválida del servidor' };
    }

    return response.data;
  } catch (error) {
    console.error("Error en servicio addBlockedDay:", error.response || error.message);
    const errorMsg = error.response?.data?.message || error.message || 'Error al bloquear día.';
    throw { message: errorMsg };
  }
};

/**
 * Elimina un día bloqueado.
 * @param {string|number} blockedDayId - ID del día bloqueado a eliminar
 * @returns {Promise<Object>} - Promesa que resuelve con la confirmación de eliminación
 */
export const deleteBlockedDay = async (blockedDayId) => {
  if (!blockedDayId) {
    throw { message: 'ID de día bloqueado no proporcionado' };
  }

  try {
    const response = await apiClient.delete(`/doctors/blocked-days/${blockedDayId}`);
    return response.data;
  } catch (error) {
    console.error("Error en servicio deleteBlockedDay:", error.response || error.message);
    const errorMsg = error.response?.data?.message || error.message || 'Error al eliminar día bloqueado.';
    throw { message: errorMsg };
  }
};

export default {
    getDoctors,
    getBlockedDays,
    addBlockedDay,
    deleteBlockedDay
};