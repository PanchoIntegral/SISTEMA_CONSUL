import apiClient from './apiClient';

export const getPatients = async (searchTerm = '') => {
  try {
    const params = searchTerm ? { search: searchTerm } : {};
    const response = await apiClient.get('/patients', { params });
    return response.data;
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


export default {
    getPatients,
    createPatient,
    updatePatient, // Añadido
    deletePatient, // Añadido
};