<template>
  <div class="p-2 sm:p-4 md:p-8">
    <h1 class="text-2xl font-semibold mb-4 sm:mb-6 text-gray-800">Gestión de Citas</h1>

    <div class="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-4 mb-6">
      <div class="w-full sm:w-auto flex items-center gap-2">
        <label for="appointment-date" class="text-sm font-medium text-gray-700 min-w-fit">Fecha:</label>
        <input
          type="date"
          id="appointment-date"
          v-model="localSelectedDate"
          @change="updateDate"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm p-2"
        />
      </div>
      <div class="flex flex-wrap gap-2 w-full sm:w-auto">
        <button
           @click="isPatientModalOpen = true" class="flex-1 sm:flex-none inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
        >
          + Nuevo Paciente
        </button>
        <button
           @click="isAppointmentModalOpen = true" class="flex-1 sm:flex-none inline-flex items-center justify-center rounded-md bg-secondary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-secondary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary transition-colors"
        >
          + Nueva Cita
        </button>
      </div>
    </div>

    <!-- Nuevos controles de filtro -->
    <div class="bg-white p-3 sm:p-4 rounded-lg shadow mb-6">
      <details class="w-full">
        <summary class="font-medium text-navy cursor-pointer">Filtros avanzados</summary>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <!-- Filtro por estado -->
          <div>
            <label for="status-filter" class="block text-sm font-medium text-navy">Por estado:</label>
            <select
              id="status-filter"
              v-model="localSelectedStatus"
              @change="updateStatus"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm p-2"
            >
              <option value="">Todos los estados</option>
              <option value="Citas Activas">Citas Activas</option>
              <option value="Citas Inactivas">Citas Inactivas</option>
              <option value="Programada">Programada</option>
              <option value="En Espera">En Espera</option>
              <option value="En Consulta">En Consulta</option>
              <option value="Completada">Completada</option>
              <option value="Cancelada">Cancelada</option>
              <option value="No Asistió">No Asistió</option>
            </select>
          </div>

          <!-- Filtro por doctor -->
          <div>
            <label for="doctor-filter" class="block text-sm font-medium text-navy">Por doctor:</label>
            <select
              id="doctor-filter"
              v-model="localSelectedDoctorId"
              @change="updateDoctorId"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm p-2"
            >
              <option value="">Todos los doctores</option>
              <option v-for="doctor in doctorsStore.doctors" :key="doctor.id" :value="doctor.id">
                {{ doctor.name }}
              </option>
            </select>
          </div>

          <!-- Filtro por nombre del paciente -->
          <div>
            <label for="patient-filter" class="block text-sm font-medium text-navy">Por nombre del paciente:</label>
            <div class="mt-1 relative rounded-md shadow-sm">
              <input
                type="text"
                id="patient-filter"
                v-model="localSearchPatientName"
                @input="updatePatientName"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm p-2"
                placeholder="Nombre del paciente..."
              />
              <div v-if="localSearchPatientName" @click="clearPatientSearch" class="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer">
                <span class="text-gray-400 hover:text-gray-500">&times;</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Controles de ordenamiento -->
        <div class="mt-4 border-t pt-4">
          <h4 class="text-sm font-medium text-navy mb-2">Ordenar por:</h4>
          <div class="flex flex-wrap gap-2">
            <button 
              @click="setSort('appointment_time')" 
              class="px-3 py-1 text-sm rounded-md border"
              :class="sortClasses('appointment_time')"
            >
              Hora 
              <span v-if="localSortBy === 'appointment_time'">
                {{ localSortDir === 'asc' ? '↑' : '↓' }}
              </span>
            </button>
            <button 
              @click="setSort('status')" 
              class="px-3 py-1 text-sm rounded-md border"
              :class="sortClasses('status')"
            >
              Estado 
              <span v-if="localSortBy === 'status'">
                {{ localSortDir === 'asc' ? '↑' : '↓' }}
              </span>
            </button>
            <button 
              @click="setSort('patient.name')" 
              class="px-3 py-1 text-sm rounded-md border"
              :class="sortClasses('patient.name')"
            >
              Paciente 
              <span v-if="localSortBy === 'patient.name'">
                {{ localSortDir === 'asc' ? '↑' : '↓' }}
              </span>
            </button>
          </div>
        </div>
        
        <div class="flex justify-end mt-4">
          <button
            @click="clearAllFilters"
            class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-navy bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
          >
            Limpiar filtros
          </button>
        </div>
        
        <!-- Etiquetas de filtros activos -->
        <div v-if="hasActiveFilters" class="mt-4 flex flex-wrap gap-2">
          <span v-if="localSelectedStatus" class="inline-flex items-center rounded-md bg-wave-blue bg-opacity-10 px-2 py-1 text-xs font-medium text-wave-blue ring-1 ring-inset ring-wave-blue/30">
            Estado: {{ localSelectedStatus }}
            <button type="button" @click="clearStatusFilter" class="ml-1">&times;</button>
          </span>
          
          <span v-if="localSelectedDoctorId" class="inline-flex items-center rounded-md bg-wave-teal bg-opacity-10 px-2 py-1 text-xs font-medium text-wave-teal ring-1 ring-inset ring-wave-teal/30">
            Doctor: {{ getDoctorName(localSelectedDoctorId) }}
            <button type="button" @click="clearDoctorFilter" class="ml-1">&times;</button>
          </span>
          
          <span v-if="localSearchPatientName" class="inline-flex items-center rounded-md bg-wave-green bg-opacity-10 px-2 py-1 text-xs font-medium text-wave-green ring-1 ring-inset ring-wave-green/30">
            Paciente: {{ localSearchPatientName }}
            <button type="button" @click="clearPatientSearch" class="ml-1">&times;</button>
          </span>
        </div>
      </details>
    </div>

    <div v-if="appointmentsStore.loading && !isAppointmentModalOpen && !isPatientModalOpen" class="text-center py-10">
      <p class="text-gray-500">Cargando citas...</p>
    </div>

    <div v-else-if="appointmentsStore.currentError && !isAppointmentModalOpen && !isPatientModalOpen" class="rounded-md bg-red-50 p-4 mb-6">
       <div class="flex"> <div class="ml-3"> <h3 class="text-sm font-medium text-red-800">Error al cargar citas</h3> <div class="mt-2 text-sm text-red-700"> <p>{{ appointmentsStore.currentError }}</p> </div> </div> </div>
     </div>

    <div v-else>
      <div v-if="appointmentsStore.appointments.length > 0">
        <h2 class="text-lg font-medium text-gray-900 mb-4">
          Citas para el {{ formattedDate }} {{ filterSuffix }}
        </h2>
        <div class="space-y-4">
           <AppointmentCard
             v-for="appointment in appointmentsStore.appointments"
             :key="appointment.id"
             :appointment="appointment"
             @change-status="changeAppointmentStatus(appointment.id, $event)"
             @edit-appointment="openEditModal(appointment)"
             @delete-appointment="deleteAppointment"
           />
        </div>
      </div>
      <div v-else class="text-center py-10">
        <p class="text-gray-500">No hay citas que coincidan con los filtros seleccionados.</p>
      </div>
    </div>

    <BaseModal :show="isAppointmentModalOpen" @close="closeAppointmentModal">
      <template #title>Agendar Nueva Cita</template>
      <template #default>
        <AppointmentForm ref="appointmentFormRef" @close="closeAppointmentModal" @submitted="handleAppointmentSubmitted"/>
      </template>
      <template #footer>
        <div class="flex flex-col sm:flex-row-reverse w-full gap-2 sm:gap-0">
          <button
            type="button"
            @click="submitAppointmentForm"
            :disabled="appointmentFormRef?.isLoading"
            class="inline-flex justify-center rounded-md bg-secondary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-secondary-light sm:ml-3 disabled:opacity-50 transition-colors"
          >
            <span v-if="appointmentFormRef?.isLoading">Guardando...</span>
            <span v-else>Agendar Cita</span>
          </button>
          <button type="button" @click="closeAppointmentModal" class="inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-navy shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors">Cancelar</button>
        </div>
      </template>
    </BaseModal>

    <!-- Modal para editar cita -->
    <BaseModal :show="isEditModalOpen" @close="closeEditModal">
      <template #title>Editar Cita</template>
      <template #default>
        <AppointmentEditForm 
          v-if="selectedAppointment" 
          ref="editFormRef" 
          :appointment="selectedAppointment" 
          @close="closeEditModal" 
          @submitted="handleEditSubmitted"/>
      </template>
      <template #footer>
        <div class="flex flex-col sm:flex-row-reverse w-full gap-2 sm:gap-0">
          <button
            type="button"
            @click="submitEditForm"
            :disabled="editFormRef?.isLoading"
            class="inline-flex justify-center rounded-md bg-secondary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-secondary-light sm:ml-3 disabled:opacity-50 transition-colors"
          >
            <span v-if="editFormRef?.isLoading">Guardando...</span>
            <span v-else>Actualizar Cita</span>
          </button>
          <button type="button" @click="closeEditModal" class="inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-navy shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors">Cancelar</button>
        </div>
      </template>
    </BaseModal>

    <BaseModal :show="isPatientModalOpen" @close="closePatientModal">
       <template #title>Registrar Nuevo Paciente</template>
       <template #default>
         <PatientForm ref="patientFormRef" @close="closePatientModal" @submitted="handlePatientSubmitted"/>
       </template>
       <template #footer>
         <div class="flex flex-col sm:flex-row-reverse w-full gap-2 sm:gap-0">
           <button
             type="button"
             @click="submitPatientForm"
             :disabled="patientFormRef?.isLoading"
             class="inline-flex justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-light sm:ml-3 disabled:opacity-50 transition-colors"
           >
             <span v-if="patientFormRef?.isLoading">Guardando...</span>
             <span v-else>Registrar Paciente</span>
           </button>
           <button type="button" @click="closePatientModal" class="inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-navy shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors">Cancelar</button>
         </div>
       </template>
     </BaseModal>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useAppointmentsStore } from '@/stores/appointments';
