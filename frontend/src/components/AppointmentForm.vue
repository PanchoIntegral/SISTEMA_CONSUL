<template>
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="grid grid-cols-1 gap-4">
        <!-- Paciente -->
        <div>
          <label for="patient_id" class="block text-sm font-medium text-navy">Paciente *</label>
          <div class="mt-1 relative">
            <select
              id="patient_id"
              v-model="formData.patient_id"
              required
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm"
              :disabled="patientsStore.loading"
            >
              <option value="" disabled>Seleccionar Paciente</option>
              <option v-if="patientsStore.loading" value="">Cargando...</option>
              <option v-for="patient in patientsStore.patients" :key="patient.id" :value="patient.id">
                {{ patient.name }}
              </option>
            </select>
            <div v-if="formErrors.patient_id" class="text-red-500 text-xs mt-1">{{ formErrors.patient_id }}</div>
          </div>
        </div>
  
        <!-- Doctor -->
        <div>
          <label for="doctor_id" class="block text-sm font-medium text-navy">Doctor *</label>
          <div class="mt-1">
            <select
              id="doctor_id"
              v-model="formData.doctor_id"
              required
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm"
              :disabled="doctorsStore.loading"
            >
              <option value="" disabled>Seleccionar Doctor</option>
              <option v-if="doctorsStore.loading" value="">Cargando...</option>
              <option v-for="doctor in doctorsStore.doctors" :key="doctor.id" :value="doctor.id">
                {{ doctor.name }}
              </option>
            </select>
            <div v-if="formErrors.doctor_id" class="text-red-500 text-xs mt-1">{{ formErrors.doctor_id }}</div>
          </div>
        </div>
  
        <!-- Fecha y Hora de la Cita -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="appointment_date" class="block text-sm font-medium text-navy">Fecha *</label>
            <div class="mt-1">
              <input
                type="date"
                id="appointment_date"
                v-model="formData.appointment_date"
                required
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm"
              />
              <div v-if="formErrors.appointment_date" class="text-red-500 text-xs mt-1">{{ formErrors.appointment_date }}</div>
            </div>
          </div>
  
          <div>
            <label for="appointment_time" class="block text-sm font-medium text-navy">Hora *</label>
            <div class="mt-1">
              <input
                type="time"
                id="appointment_time"
                v-model="formData.appointment_time"
                required
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm"
              />
              <div v-if="formErrors.appointment_time" class="text-red-500 text-xs mt-1">{{ formErrors.appointment_time }}</div>
            </div>
          </div>
        </div>
  
        <!-- Notas -->
        <div>
          <label for="notes" class="block text-sm font-medium text-navy">Notas (opcional)</label>
          <div class="mt-1">
            <textarea
              id="notes"
              v-model="formData.notes"
              rows="3"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm"
              placeholder="Agregar información adicional relevante para la cita..."
            ></textarea>
          </div>
        </div>
  
        <!-- Error general -->
        <div v-if="errorMessage" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Error al guardar</h3>
              <div class="mt-2 text-sm text-red-700">
                <p>{{ errorMessage }}</p>
              </div>
            </div>
          </div>
        </div>
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
  appointment_date: '',
  appointment_time: '',
  notes: '',
});
const isLoading = ref(false);
const errorMessage = ref('');
const showDoctorUnavailableAlert = ref(false);
const formErrors = ref({});

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
    if (!formData.appointment_date || !formData.appointment_time) throw new Error("Fecha y hora requeridas");
    // Crear objeto Date desde el input local. El navegador lo interpreta en la zona local.
    const localDate = new Date(`${formData.appointment_date}T${formData.appointment_time}`);
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