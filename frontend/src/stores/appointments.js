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
  const isLoading = ref(false);
  const error = ref(null);

  // Getters
  const appointments = computed(() => appointmentsList.value);
  const date = computed(() => selectedDate.value);
  const loading = computed(() => isLoading.value);
  const currentError = computed(() => error.value);

  // Actions
  function setSelectedDate(newDate) {
    if (newDate && typeof newDate === 'string') {
        selectedDate.value = newDate;
        fetchAppointments(newDate);
    } else {
        console.error("Formato de fecha inválido:", newDate);
    }
  }

  async function fetchAppointments(date = selectedDate.value) {
    isLoading.value = true;
    error.value = null;
    appointmentsList.value = [];
    try {
      const data = await apiAppointmentsService.getAppointments(date);
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
        // Comprobar si la nueva cita es para la fecha actualmente seleccionada
        const newApptDate = new Date(newAppointment.appointment_time).toISOString().split('T')[0];
        if (newApptDate === selectedDate.value) {
            // Añadir a la lista actual y ordenar
            appointmentsList.value.push(newAppointment);
            appointmentsList.value.sort((a, b) => new Date(a.appointment_time) - new Date(b.appointment_time));
        }
        // Podríamos simplemente recargar la lista actual:
        // await fetchAppointments(selectedDate.value);
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
      // Actualizar la cita en la lista local
      const idx = appointmentsList.value.findIndex(appt => appt.id === id);
      if (idx !== -1) {
        appointmentsList.value[idx] = updatedAppointment;
      } else {
        await fetchAppointments(selectedDate.value);
      }
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
  function handleRealtimeUpdate(payload) { console.log("Realtime Update:", payload); fetchAppointments(selectedDate.value); }
  function subscribeToRealtimeUpdates() { console.log("Subscribing..."); }
  function unsubscribeFromRealtimeUpdates() { console.log("Unsubscribing..."); }

  return {
    // State
    appointmentsList, selectedDate, isLoading, error,
    // Getters
    appointments, date, loading, currentError,
    // Actions
    setSelectedDate, fetchAppointments, updateAppointmentStatus,
    createAppointment, deleteAppointment, updateAppointmentData,
    subscribeToRealtimeUpdates, unsubscribeFromRealtimeUpdates
  };
});