import { usePatientsStore } from '@/stores/patients'; // Importar store de pacientes
import { useDoctorsStore } from '@/stores/doctors'; // Importar store de doctores
import AppointmentCard from '@/components/AppointmentCard.vue';
import BaseModal from '@/components/BaseModal.vue';
import AppointmentForm from '@/components/AppointmentForm.vue';
import AppointmentEditForm from '@/components/AppointmentEditForm.vue';
import PatientForm from '@/components/PatientForm.vue'; // Importar form de paciente

const appointmentsStore = useAppointmentsStore();
const patientsStore = usePatientsStore(); // Usar store de pacientes
const doctorsStore = useDoctorsStore(); // Usar store de doctores

const localSelectedDate = ref(appointmentsStore.date);
const localSelectedStatus = ref(appointmentsStore.status);
const localSelectedDoctorId = ref(appointmentsStore.doctorId);
const localSearchPatientName = ref(appointmentsStore.patientName);
const localSortBy = ref(appointmentsStore.currentSortBy);
const localSortDir = ref(appointmentsStore.currentSortDirection);

const isAppointmentModalOpen = ref(false); // Estado para modal de citas
const isPatientModalOpen = ref(false); // Estado para modal de pacientes
const isEditModalOpen = ref(false); // Estado para modal de edición
const appointmentFormRef = ref(null); // Referencia al form de citas
const patientFormRef = ref(null); // Referencia al form de paciente
const editFormRef = ref(null); // Referencia al form de edición
const selectedAppointment = ref(null); // Cita seleccionada para editar

