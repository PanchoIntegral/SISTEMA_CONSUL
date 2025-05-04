import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import apiPatientsService from '@/services/apiPatientsService';

export const usePatientsStore = defineStore('patients', () => {
  // State
  const patientList = ref([]);
  const isLoading = ref(false);
  const error = ref(null);
  const searchTerm = ref('');

  // Getters
  const patients = computed(() => patientList.value);
  const loading = computed(() => isLoading.value);
  const currentError = computed(() => error.value);
  const currentSearchTerm = computed(() => searchTerm.value);

  // Actions
  async function fetchPatients(force = false, search = '') {
    // Si hay un término de búsqueda, siempre forzamos la búsqueda
    if (search) {
      searchTerm.value = search;
      force = true;
    } else {
      // Si no hay búsqueda y ya tenemos datos, no hacemos nada
      if (patientList.value.length > 0 && !force && !searchTerm.value) return;
      // Si estamos limpiando una búsqueda anterior
      if (searchTerm.value && !search) {
        searchTerm.value = '';
        force = true;
      }
    }
    
    isLoading.value = true;
    error.value = null;
    try {
      const data = await apiPatientsService.getPatients(searchTerm.value);
      patientList.value = data || [];
      patientList.value.sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
      console.error("Error fetching patients:", err);
      error.value = err.message || 'Error al cargar pacientes.';
      patientList.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  async function createPatient(patientData) {
    // isLoading.value = true; // Podrías usar un loading específico
    error.value = null;
    try {
        const newPatient = await apiPatientsService.createPatient(patientData);
        patientList.value.push(newPatient);
        patientList.value.sort((a, b) => a.name.localeCompare(b.name));
        return newPatient;
    } catch (err) {
        console.error("Error creating patient:", err);
        error.value = err.message || 'Error al crear el paciente.';
        return null;
    } finally {
        // isLoading.value = false;
    }
  }

  /**
   * Actualiza un paciente en la lista local y llama a la API.
   * @param {number} id - ID del paciente.
   * @param {object} patientData - Datos a actualizar.
   * @returns {Promise<boolean>} - True si tuvo éxito, false si falló.
   */
  async function updatePatient(id, patientData) {
    error.value = null;
    try {
        const updatedPatient = await apiPatientsService.updatePatient(id, patientData);
        const index = patientList.value.findIndex(p => p.id === id);
        if (index !== -1) {
            patientList.value[index] = updatedPatient;
            // Reordenar por si cambió el nombre
            patientList.value.sort((a, b) => a.name.localeCompare(b.name));
        }
        return true;
    } catch (err) {
        console.error(`Error updating patient ${id}:`, err);
        error.value = err.message || 'Error al actualizar el paciente.';
        return false;
    }
  }

  /**
   * Elimina un paciente de la lista local y llama a la API.
   * @param {number} id - ID del paciente a eliminar.
   * @returns {Promise<boolean>} - True si tuvo éxito, false si falló.
   */
  async function deletePatient(id) {
    error.value = null;
    try {
        await apiPatientsService.deletePatient(id);
        // Eliminar de la lista local
        patientList.value = patientList.value.filter(p => p.id !== id);
        return true;
    } catch (err) {
        console.error(`Error deleting patient ${id}:`, err);
        error.value = err.message || 'Error al eliminar el paciente.';
        return false;
    }
  }

  return {
    patients, loading, currentError, currentSearchTerm,
    fetchPatients, createPatient, updatePatient, deletePatient, // Añadidos update y delete
  };
});