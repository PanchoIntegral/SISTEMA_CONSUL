<template>
  <div class="p-2 sm:p-4 md:p-8">
    <!-- Toggle para cambiar entre modos -->
    <div class="mb-6 flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
      <div>
        <h1 class="text-2xl font-semibold text-gray-800">Gestión de Citas</h1>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-sm font-medium text-gray-700">Vista por Doctor</span>
        <button
          @click="doctorBoardMode = !doctorBoardMode"
          type="button"
          :class="[
            doctorBoardMode ? 'bg-secondary' : 'bg-gray-200',
            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2'
          ]"
        >
          <span
            :class="[
              doctorBoardMode ? 'translate-x-5' : 'translate-x-0',
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
            ]"
          />
        </button>
      </div>
    </div>

    <!-- Controles compartidos entre ambos modos -->
    <div class="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-4 mb-6">
      <div class="w-full sm:w-auto flex items-center gap-2">
        <label for="appointment-date" class="text-sm font-medium text-gray-700 min-w-fit">Fecha:</label>
        <input
          id="appointment-date"
          ref="dateInput"
          readonly
          :value="displayDate"
          class="flatpickr-input block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm p-2 bg-white cursor-pointer"
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

    <DoctorBoardView
      v-if="doctorBoardMode"
      :doctors="doctorsStore.doctors"
      :appointments="appointmentsStore.appointments"
      :selectedDate="localSelectedDate"
      @change-status="changeAppointmentStatus"
      @edit-appointment="openEditModal"
      @delete-appointment="deleteAppointment"
      @update-tag="updateMedicalProcessTag"
    />
    
    <!-- Modo normal con filtros y lista -->
    <template v-if="!doctorBoardMode">
      <!-- Filtros rápidos por turno -->
      <div class="bg-white p-3 sm:p-4 rounded-lg shadow mb-4">
        <h3 class="text-sm font-medium text-navy mb-3">Filtro rápido por turno:</h3>
        <div class="flex flex-wrap gap-2">
          <button 
            @click="setQuickShiftFilter('')"
            :class="quickShiftButtonClasses('')"
            class="px-4 py-2 text-sm font-medium rounded-md border transition-colors duration-200 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Todos los turnos
          </button>
          <button 
            @click="setQuickShiftFilter('mañana')"
            :class="quickShiftButtonClasses('mañana')"
            class="px-4 py-2 text-sm font-medium rounded-md border transition-colors duration-200 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Mañana
          </button>
          <button 
            @click="setQuickShiftFilter('tarde')"
            :class="quickShiftButtonClasses('tarde')"
            class="px-4 py-2 text-sm font-medium rounded-md border transition-colors duration-200 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            Tarde
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

            <!-- Nuevo: Filtro por turno -->
            <div>
              <label for="shift-filter" class="block text-sm font-medium text-navy">Por turno:</label>
              <select
                id="shift-filter"
                v-model="localSelectedShift"
                @change="updateShift"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm p-2"
              >
                <option value="">Todos los turnos</option>
                <option value="mañana">☀️ Turno Mañana</option>
                <option value="tarde">🌙 Turno Tarde</option>
              </select>
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
            
            <span v-if="localSelectedShift" class="inline-flex items-center rounded-md bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800 ring-1 ring-inset ring-purple-600/30">
              Turno: {{ getShiftDisplayName(localSelectedShift) }}
              <button type="button" @click="clearShiftFilter" class="ml-1">&times;</button>
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
               @update-tag="updateMedicalProcessTag(appointment.id, $event)"
             />
          </div>
        </div>
        <div v-else class="text-center py-10">
          <p class="text-gray-500">No hay citas que coincidan con los filtros seleccionados.</p>
        </div>
      </div>
    </template>

    <!-- Modales compartidos entre ambos modos -->
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
import flatpickr from 'flatpickr';
import { Spanish } from 'flatpickr/dist/l10n/es.js';
import { useAppointmentsStore } from '@/stores/appointments';
import { usePatientsStore } from '@/stores/patients'; // Importar store de pacientes
import { useDoctorsStore } from '@/stores/doctors'; // Importar store de doctores
import AppointmentCard from '@/components/AppointmentCard.vue';
import BaseModal from '@/components/BaseModal.vue';
import AppointmentForm from '@/components/AppointmentForm.vue';
import AppointmentEditForm from '@/components/AppointmentEditForm.vue';
import PatientForm from '@/components/PatientForm.vue'; // Importar form de paciente
import DoctorBoardView from '@/components/DoctorBoardView.vue';

