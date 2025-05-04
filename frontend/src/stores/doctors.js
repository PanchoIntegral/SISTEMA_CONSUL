import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import apiDoctorsService from '@/services/apiDoctorsService';

export const useDoctorsStore = defineStore('doctors', () => {
  // State
  const doctorList = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  // Getters
  const doctors = computed(() => doctorList.value);
  const loading = computed(() => isLoading.value);

  // Actions
  async function fetchDoctors() {
    if (doctorList.value.length > 0) return; // Evitar recargar

    isLoading.value = true;
    error.value = null;
    try {
      const data = await apiDoctorsService.getDoctors();
      doctorList.value = data || [];
    } catch (err) {
      console.error("Error fetching doctors:", err);
      error.value = err.message || 'Error al cargar doctores.';
      doctorList.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  return {
    doctors, loading, // Getters
    fetchDoctors, // Actions
  };
});