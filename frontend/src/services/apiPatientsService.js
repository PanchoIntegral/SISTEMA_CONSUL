import apiClient from './apiClient';

export const getPatients = async (searchTerm = '') => {
  try {
    const params = {
      page: 1,
      page_size: 100,
      ...(searchTerm && { search: searchTerm })
    };
    const response = await apiClient.get('/patients', { params });
    return response.data; // El backend devuelve {data: [], pagination: {}}
  } catch (error) {
    console.error("Error en servicio getPatients:", error.response || error.message);
    throw error.response?.data || { message: 'Error al obtener los pacientes.' };
  }
};

export const createPatient = async (patientData) => {
    try {
        const response = await apiClient.post('/patients', patientData);
        return response.data;
    } catch (error) {
        console.error("Error en servicio createPatient:", error.response || error.message);
        throw error.response?.data || { message: 'Error al crear el paciente.' };
    }
};

/**
 * Actualiza un paciente existente.
 * @param {number} id - ID del paciente a actualizar.
 * @param {object} patientData - Datos a actualizar.
 * @returns {Promise<object>} - Promesa que resuelve con el paciente actualizado.
 */
export const updatePatient = async (id, patientData) => {
    try {
        const response = await apiClient.put(`/patients/${id}`, patientData);
        return response.data;
    } catch (error) {
        console.error(`Error en servicio updatePatient (ID: ${id}):`, error.response || error.message);
        throw error.response?.data || { message: 'Error al actualizar el paciente.' };
    }
};

/**
 * Elimina un paciente.
 * @param {number} id - ID del paciente a eliminar.
 * @returns {Promise<void>} - Promesa que resuelve si la eliminación es exitosa.
 */
export const deletePatient = async (id) => {
    try {
        // DELETE no suele devolver contenido, solo status 204
        await apiClient.delete(`/patients/${id}`);
    } catch (error) {
        console.error(`Error en servicio deletePatient (ID: ${id}):`, error.response || error.message);
        throw error.response?.data || { message: 'Error al eliminar el paciente.' };
    }
};

export const getPaginatedPatients = async (page = 1, pageSize = 10, searchTerm = '') => {
  try {
    const params = {
      page,
      page_size: pageSize,
      ...(searchTerm && { search: searchTerm })
    };
    const response = await apiClient.get('/patients', { params });
    return response.data;
  } catch (error) {
    console.error("Error en servicio getPaginatedPatients:", error.response || error.message);
    throw error.response?.data || { message: 'Error al obtener los pacientes paginados.' };
  }
};

/**
 * Obtiene todos los pacientes sin paginación.
 * @param {string} searchTerm - Término de búsqueda opcional.
 * @returns {Promise<object>} - Promesa que resuelve con todos los pacientes.
 */
export const getAllPatients = async (searchTerm = '') => {
  try {
    const params = {
      page: 1,
      page_size: 9999, // Número muy grande para obtener todos
      ...(searchTerm && { search: searchTerm })
    };
    const response = await apiClient.get('/patients', { params });
    return response.data; // El backend devuelve {data: [], pagination: {}}
  } catch (error) {
    console.error("Error en servicio getAllPatients:", error.response || error.message);
    throw error.response?.data || { message: 'Error al obtener todos los pacientes.' };
  }
};

export default {
    getPatients,
    getPaginatedPatients,
    getAllPatients,
    createPatient,
    updatePatient,
    deletePatient,
};