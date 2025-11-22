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
  const appointmentsListAll = ref([]); // Lista completa sin filtros
  const appointmentsList = ref([]);
  const selectedDate = ref(getTodayDateString());
  const selectedStatus = ref(''); // Filtro por estado
  const selectedDoctorId = ref(''); // Filtro por doctor ID
  const searchPatientName = ref(''); // Filtro por nombre de paciente
  const selectedShift = ref(''); // Nuevo: filtro por turno
  const sortBy = ref('appointment_time'); // Nuevo: campo de ordenamiento
  const sortDirection = ref('asc'); // Nuevo: dirección de ordenamiento
  const isLoading = ref(false);
  const error = ref(null);

  // Función auxiliar para aplicar filtros localmente
  const applyLocalFilters = () => {
    let filtered = [...appointmentsListAll.value];
    
    // Filtrar por estado
    if (selectedStatus.value === 'Citas Activas') {
      filtered = filtered.filter(apt => 
        !['Completada', 'Cancelada', 'No Asistió'].includes(apt.status)
      );
    } else if (selectedStatus.value === 'Citas Inactivas') {
      filtered = filtered.filter(apt => 
        !['Programada', 'En Espera', 'En Consulta'].includes(apt.status)
      );
    } else if (selectedStatus.value) {
      filtered = filtered.filter(apt => apt.status === selectedStatus.value);
    }
    
    // Filtrar por doctor
    if (selectedDoctorId.value) {
      filtered = filtered.filter(apt => {
        // Comparar tanto doctor_id directo como doctor.id anidado
        const aptDoctorId = apt.doctor_id || apt.doctor?.id;
        const match = aptDoctorId && aptDoctorId.toString() === selectedDoctorId.value.toString();
        return match;
      });
    }
    
    // Filtrar por nombre de paciente
    if (searchPatientName.value) {
      const searchLower = searchPatientName.value.toLowerCase();
      filtered = filtered.filter(apt => 
        apt.patient?.name?.toLowerCase().includes(searchLower)
      );
    }
    
    // Filtrar por turno
    if (selectedShift.value) {
      filtered = filtered.filter(apt => {
        const hour = new Date(apt.appointment_time).getHours();
        if (selectedShift.value === 'mañana') {
          return hour >= 6 && hour < 14;
        } else if (selectedShift.value === 'tarde') {
          return hour >= 14 && hour < 22;
        }
        return true;
      });
    }
    
    // Ordenar
    if (sortBy.value === 'appointment_time') {
      filtered.sort((a, b) => {
        const timeA = new Date(a.appointment_time).getTime();
        const timeB = new Date(b.appointment_time).getTime();
        return sortDirection.value === 'asc' ? timeA - timeB : timeB - timeA;
      });
    }
    
    appointmentsList.value = filtered;
  };

  // Getters
  const appointments = computed(() => appointmentsList.value);
  const date = computed(() => selectedDate.value);
  const status = computed(() => selectedStatus.value);
  const doctorId = computed(() => selectedDoctorId.value);
  const patientName = computed(() => searchPatientName.value);
  const shift = computed(() => selectedShift.value); // Nuevo: getter para turno
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
    if (selectedShift.value) filters.shift = selectedShift.value; // Nuevo: filtro por turno
    // Añadir parámetros de ordenamiento
    filters.sort_by = sortBy.value;
    filters.sort_dir = sortDirection.value;
    return filters;
  });

  // Actions
  function setSelectedDate(newDate) {
    if (newDate && typeof newDate === 'string') {
        selectedDate.value = newDate;
        // No recargar inmediatamente, se hará desde la vista
    } else {
        console.error("Formato de fecha inválido:", newDate);
    }
  }
  
  // Función para establecer el filtro de estado
  function setSelectedStatus(status) {
    selectedStatus.value = status;
    applyLocalFilters(); // Filtrado instantáneo
  }
  
  // Función para establecer el filtro de doctor
  function setSelectedDoctorId(doctorId) {
    selectedDoctorId.value = doctorId;
    applyLocalFilters(); // Filtrado instantáneo
  }
  
  // Función para establecer el filtro por nombre de paciente
  function setSearchPatientName(name) {
    searchPatientName.value = name;
    applyLocalFilters(); // Filtrado instantáneo
  }
  
  // Nueva: función para establecer el filtro por turno
  function setSelectedShift(shiftValue) {
    selectedShift.value = shiftValue;
    applyLocalFilters(); // Filtrado instantáneo
  }
  
  // Nueva: función para establecer el ordenamiento
  function setSorting(field, direction) {
    sortBy.value = field;
    sortDirection.value = direction;
    applyLocalFilters(); // Ordenar instantáneamente
  }
  
  // Nueva: función para cambiar la dirección de ordenamiento del campo actual
  function toggleSortDirection() {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    applyLocalFilters(); // Ordenar instantáneamente
  }
  
  // Función para limpiar todos los filtros
  function clearFilters() {
    selectedStatus.value = '';
    selectedDoctorId.value = '';
    searchPatientName.value = '';
    selectedShift.value = '';
    applyLocalFilters(); // Aplicar filtros instantáneamente
  }

  async function fetchAppointments() {
    isLoading.value = true;
    error.value = null;
    try {
      // Solo enviar fecha al servidor, los demás filtros se aplican localmente
      const serverFilters = {};
      if (selectedDate.value) serverFilters.date = selectedDate.value;
      
      const data = await apiAppointmentsService.getAppointments(serverFilters);
      appointmentsListAll.value = data || []; // Guardar lista completa
      applyLocalFilters(); // Aplicar filtros locales
    } catch (err) {
      console.error("Error fetching appointments:", err);
      error.value = err.message || 'Error al cargar citas.';
      appointmentsListAll.value = [];
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
    error.value = null;
    
    // Encontrar la cita antes de actualizar
    const index = appointmentsList.value.findIndex(appt => appt.id === id);
    if (index === -1) {
      console.error('Cita no encontrada en la lista local');
      return false;
    }
    
    const patientName = appointmentsList.value[index]?.patient?.name || 'el paciente';
    const previousState = { ...appointmentsList.value[index] };
    
    // Actualización optimista: actualizar UI inmediatamente
    appointmentsList.value[index] = { 
      ...appointmentsList.value[index], 
      status: newStatus 
    };
    
    try {
      // Llamar al backend en segundo plano
      const updatedAppointment = await apiAppointmentsService.updateAppointment(id, { status: newStatus });
      
      // Actualizar con los datos completos del servidor
      appointmentsList.value[index] = { ...appointmentsList.value[index], ...updatedAppointment };
      
      // Mostrar notificación según el estado
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
      
      // Revertir al estado anterior en caso de error
      appointmentsList.value[index] = previousState;
      
      toastService.error('Error', `No se pudo actualizar el estado de la cita: ${err.message || 'Error desconocido'}`);
      return false; // Indicar fallo
    }
  }

  /**
   * Actualiza los datos de una cita existente.
   * @param {number} id - ID de la cita a actualizar.
   * @param {object} appointmentData - Datos actualizados de la cita.
   * @returns {Promise<boolean>} - True si se actualizó exitosamente, false si hubo error.
   */
  async function updateAppointmentData(id, appointmentData) {
    error.value = null;
    
    // Encontrar la cita antes de actualizar
    const index = appointmentsList.value.findIndex(appt => appt.id === id);
    if (index === -1) {
      console.error('Cita no encontrada en la lista local');
      return false;
    }
    
    const previousState = { ...appointmentsList.value[index] };
    
    // Actualización optimista: actualizar UI inmediatamente
    appointmentsList.value[index] = { 
      ...appointmentsList.value[index], 
      ...appointmentData 
    };
    
    try {
      // Llamar al backend en segundo plano
      const updatedAppointment = await apiAppointmentsService.updateAppointment(id, appointmentData);
      
      // Actualizar con los datos completos del servidor
      appointmentsList.value[index] = { ...appointmentsList.value[index], ...updatedAppointment };

      // Mostrar notificación para actualización de datos
      if (appointmentData.date || appointmentData.time || appointmentData.appointment_time) {
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
      
      // Revertir al estado anterior en caso de error
      appointmentsList.value[index] = previousState;
      
      toastService.error('Error', `No se pudieron actualizar los datos de la cita: ${err.message || 'Error desconocido'}`);
      return false; // Indicar fallo
    }
  }

  /**
   * Crea una nueva cita y la añade a la lista si es del día seleccionado.
   * @param {object} appointmentData - Datos de la cita.
   * @returns {Promise<boolean>} - True si se creó exitosamente, false si hubo error.
   */
  async function createAppointment(appointmentData) {
    isLoading.value = true; // Mostrar loading durante la creación
    error.value = null;
    try {
        const newAppointment = await apiAppointmentsService.createAppointment(appointmentData);
        console.log('Cita creada exitosamente:', newAppointment);
        
        // Recargar las citas para asegurar que aparezca la nueva
        console.log('Recargando citas con filtros:', currentFilters.value);
        await fetchAppointments();
        console.log('Citas después de recargar:', appointmentsList.value.length);
        
        // Mostrar notificación de éxito
        const patientName = newAppointment.patient?.name || 'el paciente';
        let appointmentDateFormatted = 'fecha no disponible';
        if (newAppointment.appointment_time) {
          try {
            // Convertir UTC a fecha local de Tijuana para mostrar
            const { convertUTCToTijuanaLocal } = await import('@/utils/timezoneUtils.js');
            const tijuanaTime = convertUTCToTijuanaLocal(newAppointment.appointment_time);
            const [year, month, day] = tijuanaTime.date.split('-');
            appointmentDateFormatted = `${day}/${month}/${year}`;
          } catch (error) {
            console.error('Error convirtiendo fecha para notificación:', error);
            appointmentDateFormatted = new Date(newAppointment.appointment_time).toLocaleDateString('es-MX');
          }
        }
        toastService.success(
          'Cita agendada', 
          `Se ha agendado correctamente la cita para ${patientName} el ${appointmentDateFormatted}.`
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
    error.value = null;
    
    // Guardar información de la cita antes de eliminarla
    const appointmentToDelete = appointmentsList.value.find(appt => appt.id === id);
    if (!appointmentToDelete) {
      console.error('Cita no encontrada en la lista local');
      return false;
    }
    
    const deletedAppointmentIndex = appointmentsList.value.findIndex(appt => appt.id === id);
    const previousList = [...appointmentsList.value];
    
    // Eliminación optimista: remover de la UI inmediatamente
    appointmentsList.value = appointmentsList.value.filter(appt => appt.id !== id);
    
    try {
      // Llamar al backend en segundo plano
      await apiAppointmentsService.deleteAppointment(id);
      
      // No mostramos notificación aquí porque ya se maneja en el componente
      
      return true; // Indicar éxito
    } catch (err) {
      console.error(`Error deleting appointment ${id}:`, err);
      error.value = err.message || 'Error al eliminar la cita.';
      
      // Revertir la eliminación en caso de error
      appointmentsList.value = previousList;
      
      toastService.error(
        'Error', 
        `No se pudo eliminar la cita: ${err.message || 'Error desconocido'}`
      );
      
      return false; // Indicar fallo
    }
  }

  // Realtime (placeholder)
  function handleRealtimeUpdate(payload) { console.log("Realtime Update:", payload); fetchAppointments(); }
  function subscribeToRealtimeUpdates() { console.log("Subscribing..."); }
  function unsubscribeFromRealtimeUpdates() { console.log("Unsubscribing..."); }

  return {
    // State
    appointmentsList, selectedDate, isLoading, error, 
    selectedStatus, selectedDoctorId, searchPatientName, selectedShift,
    sortBy, sortDirection, // Nuevos estados
    // Getters
    appointments, date, loading, currentError, 
    status, doctorId, patientName, shift, currentFilters,
    currentSortBy, currentSortDirection, // Nuevos getters
    // Actions
    setSelectedDate, fetchAppointments, updateAppointmentStatus,
    createAppointment, deleteAppointment, updateAppointmentData,
    subscribeToRealtimeUpdates, unsubscribeFromRealtimeUpdates,
    setSelectedStatus, setSelectedDoctorId, setSearchPatientName, setSelectedShift, clearFilters,
    setSorting, toggleSortDirection // Nuevas acciones
  };
});