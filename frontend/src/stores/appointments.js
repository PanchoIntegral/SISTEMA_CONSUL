import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import apiAppointmentsService from '@/services/apiAppointmentsService';

const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
};

export const useAppointmentsStore = defineStore('appointments', () => {
  // State
  const appointmentsList = ref([]);
  const selectedDate = ref(getTodayDateString());
  const selectedStatus = ref(''); // Nuevo: filtro por estado
  const selectedDoctorId = ref(''); // Nuevo: filtro por doctor ID
  const searchPatientName = ref(''); // Nuevo: filtro por nombre de paciente
  const isLoading = ref(false);
  const error = ref(null);

  // Getters
  const appointments = computed(() => appointmentsList.value);
  const date = computed(() => selectedDate.value);
  const status = computed(() => selectedStatus.value); // Nuevo: getter estado
  const doctorId = computed(() => selectedDoctorId.value); // Nuevo: getter doctor_id
  const patientName = computed(() => searchPatientName.value); // Nuevo: getter patient_name
  const loading = computed(() => isLoading.value);
  const currentError = computed(() => error.value);
  
  // Nuevo: getter para los filtros actuales
  const currentFilters = computed(() => {
    const filters = {};
    if (selectedDate.value) filters.date = selectedDate.value;
    if (selectedStatus.value) filters.status = selectedStatus.value;
    if (selectedDoctorId.value) filters.doctor_id = selectedDoctorId.value;
    if (searchPatientName.value) filters.patient_name = searchPatientName.value;
    return filters;
  });

  // Actions
  function setSelectedDate(newDate) {
    if (newDate && typeof newDate === 'string') {
        selectedDate.value = newDate;
        fetchAppointments();
    } else {
        console.error("Formato de fecha inválido:", newDate);
    }
  }
  
  // Nuevo: función para establecer el filtro de estado
  function setSelectedStatus(status) {
    selectedStatus.value = status;
    fetchAppointments();
  }
  
  // Nuevo: función para establecer el filtro de doctor
  function setSelectedDoctorId(doctorId) {
    selectedDoctorId.value = doctorId;
    fetchAppointments();
  }
  
  // Nuevo: función para establecer el filtro por nombre de paciente
  function setSearchPatientName(name) {
    searchPatientName.value = name;
    fetchAppointments();
  }
  
  // Nuevo: función para limpiar todos los filtros
  function clearFilters() {
    selectedStatus.value = '';
    selectedDoctorId.value = '';
    searchPatientName.value = '';
    // No limpiamos la fecha, solo los otros filtros
    fetchAppointments();
  }

  async function fetchAppointments() {
    isLoading.value = true;
    error.value = null;
    appointmentsList.value = [];
    try {
      const data = await apiAppointmentsService.getAppointments(currentFilters.value);
      appointmentsList.value = data || [];
    } catch (err) {
      console.error("Error fetching appointments:", err);
      error.value = err.message || 'Error al cargar citas.';
      appointmentsList.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  async function updateAppointmentStatus(id, newStatus) {
     error.value = null;
     try {
        const updatedAppointment = await apiAppointmentsService.updateAppointment(id, { status: newStatus });
        const idx = appointmentsList.value.findIndex(appt => appt.id === id);
        if (idx !== -1) {
            appointmentsList.value[idx] = updatedAppointment;
        } else {
             fetchAppointments();
        }
     } catch (err) {
        console.error(`Error updating appointment ${id} status:`, err);
        error.value = err.message || 'Error al actualizar estado.';
     }
  }

  /**
   * Crea una nueva cita y la añade a la lista si es del día seleccionado.
   * @param {object} appointmentData - Datos de la cita.
   * @returns {Promise<boolean>} - True si se creó exitosamente, false si hubo error.
   */
  async function createAppointment(appointmentData) {
    isLoading.value = true; // Podría ser un loading específico para creación
    error.value = null;
    try {
        const newAppointment = await apiAppointmentsService.createAppointment(appointmentData);
        // Refrescar la lista con los filtros actuales
        await fetchAppointments();
        return true; // Indicar éxito
    } catch (err) {
        console.error("Error creating appointment:", err);
        error.value = err.message || 'Error al crear la cita.';
        return false; // Indicar fallo
    } finally {
        isLoading.value = false;
    }
  }

  /**
   * Elimina una cita existente.
   * @param {number} id - ID de la cita a eliminar.
   * @returns {Promise<boolean>} - True si se eliminó exitosamente, false si hubo error.
   */
  async function deleteAppointment(id) {
    isLoading.value = true;
    error.value = null;
    try {
      await apiAppointmentsService.deleteAppointment(id);
      // Eliminar la cita de la lista local
      appointmentsList.value = appointmentsList.value.filter(appt => appt.id !== id);
      return true; // Indicar éxito
    } catch (err) {
      console.error(`Error deleting appointment ${id}:`, err);
      error.value = err.message || 'Error al eliminar la cita.';
      return false; // Indicar fallo
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Actualiza los datos de una cita existente.
   * @param {number} id - ID de la cita a actualizar.
   * @param {object} appointmentData - Datos actualizados de la cita.
   * @returns {Promise<boolean>} - True si se actualizó exitosamente, false si hubo error.
   */
  async function updateAppointmentData(id, appointmentData) {
    isLoading.value = true;
    error.value = null;
    try {
      const updatedAppointment = await apiAppointmentsService.updateAppointment(id, appointmentData);
      // Refrescar la lista con los filtros actuales
      await fetchAppointments();
      return true; // Indicar éxito
    } catch (err) {
      console.error(`Error updating appointment ${id}:`, err);
      error.value = err.message || 'Error al actualizar la cita.';
      return false; // Indicar fallo
    } finally {
      isLoading.value = false;
    }
  }

  // Realtime (placeholder)
  function handleRealtimeUpdate(payload) { console.log("Realtime Update:", payload); fetchAppointments(); }
  function subscribeToRealtimeUpdates() { console.log("Subscribing..."); }
  function unsubscribeFromRealtimeUpdates() { console.log("Unsubscribing..."); }

  return {
    // State
    appointmentsList, selectedDate, isLoading, error, 
    selectedStatus, selectedDoctorId, searchPatientName, // Nuevos estados
    // Getters
    appointments, date, loading, currentError, 
    status, doctorId, patientName, currentFilters, // Nuevos getters
    // Actions
    setSelectedDate, fetchAppointments, updateAppointmentStatus,
    createAppointment, deleteAppointment, updateAppointmentData,
    subscribeToRealtimeUpdates, unsubscribeFromRealtimeUpdates,
    setSelectedStatus, setSelectedDoctorId, setSearchPatientName, clearFilters // Nuevas acciones
  };
});