// Verificar si hay filtros activos
const hasActiveFilters = computed(() => {
  return localSelectedStatus.value || localSelectedDoctorId.value || localSearchPatientName.value;
});

// Texto adicional para el título cuando hay filtros
const filterSuffix = computed(() => {
  const parts = [];
  if (localSelectedStatus.value) {
    parts.push(`con estado "${localSelectedStatus.value}"`);
  }
  if (localSelectedDoctorId.value) {
    parts.push(`del Dr. ${getDoctorName(localSelectedDoctorId.value)}`);
  }
  if (localSearchPatientName.value) {
    parts.push(`que coinciden con "${localSearchPatientName.value}"`);
  }
  
  return parts.length > 0 ? `(${parts.join(' ')})` : '';
});

const formattedDate = computed(() => {
  if (!localSelectedDate.value) return '';
  const date = new Date(localSelectedDate.value + 'T00:00:00');
  return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
});

// Función para obtener el nombre del doctor a partir de su ID
const getDoctorName = (doctorId) => {
  const doctor = doctorsStore.doctors.find(d => d.id === parseInt(doctorId));
  return doctor ? doctor.name : 'Desconocido';
};

// Función para determinar las clases de los botones de ordenamiento
const sortClasses = (field) => {
  return {
    'bg-indigo-50 text-indigo-700 border-indigo-300': localSortBy.value === field,
    'bg-white text-gray-700 border-gray-300 hover:bg-gray-50': localSortBy.value !== field
  };
};

