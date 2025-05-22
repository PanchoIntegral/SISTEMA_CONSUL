import { defineStore } from 'pinia';
import { ref, computed, onMounted } from 'vue';
import apiDoctorsService from '@/services/apiDoctorsService';
import { supabase } from '@/supabaseClient';

export const useDoctorsStore = defineStore('doctors', () => {
  // State - asegurar que doctorList siempre sea un array
  const doctorList = ref([]);
  const isLoading = ref(false);
  const error = ref(null);
  const blockedDays = ref([]);
  const loadingBlockedDays = ref(false);
  const errorBlockedDays = ref(null);

  // Getters
  const doctors = computed(() => doctorList.value || []);
  const loading = computed(() => isLoading.value);

  // Cargar doctores desde sessionStorage al inicializar
  const loadFromStorage = () => {
    try {
      const stored = sessionStorage.getItem('doctors');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          doctorList.value = parsed;
        } else {
          // Si no es un array, inicializar como array vacío
          doctorList.value = [];
          // Limpiar storage ya que los datos no son válidos
          sessionStorage.removeItem('doctors');
        }
      }
    } catch (e) {
      console.error("Error parsing stored doctors:", e);
      doctorList.value = [];
      // Si hay error al parsear, limpiar el almacenamiento
      sessionStorage.removeItem('doctors');
    }
  };

  // Ejecutar al inicializar el store
  loadFromStorage();

  // Actions
  async function fetchDoctors(forceRefresh = false) {
    if (doctorList.value.length > 0 && !forceRefresh) return doctorList.value; // Evitar recargar si ya hay datos

    isLoading.value = true;
    error.value = null;
    try {
      const data = await apiDoctorsService.getDoctors();
      if (Array.isArray(data)) {
        doctorList.value = data;
        // Guardar en sessionStorage para persistencia entre recargas
        sessionStorage.setItem('doctors', JSON.stringify(doctorList.value));
      } else {
        console.error("API returned non-array data for doctors:", data);
        doctorList.value = [];
        error.value = "Formato de respuesta inválido";
      }
      return doctorList.value;
    } catch (err) {
      console.error("Error fetching doctors:", err);
      error.value = err.message || 'Error al cargar doctores.';
      doctorList.value = [];
      return [];
    } finally {
      isLoading.value = false;
    }
  }

  const getBlockedDays = async (doctorId) => {
    if (!doctorId) {
      console.error('Error: Se intentó obtener días bloqueados sin ID de doctor');
      blockedDays.value = [];
      return [];
    }
    
    loadingBlockedDays.value = true;
    errorBlockedDays.value = null;
    
    // Limpiar los días bloqueados anteriores para evitar mezclas
    blockedDays.value = [];
    
    try {
      console.log(`Obteniendo días bloqueados para doctor ID: ${doctorId}`);
      const data = await apiDoctorsService.getBlockedDays(doctorId);
      
      // Verificar y preparar los datos
      const processedData = Array.isArray(data) ? data.map(day => {
        // Asegurar formato de fecha consistente (YYYY-MM-DD)
        if (day.blocked_date && typeof day.blocked_date === 'string') {
          // Garantizar que la fecha está en formato YYYY-MM-DD sin componente de tiempo
          const dateOnly = day.blocked_date.split('T')[0];
          return {
            ...day,
            blocked_date: dateOnly,
            // Añadir un campo adicional para facilitar comparaciones
            date_normalized: dateOnly
          };
        }
        return day;
      }) : [];
      
      console.log(`Días bloqueados obtenidos para doctor ${doctorId}: ${processedData.length}`, processedData);
      
      // Actualizar el estado con una nueva referencia para garantizar reactividad
      blockedDays.value = [...processedData];
      
      // Almacenar en sessionStorage para persistencia
      sessionStorage.setItem(`blockedDays_${doctorId}`, JSON.stringify(processedData));
      
      return blockedDays.value;
    } catch (err) {
      console.error('Error en getBlockedDays:', err);
      errorBlockedDays.value = err.message;
      blockedDays.value = [];
      return [];
    } finally {
      loadingBlockedDays.value = false;
    }
  };

  const addBlockedDay = async (doctorId, blockedDate, reason = 'No disponible') => {
    loadingBlockedDays.value = true;
    errorBlockedDays.value = null;
    try {
      console.log(`Añadiendo día bloqueado para doctor ${doctorId}: ${blockedDate}`);
      const newBlockedDay = await apiDoctorsService.addBlockedDay(doctorId, blockedDate, reason);
      
      if (newBlockedDay && newBlockedDay.id) {
        // Procesar la fecha a formato YYYY-MM-DD
        const dateOnly = newBlockedDay.blocked_date.split('T')[0];
        const processedDay = {
          ...newBlockedDay,
          blocked_date: dateOnly,
          date_normalized: dateOnly
        };
        
        // Verificar que no esté duplicado antes de agregarlo
        const exists = blockedDays.value.some(day => day.id === processedDay.id);
        
        if (!exists) {
          // Crear una nueva referencia del array para garantizar reactividad
          blockedDays.value = [...blockedDays.value, processedDay];
          
          // Actualizar sessionStorage
          sessionStorage.setItem(`blockedDays_${doctorId}`, JSON.stringify(blockedDays.value));
        }
        
        console.log(`Día bloqueado añadido: ${dateOnly} para doctor ${doctorId}`);
        return processedDay;
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (err) {
      console.error('Error en addBlockedDay:', err);
      errorBlockedDays.value = err.message;
      throw err;
    } finally {
      loadingBlockedDays.value = false;
    }
  };

  const deleteBlockedDay = async (blockedDayId) => {
    loadingBlockedDays.value = true;
    errorBlockedDays.value = null;
    try {
      await apiDoctorsService.deleteBlockedDay(blockedDayId);
      // Actualizar el estado local eliminando el día bloqueado
      // Crear nueva referencia para asegurar reactividad
      blockedDays.value = blockedDays.value.filter(day => day.id !== blockedDayId);
      return true;
    } catch (err) {
      console.error('Error en deleteBlockedDay:', err);
      errorBlockedDays.value = err.message;
      throw err;
    } finally {
      loadingBlockedDays.value = false;
    }
  };
  
  // Acción para limpiar días bloqueados (al cambiar de vista o cerrar sesión)
  const clearBlockedDays = () => {
    console.log('Limpiando días bloqueados');
    blockedDays.value = [];
    errorBlockedDays.value = null;
    loadingBlockedDays.value = false;
  };

  return {
    doctors, 
    loading, 
    error,
    fetchDoctors, 
    blockedDays,
    loadingBlockedDays,
    errorBlockedDays,
    getBlockedDays,
    addBlockedDay,
    deleteBlockedDay,
    clearBlockedDays
  };
});