<template>
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label for="patient" class="block text-sm font-medium text-gray-700">Paciente</label>
        <select
          id="patient"
          v-model="formData.patient_id"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
          :disabled="patientsStore.loading"
        >
          <option disabled value="">Seleccione un paciente</option>
          <option v-if="patientsStore.loading" value="">Cargando...</option>
          <option v-for="patient in patientsStore.patients" :key="patient.id" :value="patient.id">
            {{ patient.name }}
          </option>
        </select>
      </div>
  
      <div>
        <label for="doctor" class="block text-sm font-medium text-gray-700">Doctor</label>
        <select
          id="doctor"
          v-model="formData.doctor_id"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
          :disabled="doctorsStore.loading"
        >
          <option value="">(Opcional) Seleccione un doctor</option>
           <option v-if="doctorsStore.loading" value="">Cargando...</option>
          <option v-for="doctor in doctorsStore.doctors" :key="doctor.id" :value="doctor.id">
            {{ doctor.name }}
          </option>
        </select>
      </div>
  
      <div>
        <label for="appointment-time" class="block text-sm font-medium text-gray-700">Fecha y Hora</label>
        <input
          type="datetime-local"
          id="appointment-time"
          v-model="formData.appointment_time_local"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
        />
      </div>
  
      <div>
        <label for="notes" class="block text-sm font-medium text-gray-700">Notas (Opcional)</label>
        <textarea
          id="notes"
          v-model="formData.notes"
          rows="3"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
        ></textarea>
      </div>
  
       <div v-if="errorMessage" class="text-sm text-red-600" role="alert">
         {{ errorMessage }}
       </div>
  
      </form>

      <!-- Alerta de doctor no disponible -->
      <div v-if="showDoctorUnavailableAlert" 
           class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-red-600">Doctor No Disponible</h3>
            <button @click="showDoctorUnavailableAlert = false" class="text-gray-400 hover:text-gray-500">
              <span class="sr-only">Cerrar</span>
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p class="mb-4">El doctor seleccionado ya tiene una cita programada en este horario. Por favor, elija otro horario o un doctor diferente.</p>
          <div class="flex justify-end">
            <button 
              @click="showDoctorUnavailableAlert = false"
              class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted } from 'vue';
  import { usePatientsStore } from '@/stores/patients';
  import { useDoctorsStore } from '@/stores/doctors';
  import { useAppointmentsStore } from '@/stores/appointments';
  
  // Emits para comunicar con el modal/padre
  const emit = defineEmits(['close', 'submitted']);
  
  // Stores
  const patientsStore = usePatientsStore();
  const doctorsStore = useDoctorsStore();
  const appointmentsStore = useAppointmentsStore();
  
  // Estado del formulario
  const formData = reactive({
    patient_id: '',
    doctor_id: '', // Importante inicializar como string vacío para el <select>
    appointment_time_local: '', // Usamos local para el input
    notes: '',
  });
  const isLoading = ref(false);
  const errorMessage = ref('');
  const showDoctorUnavailableAlert = ref(false);
  
  // Cargar pacientes y doctores al montar
  onMounted(() => {
    patientsStore.fetchPatients();
    doctorsStore.fetchDoctors();
  });
  
  // Manejar envío
  const handleSubmit = async () => {
    isLoading.value = true;
    errorMessage.value = '';
    showDoctorUnavailableAlert.value = false;
  
    // Convertir fecha/hora local a ISO string UTC (formato Z)
    let appointmentTimeISO = '';
    try {
      if (!formData.appointment_time_local) throw new Error("Fecha y hora requeridas");
      // Crear objeto Date desde el input local. El navegador lo interpreta en la zona local.
      const localDate = new Date(formData.appointment_time_local);
      if (isNaN(localDate.getTime())) throw new Error("Fecha y hora inválidas");
      // Convertir a ISO string. toISOString() SIEMPRE devuelve UTC (con Z)
      appointmentTimeISO = localDate.toISOString();
    } catch (err) {
       errorMessage.value = err.message || "Error procesando fecha y hora.";
       isLoading.value = false;
       return;
    }
  
  
    const dataToSend = {
      patient_id: parseInt(formData.patient_id, 10), // Asegurar que sea número
      doctor_id: formData.doctor_id ? parseInt(formData.doctor_id, 10) : null, // Número o null
      appointment_time: appointmentTimeISO, // Enviar formato ISO UTC
      notes: formData.notes || null, // Enviar null si está vacío
    };
  
    try {
      // Llamar a la acción del store para crear la cita
      const success = await appointmentsStore.createAppointment(dataToSend);
      
      isLoading.value = false;
      if (success) {
        emit('submitted'); // Indicar éxito al padre (modal)
        emit('close'); // Cerrar el modal
      }
    } catch (err) {
      isLoading.value = false;
      // Verificar si es el error específico de doctor no disponible
      if (err.error_type === 'doctor_unavailable') {
        showDoctorUnavailableAlert.value = true;
      } else {
        // Mostrar error general
        errorMessage.value = err.message || appointmentsStore.currentError || 'Error desconocido al crear la cita.';
      }
    }
  };
  
  // Exponer handleSubmit para que el botón en el slot del modal lo llame
  defineExpose({ handleSubmit, isLoading });
  </script>