// Función para cambiar el ordenamiento
const setSort = (field) => {
  // Si ya está ordenando por este campo, cambiar dirección
  if (localSortBy.value === field) {
    localSortDir.value = localSortDir.value === 'asc' ? 'desc' : 'asc';
  } else {
    localSortBy.value = field;
    localSortDir.value = 'asc'; // Por defecto ascendente al cambiar campo
  }
  appointmentsStore.setSorting(localSortBy.value, localSortDir.value);
};

const updateDate = () => {
  appointmentsStore.setSelectedDate(localSelectedDate.value);
};

const updateStatus = () => {
  appointmentsStore.setSelectedStatus(localSelectedStatus.value);
};

const updateDoctorId = () => {
  appointmentsStore.setSelectedDoctorId(localSelectedDoctorId.value);
};

const updatePatientName = () => {
  // Aplicar un pequeño debounce para evitar muchas llamadas a la API
  clearTimeout(window._patientSearchTimeout);
  window._patientSearchTimeout = setTimeout(() => {
    appointmentsStore.setSearchPatientName(localSearchPatientName.value);
  }, 300);
};

const clearStatusFilter = () => {
  localSelectedStatus.value = '';
  appointmentsStore.setSelectedStatus('');
};

const clearDoctorFilter = () => {
  localSelectedDoctorId.value = '';
  appointmentsStore.setSelectedDoctorId('');
};

const clearPatientSearch = () => {
  localSearchPatientName.value = '';
  appointmentsStore.setSearchPatientName('');
};

const clearAllFilters = () => {
  clearStatusFilter();
  clearDoctorFilter();
  clearPatientSearch();
};

const changeAppointmentStatus = async (appointmentId, newStatus) => {
    await appointmentsStore.updateAppointmentStatus(appointmentId, newStatus);
    // Refrescar los datos después de cambiar el estado
    refreshDataOnModalClose();
};

// Llamar al submit del formulario de citas
const submitAppointmentForm = () => {
    appointmentFormRef.value?.handleSubmit();
};

// Llamar al submit del formulario de pacientes
const submitPatientForm = () => {
    patientFormRef.value?.handleSubmit();
};

// Llamar al submit del formulario de edición
const submitEditForm = () => {
    editFormRef.value?.handleSubmit();
};

// Abrir modal de edición con la cita seleccionada
const openEditModal = (appointment) => {
    // Recargar los datos antes de abrir el modal
    refreshDataOnModalClose();
    // Asignar la cita seleccionada
    selectedAppointment.value = appointment;
    // Abrir el modal
    isEditModalOpen.value = true;
};

// Eliminar una cita
const deleteAppointment = async (appointmentId) => {
    const success = await appointmentsStore.deleteAppointment(appointmentId);
    if (success) {
        // Refrescar los datos después de eliminar la cita
        refreshDataOnModalClose();
    }
};

// Función para refrescar todos los datos al cerrar un modal
const refreshDataOnModalClose = () => {
  // Recargar las citas
  appointmentsStore.fetchAppointments();
  // Recargar los doctores
  doctorsStore.fetchDoctors();
  // Recargar los pacientes
  patientsStore.fetchPatients();
};

// Funciones para cerrar modales con refresco de datos
const closeAppointmentModal = () => {
  isAppointmentModalOpen.value = false;
  refreshDataOnModalClose();
};

const closePatientModal = () => {
  isPatientModalOpen.value = false;
  refreshDataOnModalClose();
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
  refreshDataOnModalClose();
};

const handleAppointmentSubmitted = () => {
  isAppointmentModalOpen.value = false;
  refreshDataOnModalClose();
};

const handleEditSubmitted = () => {
  isEditModalOpen.value = false;
  refreshDataOnModalClose();
};

// Opcional: Recargar lista de pacientes en el form de citas después de crear uno nuevo
const handlePatientSubmitted = (newPatient) => {
  console.log('Nuevo paciente creado:', newPatient);
  closePatientModal();
};

onMounted(() => {
  // Cargar doctores para el selector de filtros
  doctorsStore.fetchDoctors();
  
  // Cargar pacientes para el selector del form de citas
  patientsStore.fetchPatients();
  
  // Cargar citas con los filtros actuales
  appointmentsStore.fetchAppointments();
  
  // appointmentsStore.subscribeToRealtimeUpdates();
});

onUnmounted(() => {
  // appointmentsStore.unsubscribeFromRealtimeUpdates();
});
</script>