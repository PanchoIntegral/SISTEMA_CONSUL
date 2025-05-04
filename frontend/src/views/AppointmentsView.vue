<template>
  <div class="p-4 md:p-8">
    <h1 class="text-2xl font-semibold mb-6 text-gray-800">Gestión de Citas</h1>

    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div class="flex items-center gap-2">
        <label for="appointment-date" class="text-sm font-medium text-gray-700">Seleccionar Fecha:</label>
        <input
          type="date"
          id="appointment-date"
          v-model="localSelectedDate"
          @change="updateDate"
          class="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
        />
      </div>
      <div class="flex gap-2">
        <button
           @click="isPatientModalOpen = true" class="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
        >
          + Nuevo Paciente
        </button>
        <button
           @click="isAppointmentModalOpen = true" class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          + Nueva Cita
        </button>
      </div>
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
          Citas para el {{ formattedDate }}
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
        <p class="text-gray-500">No hay citas programadas para esta fecha.</p>
      </div>
    </div>

    <BaseModal :show="isAppointmentModalOpen" @close="isAppointmentModalOpen = false">
      <template #title>Agendar Nueva Cita</template>
      <template #default>
        <AppointmentForm ref="appointmentFormRef" @close="isAppointmentModalOpen = false" @submitted="isAppointmentModalOpen = false"/>
      </template>
      <template #footer>
        <button
          type="button"
          @click="submitAppointmentForm"
          :disabled="appointmentFormRef?.isLoading"
          class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto disabled:opacity-50"
        >
          <span v-if="appointmentFormRef?.isLoading">Guardando...</span>
          <span v-else>Agendar Cita</span>
        </button>
        <button type="button" @click="isAppointmentModalOpen = false" class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">Cancelar</button>
      </template>
    </BaseModal>

    <!-- Modal para editar cita -->
    <BaseModal :show="isEditModalOpen" @close="isEditModalOpen = false">
      <template #title>Editar Cita</template>
      <template #default>
        <AppointmentEditForm 
          v-if="selectedAppointment" 
          ref="editFormRef" 
          :appointment="selectedAppointment" 
          @close="isEditModalOpen = false" 
          @submitted="isEditModalOpen = false"/>
      </template>
      <template #footer>
        <button
          type="button"
          @click="submitEditForm"
          :disabled="editFormRef?.isLoading"
          class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto disabled:opacity-50"
        >
          <span v-if="editFormRef?.isLoading">Guardando...</span>
          <span v-else>Actualizar Cita</span>
        </button>
        <button type="button" @click="isEditModalOpen = false" class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">Cancelar</button>
      </template>
    </BaseModal>

    <BaseModal :show="isPatientModalOpen" @close="isPatientModalOpen = false">
       <template #title>Registrar Nuevo Paciente</template>
       <template #default>
         <PatientForm ref="patientFormRef" @close="isPatientModalOpen = false" @submitted="handlePatientSubmitted"/>
       </template>
       <template #footer>
         <button
           type="button"
           @click="submitPatientForm"
           :disabled="patientFormRef?.isLoading"
           class="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto disabled:opacity-50"
         >
           <span v-if="patientFormRef?.isLoading">Guardando...</span>
           <span v-else>Registrar Paciente</span>
         </button>
         <button type="button" @click="isPatientModalOpen = false" class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">Cancelar</button>
       </template>
     </BaseModal>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useAppointmentsStore } from '@/stores/appointments';
import { usePatientsStore } from '@/stores/patients'; // Importar store de pacientes
import AppointmentCard from '@/components/AppointmentCard.vue';
import BaseModal from '@/components/BaseModal.vue';
import AppointmentForm from '@/components/AppointmentForm.vue';
import AppointmentEditForm from '@/components/AppointmentEditForm.vue';
import PatientForm from '@/components/PatientForm.vue'; // Importar form de paciente

const appointmentsStore = useAppointmentsStore();
const patientsStore = usePatientsStore(); // Usar store de pacientes

const localSelectedDate = ref(appointmentsStore.date);
const isAppointmentModalOpen = ref(false); // Estado para modal de citas
const isPatientModalOpen = ref(false); // Estado para modal de pacientes
const isEditModalOpen = ref(false); // Estado para modal de edición
const appointmentFormRef = ref(null); // Referencia al form de citas
const patientFormRef = ref(null); // Referencia al form de paciente
const editFormRef = ref(null); // Referencia al form de edición
const selectedAppointment = ref(null); // Cita seleccionada para editar

const formattedDate = computed(() => {
  if (!localSelectedDate.value) return '';
  const date = new Date(localSelectedDate.value + 'T00:00:00');
  return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
});

const updateDate = () => {
  appointmentsStore.setSelectedDate(localSelectedDate.value);
};

const changeAppointmentStatus = (appointmentId, newStatus) => {
    appointmentsStore.updateAppointmentStatus(appointmentId, newStatus);
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
    selectedAppointment.value = appointment;
    isEditModalOpen.value = true;
};

// Eliminar una cita
const deleteAppointment = async (appointmentId) => {
    const success = await appointmentsStore.deleteAppointment(appointmentId);
    if (success) {
        // La cita ya se eliminó del store en la acción deleteAppointment
    }
};

// Opcional: Recargar lista de pacientes en el form de citas después de crear uno nuevo
const handlePatientSubmitted = (newPatient) => {
    console.log('Nuevo paciente creado:', newPatient);
   
};

onMounted(() => {
  appointmentsStore.fetchAppointments(localSelectedDate.value);
  // Cargar pacientes al inicio para el selector del form de citas
  patientsStore.fetchPatients();
  // appointmentsStore.subscribeToRealtimeUpdates();
});

onUnmounted(() => {
  // appointmentsStore.unsubscribeFromRealtimeUpdates();
});
</script>