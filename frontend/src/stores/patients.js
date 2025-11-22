import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import apiPatientsService from '@/services/apiPatientsService';

export const usePatientsStore = defineStore('patients', () => {
  // State
  const patientList = ref([]);
  const isLoading = ref(false);
  const error = ref(null);
  const searchTerm = ref('');
  const pagination = ref({
    page: 1,
    page_size: 100, // Cambiado para obtener más pacientes
    total_pages: 0,
    total_count: 0
  });

  // Getters
  const patients = computed(() => patientList.value);
  const loading = computed(() => isLoading.value);
  const currentError = computed(() => error.value);
  const currentSearchTerm = computed(() => searchTerm.value);
  const totalPatients = computed(() => pagination.value.total_count);

  // Actions
  async function fetchPatients(force = false, search = '') {
    // Si hay un término de búsqueda, siempre forzamos la búsqueda
    if (search) {
      searchTerm.value = search;
      force = true;
    } else {
      // Si no hay búsqueda y ya tenemos datos, no hacemos nada
      if (patientList.value && patientList.value.length > 0 && !force && !searchTerm.value) return;
      // Si estamos limpiando una búsqueda anterior
      if (searchTerm.value && !search) {
        searchTerm.value = '';
        force = true;
      }
    }
    
    isLoading.value = true;
    error.value = null;
    try {
      const response = await apiPatientsService.getPatients(searchTerm.value);
      patientList.value = response?.data || []; // El backend devuelve {data: [], pagination: {}}
      pagination.value.total_count = response?.pagination?.total_count || 0;
    } catch (err) {
      console.error("Error fetching patients:", err);
      error.value = err.message || 'Error al cargar pacientes.';
      patientList.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchPaginatedPatients(page = 1, pageSize = 10, search = '') {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await apiPatientsService.getPaginatedPatients(page, pageSize, search);
      patientList.value = response.data || [];
      pagination.value = response.pagination || {
        page: 1,
        page_size: 10,
        total_pages: 0,
        total_count: 0
      };
      searchTerm.value = search;
    } catch (err) {
      console.error("Error fetching paginated patients:", err);
      error.value = err.message || 'Error al cargar pacientes paginados.';
      patientList.value = [];
      pagination.value = {
        page: 1,
        page_size: 10,
        total_pages: 0,
        total_count: 0
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function createPatient(patientData) {
    // isLoading.value = true; // Podrías usar un loading específico
    error.value = null;
    try {
        const newPatient = await apiPatientsService.createPatient(patientData);
        if (!patientList.value) patientList.value = [];
        patientList.value.push(newPatient);
        patientList.value.sort((a, b) => a.name.localeCompare(b.name));
        return newPatient;
    } catch (err) {
        console.error("Error creating patient:", err);
        
        // Manejo específico para pacientes duplicados
        if (err.duplicate_patient) {
            error.value = `Ya existe un paciente con los mismos datos: "${err.duplicate_patient.name}"`;
        } else {
            error.value = err.message || 'Error al crear el paciente.';
        }
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
        if (!patientList.value) patientList.value = [];
        const index = patientList.value.findIndex(p => p.id === id);
        if (index !== -1) {
            patientList.value[index] = updatedPatient;
            // Reordenar por si cambió el nombre
            patientList.value.sort((a, b) => a.name.localeCompare(b.name));
        }
        return true;
    } catch (err) {
        console.error(`Error updating patient ${id}:`, err);
        
        // Manejo específico para pacientes duplicados
        if (err.duplicate_patient) {
            error.value = `Ya existe otro paciente con los mismos datos: "${err.duplicate_patient.name}"`;
        } else {
            error.value = err.message || 'Error al actualizar el paciente.';
        }
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
        if (!patientList.value) patientList.value = [];
        patientList.value = patientList.value.filter(p => p.id !== id);
        return true;
    } catch (err) {
        console.error(`Error deleting patient ${id}:`, err);
        error.value = err.message || 'Error al eliminar el paciente.';
        return false;
    }
  }

  /**
   * Obtiene todos los pacientes del sistema sin paginación.
   * Útil para selects y modales donde se necesita la lista completa.
   */
  async function fetchAllPatients(search = '') {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await apiPatientsService.getAllPatients(search);
      patientList.value = response?.data || []; // El backend devuelve {data: [], pagination: {}}
      pagination.value = response?.pagination || {
        page: 1,
        page_size: 9999,
        total_pages: 1,
        total_count: 0
      };
    } catch (err) {
      console.error("Error fetching all patients:", err);
      error.value = err.message || 'Error al cargar todos los pacientes.';
      patientList.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  return {
    patients, loading, currentError, currentSearchTerm, pagination, totalPatients,
    fetchPatients, fetchPaginatedPatients, fetchAllPatients, createPatient, updatePatient, deletePatient,
  };
});