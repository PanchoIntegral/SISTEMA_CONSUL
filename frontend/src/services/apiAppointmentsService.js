import apiClient from './apiClient'; // Importar la instancia configurada de Axios

/**
 * Obtiene las citas con filtros opcionales.
 * @param {object} filters - Objeto con filtros { date, status, doctor_id, patient_name }.
 * @returns {Promise<Array>} - Promesa que resuelve con el array de citas.
 */
export const getAppointments = async (filters = {}) => {
  try {
    // El interceptor de apiClient añadirá el token automáticamente
    const response = await apiClient.get('/appointments', {
      params: filters // Pasar todos los filtros como query parameters
    });
    return response.data; // Devuelve el array de citas
  } catch (error) {
    console.error("Error en servicio getAppointments:", error.response || error.message);
    throw error.response?.data || { message: 'Error al obtener las citas.' };
  }
};

/**
 * Actualiza el estado (y otros campos) de una cita.
 * @param {number} id - ID de la cita a actualizar.
 * @param {object} updateData - Objeto con los campos a actualizar (ej. { status: 'En Espera' }).
 * @returns {Promise<object>} - Promesa que resuelve con la cita actualizada.
 */
export const updateAppointment = async (id, updateData) => {
    try {
        // El interceptor añade el token
        const response = await apiClient.put(`/appointments/${id}`, updateData);
        return response.data;
    } catch (error) {
        console.error(`Error en servicio updateAppointment (ID: ${id}):`, error.response || error.message);
        throw error.response?.data || { message: 'Error al actualizar la cita.' };
    }
};

/**
 * Crea una nueva cita.
 * @param {object} appointmentData - Datos de la cita ({ patient_id, doctor_id, appointment_time, notes }).
 * @returns {Promise<object>} - Promesa que resuelve con la cita creada.
 */
export const createAppointment = async (appointmentData) => {
  try {
      const response = await apiClient.post('/appointments', appointmentData);
      return response.data;
  } catch (error) {
      console.error("Error en servicio createAppointment:", error.response || error.message);
      throw error.response?.data || { message: 'Error al crear la cita.' };
  }
};
/**
 * Elimina una cita existente.
 * @param {number} id - ID de la cita a eliminar.
 * @returns {Promise<boolean>} - Promesa que resuelve con true cuando la cita ha sido eliminada.
 */
export const deleteAppointment = async (id) => {
  try {
      await apiClient.delete(`/appointments/${id}`);
      return true; // Éxito (no hay datos que devolver en una eliminación)
  } catch (error) {
      console.error(`Error en servicio deleteAppointment (ID: ${id}):`, error.response || error.message);
      throw error.response?.data || { message: 'Error al eliminar la cita.' };
  }
};

// Exportar las funciones
export default {
  getAppointments,
  updateAppointment,
  createAppointment,
  deleteAppointment
};