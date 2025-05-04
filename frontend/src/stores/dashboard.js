// src/stores/dashboard.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import apiDashboardService from '@/services/apiDashboardService';

// Datos de prueba para cuando el servidor no está disponible
const mockData = {
  totalAppointments: 45,
  avgWaitTime: 12,
  avgConsultTime: 20,
  appointmentsByDoctor: [
    { doctorName: 'Dr. García', appointmentCount: 15 },
    { doctorName: 'Dra. Rodríguez', appointmentCount: 12 },
    { doctorName: 'Dr. Martínez', appointmentCount: 18 }
  ]
};

export const useDashboardStore = defineStore('dashboard', () => {
  // State
  const dashboardStats = ref({
    totalAppointments: 0,
    avgWaitTime: 0,
    avgConsultTime: 0,
    appointmentsByDoctor: []
  });
  const isLoading = ref(false);
  const error = ref(null);
  
  // Getters
  const stats = computed(() => dashboardStats.value);
  const loading = computed(() => isLoading.value);
  const currentError = computed(() => error.value);
  
  // Actions
  async function fetchDashboardStats(month, year) {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Obtener datos reales del API
      const data = await apiDashboardService.getDashboardStats(month, year);
      dashboardStats.value = data;
      
      // Obtener datos de citas por doctor
      const doctorData = await apiDashboardService.getAppointmentsByDoctor(month, year);
      dashboardStats.value.appointmentsByDoctor = doctorData;
      
    } catch (err) {
      console.error('Error al cargar estadísticas del dashboard:', err);
      error.value = err.message || 'Error al cargar estadísticas.';
      
      // Si estamos en modo desarrollo, usar datos de prueba
      if (import.meta.env.DEV) {
        console.warn('Usando datos de prueba para el dashboard');
        dashboardStats.value = { ...mockData };
        // Eliminar el error para que se muestren los datos de prueba
        error.value = null;
      }
    } finally {
      isLoading.value = false;
    }
  }
  
  async function fetchWaitTimeData(month, year) {
    try {
      // Obtener datos reales del API
      return await apiDashboardService.getAverageWaitTimeByDay(month, year);
    } catch (err) {
      console.error('Error al obtener datos de tiempo de espera:', err);
      
      // Si estamos en modo desarrollo, devolver datos de prueba
      if (import.meta.env.DEV) {
        console.warn('Usando datos de prueba para tiempos de espera');
        return {
          days: ['1', '5', '10', '15', '20', '25', '30'],
          waitTimes: [10, 12, 8, 15, 11, 9, 14]
        };
      }
      throw err;
    }
  }
  
  async function fetchConsultTimeData(month, year) {
    try {
      // Obtener datos reales del API
      return await apiDashboardService.getAverageConsultTimeByDay(month, year);
    } catch (err) {
      console.error('Error al obtener datos de tiempo de consulta:', err);
      
      // Si estamos en modo desarrollo, devolver datos de prueba
      if (import.meta.env.DEV) {
        console.warn('Usando datos de prueba para tiempos de consulta');
        return {
          days: ['1', '5', '10', '15', '20', '25', '30'],
          consultTimes: [18, 22, 20, 25, 19, 21, 23]
        };
      }
      throw err;
    }
  }
  

  async function fetchAppointmentsByDay(month, year) {
    // Esta acción solo obtiene y devuelve los datos, no necesita modificar el estado principal
    try {
      // Obtener datos reales del API usando la nueva función del servicio
      return await apiDashboardService.getAppointmentsByDay(month, year);
    } catch (err) {
      console.error('Error al obtener datos de citas por día:', err);

      // Opcional: devolver mock data en DEV si falla
      if (import.meta.env.DEV) {
        console.warn('Usando datos de prueba para citas por día');
        const numDays = new Date(year, month, 0).getDate();
        return Array.from({ length: numDays }, (_, i) => ({
             day: i + 1,
             count: Math.floor(Math.random() * 10) 
        }));
      }
      throw err; 
    }
  }


  async function fetchAppointmentsByDoctor(month, year) {
    try {
      // Obtener datos reales del API
      return await apiDashboardService.getAppointmentsByDoctor(month, year);
    } catch (err) {
      console.error('Error al obtener citas por doctor:', err);
      
      // Si estamos en modo desarrollo, devolver datos de prueba
      if (import.meta.env.DEV) {
        console.warn('Usando datos de prueba para citas por día');
        return [
          { day: '1', count: 3 },
          { day: '5', count: 5 },
          { day: '10', count: 8 },
          { day: '15', count: 6 },
          { day: '20', count: 4 },
          { day: '25', count: 7 },
          { day: '30', count: 5 }
        ];
      }
      throw err;
    }
  }
  
  // Función auxiliar para simular llamada a API
  function simulateApiCall() {
    return new Promise(resolve => setTimeout(resolve, 800));
  }
  
  return {
    stats,
    loading,
    currentError,
    fetchDashboardStats,
    fetchWaitTimeData,
    fetchConsultTimeData,
    fetchAppointmentsByDoctor,
    fetchAppointmentsByDay
  };
});