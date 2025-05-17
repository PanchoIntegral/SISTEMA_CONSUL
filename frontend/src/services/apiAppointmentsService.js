import apiClient from './apiClient'; // Importar la instancia configurada de Axios

/**
 * Obtiene las citas con filtros opcionales.
 * @param {object} filters - Objeto con filtros { date, status, doctor_id, patient_name, exclude_statuses, include_statuses }.
 * @returns {Promise<Array>} - Promesa que resuelve con el array de citas.
 */
export const getAppointments = async (filters = {}) => {
  try {
    // Crear copia de los filtros para no modificar el objeto original
    const queryParams = { ...filters };
    
    // Procesamos el array exclude_statuses para el formato correcto en la API
    if (filters.exclude_statuses && Array.isArray(filters.exclude_statuses)) {
      // Convertir el array a múltiples parámetros con el mismo nombre
      delete queryParams.exclude_statuses; // Eliminar el array del objeto
      queryParams['exclude_statuses[]'] = filters.exclude_statuses; // Agregar con el formato correcto
    }
    
    // Procesamos el array include_statuses para el formato correcto en la API
    if (filters.include_statuses && Array.isArray(filters.include_statuses)) {
      // Convertir el array a múltiples parámetros con el mismo nombre
      delete queryParams.include_statuses; // Eliminar el array del objeto
      queryParams['include_statuses[]'] = filters.include_statuses; // Agregar con el formato correcto
    }
    
    // El interceptor de apiClient añadirá el token automáticamente
    const response = await apiClient.get('/appointments', {
      params: queryParams
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
        // Verificar si es un error de doctor no disponible
        if (error.response?.status === 409 && error.response?.data?.error_type === 'doctor_unavailable') {
            throw {
                message: error.response.data.message || 'El doctor seleccionado ya tiene una cita programada en este horario.',
                error_type: 'doctor_unavailable',
                conflict_time: error.response.data.conflict_time
            };
        }
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
      // Verificar si es un error de doctor no disponible
      if (error.response?.status === 409 && error.response?.data?.error_type === 'doctor_unavailable') {
          throw {
              message: error.response.data.message || 'El doctor seleccionado ya tiene una cita programada en este horario.',
              error_type: 'doctor_unavailable',
              conflict_time: error.response.data.conflict_time
          };
      }
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