const appointmentsStore = useAppointmentsStore();
const patientsStore = usePatientsStore(); // Usar store de pacientes
const doctorsStore = useDoctorsStore(); // Usar store de doctores

const localSelectedDate = ref(appointmentsStore.date);
const dateInput = ref(null);
const displayDate = computed(() => {
  if (!localSelectedDate.value) return '';
  // Mostrar en formato dd/mm/YYYY
  const [y, m, d] = localSelectedDate.value.split('-');
  return `${d}/${m}/${y}`;
});
const localSelectedStatus = ref(appointmentsStore.status);
const localSelectedDoctorId = ref(appointmentsStore.doctorId);
const localSearchPatientName = ref(appointmentsStore.patientName);
const localSelectedShift = ref(appointmentsStore.shift);
const localSortBy = ref(appointmentsStore.currentSortBy);
const localSortDir = ref(appointmentsStore.currentSortDirection);

const isAppointmentModalOpen = ref(false); // Estado para modal de citas
const isPatientModalOpen = ref(false); // Estado para modal de pacientes
const isEditModalOpen = ref(false); // Estado para modal de edición
const appointmentFormRef = ref(null); // Referencia al form de citas
const patientFormRef = ref(null); // Referencia al form de paciente
const editFormRef = ref(null); // Referencia al form de edición
const selectedAppointment = ref(null); // Cita seleccionada para editar
const doctorBoardMode = ref(false);

// Verificar si hay filtros activos
const hasActiveFilters = computed(() => {
  return localSelectedStatus.value || localSelectedDoctorId.value || localSearchPatientName.value || localSelectedShift.value;
});

// Texto adicional para el título cuando hay filtros
const filterSuffix = computed(() => {
  const parts = [];
  if (localSelectedStatus.value) {
    parts.push(`con estado "${localSelectedStatus.value}"`);
  }
  if (localSelectedDoctorId.value) {
    parts.push(`de ${getDoctorName(localSelectedDoctorId.value)}`);
  }
  if (localSearchPatientName.value) {
    parts.push(`que coinciden con "${localSearchPatientName.value}"`);
  }
  if (localSelectedShift.value) {
    parts.push(`del turno de ${localSelectedShift.value}`);
  }
  
  return parts.length > 0 ? `(${parts.join(' ')})` : '';
});

const formattedDate = computed(() => {
  if (!localSelectedDate.value) return '';
  // Parsear la fecha directamente sin conversión de zona horaria
  const [year, month, day] = localSelectedDate.value.split('-').map(Number);
  const date = new Date(year, month - 1, day); // Crear fecha local
  
  const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                     'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  
  return `${day} de ${monthNames[month - 1]} de ${year}`;
});

// Función para obtener el nombre del doctor a partir de su ID
const getDoctorName = (doctorId) => {
  const doctor = doctorsStore.doctors.find(d => d.id === parseInt(doctorId));
  if (!doctor) return 'Desconocido';
  
  const doctorName = doctor.name;
  // Verificar si el nombre ya incluye un título (Dr., Dra., Doctor, Doctora)
  const hasTitle = /^(Dr\.?|Dra\.?|Doctor|Doctora)/i.test(doctorName);
  
  return hasTitle ? doctorName : `Dr. ${doctorName}`;
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
  appointmentsStore.fetchAppointments(); // Solo la fecha recarga del servidor
};

const updateStatus = () => {
  appointmentsStore.setSelectedStatus(localSelectedStatus.value);
  // Filtrado instantáneo, no necesita recarga
};

const updateDoctorId = () => {
  appointmentsStore.setSelectedDoctorId(localSelectedDoctorId.value);
  // Filtrado instantáneo, no necesita recarga
};

const updatePatientName = () => {
  appointmentsStore.setSearchPatientName(localSearchPatientName.value);
  // Filtrado instantáneo, no necesita recarga
};

