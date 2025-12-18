<template>
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label for="patient" class="block text-sm font-semibold text-navy">Paciente</label>
        <p class="mt-1 text-sm text-gray-700 font-medium">{{ appointment.patient?.name || 'N/A' }}</p>
      </div>
  
      <div>
        <label for="doctor" class="block text-sm font-medium text-gray-700">Doctor</label>
        <select
          id="doctor"
          v-model="formData.doctor_id"
          class="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm"
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
        <label for="appointment-time" class="block text-sm font-semibold text-navy">Fecha y Hora</label>
        <input
          id="appointment-time"
          ref="dateTimeInput"
          readonly
          :value="formData.appointment_time_local ? formData.appointment_time_local.replace('T', ' ') : ''"
          class="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm flatpickr-input"
        />
      </div>
  
      <div>
        <label for="notes" class="block text-sm font-semibold text-navy">Notas (Opcional)</label>
        <textarea
          id="notes"
          v-model="formData.notes"
          rows="3"
          class="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm"
        ></textarea>
      </div>
  
       <div v-if="errorMessage" class="text-sm text-red-600 bg-red-50 border border-red-100 rounded p-2" role="alert">
         {{ errorMessage }}
       </div>
  
      </form>

      <!-- Alerta inline: doctor no disponible (estética del sistema) -->
      <div v-if="showDoctorUnavailableAlert" class="mt-3">
        <div class="bg-red-50 border border-red-100 rounded-lg p-4 flex items-start gap-3">
          <div class="text-red-600">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
            </svg>
          </div>
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-semibold text-red-600">Doctor no disponible</h4>
              <button @click="showDoctorUnavailableAlert = false" class="text-gray-400 hover:text-gray-500">
                <span class="sr-only">Cerrar</span>
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p class="mt-1 text-sm text-gray-700">El doctor seleccionado ya tiene una cita en ese horario. Elige otro horario o doctor.</p>
          </div>
        </div>
      </div>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted, onUnmounted } from 'vue';
  import { useDoctorsStore } from '@/stores/doctors';
  import { useAppointmentsStore } from '@/stores/appointments';
  
  // Props
  const props = defineProps({
    appointment: {
      type: Object,
      required: true,
    },
  });
  
  // Emits para comunicar con el modal/padre
  const emit = defineEmits(['close', 'submitted']);
  
  // Stores
  const doctorsStore = useDoctorsStore();
  const appointmentsStore = useAppointmentsStore();
  
  // Estado del formulario
  const formData = reactive({
    doctor_id: props.appointment.doctor?.id || '',
    appointment_time_local: '',
    notes: props.appointment.notes || '',
  });
  const isLoading = ref(false);
  const errorMessage = ref('');
  const showDoctorUnavailableAlert = ref(false);
  
  // Convertir la fecha ISO a formato local para el input datetime-local
  const dateTimeInput = ref(null);
  let fpInstance = null;

  onMounted(async () => {
    if (props.appointment.appointment_time) {
      try {
        // Importar la utilidad de zona horaria
        const { convertUTCToTijuanaLocal } = await import('@/utils/timezoneUtils.js');
        
        // Convertir la fecha UTC a hora local de Tijuana
        const tijuanaTime = convertUTCToTijuanaLocal(props.appointment.appointment_time);
        
        // Formato YYYY-MM-DDThh:mm requerido por input datetime-local
        formData.appointment_time_local = `${tijuanaTime.date}T${tijuanaTime.time}`;
        
        console.log('Fecha UTC original:', props.appointment.appointment_time);
        console.log('Fecha convertida a Tijuana:', formData.appointment_time_local);
        
      } catch (e) {
        console.error("Error formatting appointment time:", e);
        errorMessage.value = "Error al cargar la fecha de la cita";
      }
    }
    
    // Cargar doctores
    doctorsStore.fetchDoctors();
    // Inicializar flatpickr (calendar + time) para una experiencia consistente
    try {
      const flatpickr = (await import('flatpickr')).default;
      const { Spanish } = await import('flatpickr/dist/l10n/es.js');
      fpInstance = flatpickr(dateTimeInput.value, {
        locale: Spanish,
        enableTime: true,
        time_24hr: true,
        altInput: true,
        altFormat: 'd/m/Y H:i',
        dateFormat: "Y-m-d\\TH:i",
        defaultDate: formData.appointment_time_local || null,
        allowInput: false,
        onChange(selectedDates, dateStr) {
          formData.appointment_time_local = dateStr;
        }
      });
    } catch (e) {
      console.warn('flatpickr init failed:', e);
    }
  });

  onUnmounted(() => {
    if (fpInstance && typeof fpInstance.destroy === 'function') fpInstance.destroy();
  });
  
  // Manejar envío
  const handleSubmit = async () => {
    isLoading.value = true;
    errorMessage.value = '';
    showDoctorUnavailableAlert.value = false;
  
    // Convertir fecha/hora usando la utilidad de zona horaria de Tijuana
    let appointmentTimeISO = '';
    try {
      if (!formData.appointment_time_local) throw new Error("Fecha y hora requeridas");
      
      // Extraer componentes de fecha y hora del input datetime-local
      const dateTimeLocal = formData.appointment_time_local; // Formato: "YYYY-MM-DDTHH:MM"
      const [datePart, timePart] = dateTimeLocal.split('T');
      
      // Importar la utilidad de zona horaria
      const { createTijuanaDateTimeAsUTC } = await import('@/utils/timezoneUtils.js');
      
      // Convertir la fecha/hora seleccionada a UTC considerando zona horaria de Tijuana
      appointmentTimeISO = createTijuanaDateTimeAsUTC(datePart, timePart);
      
      console.log('Fecha/hora seleccionada:', dateTimeLocal);
      console.log('Fecha convertida a UTC (desde Tijuana):', appointmentTimeISO);
      
    } catch (err) {
       errorMessage.value = err.message || "Error procesando fecha y hora.";
       isLoading.value = false;
       return;
    }
  
    const dataToSend = {
      doctor_id: formData.doctor_id ? parseInt(formData.doctor_id, 10) : null, // Número o null
      appointment_time: appointmentTimeISO, // Enviar formato ISO UTC
      notes: formData.notes || null, // Enviar null si está vacío
    };
  
    try {
      // Llamar a la acción del store para actualizar la cita
      const success = await appointmentsStore.updateAppointmentData(props.appointment.id, dataToSend);
      
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
        errorMessage.value = err.message || appointmentsStore.currentError || 'Error desconocido al actualizar la cita.';
      }
    }
  };
  
  // Exponer handleSubmit para que el botón en el slot del modal lo llame
  defineExpose({ handleSubmit, isLoading });
  </script>