import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import apiAppointmentsService from '@/services/apiAppointmentsService';
import { toastService } from '@/services/toastService';

const getTodayDateString = () => {
    const today = new Date();
    // Usar la fecha local del usuario en lugar de UTC
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const useAppointmentsStore = defineStore('appointments', () => {
  // State
  const appointmentsList = ref([]);
  const selectedDate = ref(getTodayDateString());
  const selectedStatus = ref(''); // Filtro por estado
  const selectedDoctorId = ref(''); // Filtro por doctor ID
  const searchPatientName = ref(''); // Filtro por nombre de paciente
  const sortBy = ref('appointment_time'); // Nuevo: campo de ordenamiento
  const sortDirection = ref('asc'); // Nuevo: dirección de ordenamiento
  const isLoading = ref(false);
  const error = ref(null);

  // Getters
  const appointments = computed(() => appointmentsList.value);
  const date = computed(() => selectedDate.value);
  const status = computed(() => selectedStatus.value);
  const doctorId = computed(() => selectedDoctorId.value);
  const patientName = computed(() => searchPatientName.value);
  const currentSortBy = computed(() => sortBy.value); // Nuevo: getter para campo de orden
  const currentSortDirection = computed(() => sortDirection.value); // Nuevo: getter para dirección de orden
  const loading = computed(() => isLoading.value);
  const currentError = computed(() => error.value);
  
  // Getter para los filtros y ordenamiento actuales
  const currentFilters = computed(() => {
    const filters = {};
    if (selectedDate.value) filters.date = selectedDate.value;
    
    // Handle special "Citas Activas" filter
    if (selectedStatus.value === 'Citas Activas') {
      filters.exclude_statuses = ['Completada', 'Cancelada', 'No Asistió'];
    } 
    // Handle special "Citas Inactivas" filter
    else if (selectedStatus.value === 'Citas Inactivas') {
      filters.exclude_statuses = ['Programada', 'En Espera', 'En Consulta'];
    }
    else if (selectedStatus.value) {
      filters.status = selectedStatus.value;
    }
    
    if (selectedDoctorId.value) filters.doctor_id = selectedDoctorId.value;
    if (searchPatientName.value) filters.patient_name = searchPatientName.value;
    // Añadir parámetros de ordenamiento
    filters.sort_by = sortBy.value;
    filters.sort_dir = sortDirection.value;
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
  
  // Función para establecer el filtro de estado
  function setSelectedStatus(status) {
    selectedStatus.value = status;
    fetchAppointments();
  }
  
  // Función para establecer el filtro de doctor
  function setSelectedDoctorId(doctorId) {
    selectedDoctorId.value = doctorId;
    fetchAppointments();
  }
  
  // Función para establecer el filtro por nombre de paciente
  function setSearchPatientName(name) {
    searchPatientName.value = name;
    fetchAppointments();
  }
  
  // Nueva: función para establecer el ordenamiento
  function setSorting(field, direction) {
    sortBy.value = field;
    sortDirection.value = direction;
    fetchAppointments();
  }
  
  // Nueva: función para cambiar la dirección de ordenamiento del campo actual
  function toggleSortDirection() {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    fetchAppointments();
  }
  
  // Función para limpiar todos los filtros
  function clearFilters() {
    selectedStatus.value = '';
    selectedDoctorId.value = '';
    searchPatientName.value = '';
    // No limpiamos la fecha ni el ordenamiento, solo los filtros
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

  /**
   * Actualiza el estado de una cita.
   * @param {number} id - ID de la cita a actualizar.
   * @param {string} newStatus - Nuevo estado para la cita.
   * @returns {Promise<boolean>} - True si se actualizó exitosamente, false si hubo error.
   */
  async function updateAppointmentStatus(id, newStatus) {
    isLoading.value = true;
    error.value = null;
    try {
      const updatedAppointment = await apiAppointmentsService.updateAppointment(id, { status: newStatus });
      
      // Actualizar la cita en la lista local
      const index = appointmentsList.value.findIndex(appt => appt.id === id);
      if (index !== -1) {
        appointmentsList.value[index] = { ...appointmentsList.value[index], ...updatedAppointment };
      }
      
      // Mostrar notificación según el estado
      const patientName = appointmentsList.value[index]?.patient?.name || 'el paciente';
      if (newStatus === 'En Espera') {
        toastService.info('Paciente en espera', `Se ha registrado la llegada de ${patientName}.`);
      } else if (newStatus === 'En Consulta') {
        toastService.info('Consulta iniciada', `La consulta con ${patientName} ha comenzado.`);
      } else if (newStatus === 'Completada') {
        toastService.success('Consulta finalizada', `La consulta con ${patientName} ha sido completada.`);
      } else if (newStatus === 'Cancelada') {
        toastService.warning('Cita cancelada', `La cita con ${patientName} ha sido cancelada.`);
      } else if (newStatus === 'No Asistió') {
        toastService.error('Inasistencia', `${patientName} no asistió a la cita programada.`);
      }
      
      return true; // Indicar éxito
    } catch (err) {
      console.error(`Error updating appointment status ${id}:`, err);
      error.value = err.message || 'Error al actualizar el estado de la cita.';
      toastService.error('Error', `No se pudo actualizar el estado de la cita: ${err.message || 'Error desconocido'}`);
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
      const index = appointmentsList.value.findIndex(appt => appt.id === id);
      if (index !== -1) {
        appointmentsList.value[index] = { ...appointmentsList.value[index], ...updatedAppointment };
      }

      // Mostrar notificación para actualización de datos
      if (appointmentData.date || appointmentData.time) {
        toastService.info('Cita actualizada', 'Se actualizó la fecha u hora de la cita.');
      } else if (appointmentData.medical_process_tag) {
        toastService.info('Proceso médico actualizado', `Se asignó la etiqueta "${appointmentData.medical_process_tag}".`);
      } else {
        toastService.info('Cita actualizada', 'Los datos de la cita han sido actualizados.');
      }
      
      return true; // Indicar éxito
    } catch (err) {
      console.error(`Error updating appointment data ${id}:`, err);
      error.value = err.message || 'Error al actualizar los datos de la cita.';
      toastService.error('Error', `No se pudieron actualizar los datos de la cita: ${err.message || 'Error desconocido'}`);
      return false; // Indicar fallo
    } finally {
      isLoading.value = false;
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
        
        // Mostrar notificación de éxito
        const patientName = newAppointment.patient?.name || 'el paciente';
        const appointmentDate = new Date(newAppointment.date).toLocaleDateString();
        toastService.success(
          'Cita agendada', 
          `Se ha agendado correctamente la cita para ${patientName} el ${appointmentDate}.`
        );
        
        return true; // Indicar éxito
    } catch (err) {
        console.error("Error creating appointment:", err);
        error.value = err.message || 'Error al crear la cita.';
        
        // Mostrar notificación de error
        if (err.error_type === 'doctor_unavailable') {
            toastService.error(
              'Doctor no disponible', 
              'El doctor seleccionado no está disponible en este horario.'
            );
        } else {
            toastService.error(
              'Error', 
              `No se pudo agendar la cita: ${err.message || 'Error desconocido'}`
            );
        }
        
        // Si es el error específico de doctor no disponible, propagarlo
        if (err.error_type === 'doctor_unavailable') {
            throw err; // Propagar el error con su tipo específico
        }
        return false; // Indicar fallo para otros errores
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
      // Guardar información de la cita antes de eliminarla para la notificación
      const appointmentToDelete = appointmentsList.value.find(appt => appt.id === id);
      const patientName = appointmentToDelete?.patient?.name || 'el paciente';
      
      await apiAppointmentsService.deleteAppointment(id);
      // Eliminar la cita de la lista local
      appointmentsList.value = appointmentsList.value.filter(appt => appt.id !== id);
      
      // No mostramos notificación aquí porque ya se maneja en el componente
      
      return true; // Indicar éxito
    } catch (err) {
      console.error(`Error deleting appointment ${id}:`, err);
      error.value = err.message || 'Error al eliminar la cita.';
      
      toastService.error(
        'Error', 
        `No se pudo eliminar la cita: ${err.message || 'Error desconocido'}`
      );
      
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
    selectedStatus, selectedDoctorId, searchPatientName,
    sortBy, sortDirection, // Nuevos estados
    // Getters
    appointments, date, loading, currentError, 
    status, doctorId, patientName, currentFilters,
    currentSortBy, currentSortDirection, // Nuevos getters
    // Actions
    setSelectedDate, fetchAppointments, updateAppointmentStatus,
    createAppointment, deleteAppointment, updateAppointmentData,
    subscribeToRealtimeUpdates, unsubscribeFromRealtimeUpdates,
    setSelectedStatus, setSelectedDoctorId, setSearchPatientName, clearFilters,
    setSorting, toggleSortDirection // Nuevas acciones
  };
});