const updateShift = () => {
  appointmentsStore.setSelectedShift(localSelectedShift.value);
  // Filtrado instantáneo, no necesita recarga
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

const clearShiftFilter = () => {
  localSelectedShift.value = '';
  appointmentsStore.setSelectedShift('');
};

const clearAllFilters = () => {
  clearStatusFilter();
  clearDoctorFilter();
  clearPatientSearch();
  clearShiftFilter();
};

// Funciones para los filtros rápidos de turno
const setQuickShiftFilter = (shiftValue) => {
  localSelectedShift.value = shiftValue;
  appointmentsStore.setSelectedShift(shiftValue);
};

// Función para determinar las clases de los botones de filtro rápido de turno
const quickShiftButtonClasses = (shift) => {
  const isSelected = localSelectedShift.value === shift;
  
  switch (shift) {
    case 'mañana':
      return isSelected 
        ? 'bg-orange-100 text-orange-800 border-orange-300 shadow-sm' 
        : 'bg-white text-gray-700 border-gray-300 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200';
    case 'tarde':
      return isSelected 
        ? 'bg-indigo-100 text-indigo-800 border-indigo-300 shadow-sm' 
        : 'bg-white text-gray-700 border-gray-300 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200';
    default: // 'todos' o empty
      return isSelected 
        ? 'bg-secondary text-white border-secondary shadow-sm' 
        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400';
  }
};

// Función para obtener el nombre de visualización del turno
const getShiftDisplayName = (shift) => {
  const shiftNames = {
    'mañana': 'Mañana',
    'tarde': 'Tarde'
  };
  return shiftNames[shift] || shift;
};

const updateMedicalProcessTag = async (appointmentId, tag) => {
    await appointmentsStore.updateAppointmentData(appointmentId, { medical_process_tag: tag });
    // No es necesario refrescar, la actualización optimista ya lo hace
};

const changeAppointmentStatus = async (appointmentId, newStatus) => {
    await appointmentsStore.updateAppointmentStatus(appointmentId, newStatus);
    // No es necesario refrescar, la actualización optimista ya lo hace
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
    // Asignar la cita seleccionada
    selectedAppointment.value = appointment;
    // Abrir el modal
    isEditModalOpen.value = true;
};

// Eliminar una cita
const deleteAppointment = async (appointmentId) => {
    const success = await appointmentsStore.deleteAppointment(appointmentId);
    // No es necesario refrescar, la eliminación optimista ya lo hace
};

// Función para refrescar datos solo cuando se abren/cierran modales
const refreshDataOnModalClose = () => {
  // Solo recargar las citas si es necesario (por ejemplo, después de crear)
  // No recargar doctores ni pacientes a menos que sea necesario
};

// Funciones para cerrar modales
const closeAppointmentModal = () => {
  isAppointmentModalOpen.value = false;
  // No es necesario refrescar después de crear (la creación optimista ya lo hace)
};

const closePatientModal = () => {
  isPatientModalOpen.value = false;
  // Recargar solo la lista de pacientes para el selector
  patientsStore.fetchPatients(); 
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
  // No es necesario refrescar después de editar (la actualización optimista ya lo hace)
};

const handleAppointmentSubmitted = () => {
  isAppointmentModalOpen.value = false;
  // Las citas ya se recargaron en el store después de crear
};

const handleEditSubmitted = () => {
  isEditModalOpen.value = false;
  // La cita ya fue actualizada optimistamente en el store
};

// Opcional: Recargar lista de pacientes después de crear uno nuevo
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

  // Inicializar flatpickr en el input de fecha
  if (dateInput.value) {
    flatpickr(dateInput.value, {
      locale: Spanish,
      altInput: true,
      altFormat: 'd/m/Y',
      dateFormat: 'Y-m-d',
      defaultDate: localSelectedDate.value || new Date(),
      onChange: function(selectedDates, dateStr) {
        localSelectedDate.value = dateStr;
        updateDate();
      },
      wrap: false,
      allowInput: false
    });
  }
  
  // appointmentsStore.subscribeToRealtimeUpdates();
});

onUnmounted(() => {
  // appointmentsStore.unsubscribeFromRealtimeUpdates();
});
</script>

<style scoped>
/* Estilos para los iconos de turno */
.shift-icon {
  transition: transform 0.2s ease;
}

.shift-icon:hover {
  transform: scale(1.1);
}

/* Mejoras para botones de filtro rápido */
button:hover .shift-icon {
  transform: translateY(-1px);
}

/* Animación suave para iconos SVG */
svg {
  transition: all 0.2s ease;
}

/* Hover effects para botones */
button:hover svg {
  transform: scale(1.05);
}

button:active svg {
  transform: scale(0.95);
}
</style>