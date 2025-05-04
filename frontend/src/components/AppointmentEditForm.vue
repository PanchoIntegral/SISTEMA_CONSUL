<template>
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label for="patient" class="block text-sm font-medium text-gray-700">Paciente</label>
        <p class="mt-1 text-sm text-gray-600">{{ appointment.patient?.name || 'N/A' }}</p>
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
  </template>
  
  <script setup>
  import { ref, reactive, onMounted } from 'vue';
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
  
  // Convertir la fecha ISO a formato local para el input datetime-local
  onMounted(() => {
    if (props.appointment.appointment_time) {
      try {
        const date = new Date(props.appointment.appointment_time);
        // Formato YYYY-MM-DDThh:mm requerido por input datetime-local
        formData.appointment_time_local = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
          .toISOString()
          .slice(0, 16);
      } catch (e) {
        console.error("Error formatting appointment time:", e);
        errorMessage.value = "Error al cargar la fecha de la cita";
      }
    }
    
    // Cargar doctores
    doctorsStore.fetchDoctors();
  });
  
  // Manejar envío
  const handleSubmit = async () => {
    isLoading.value = true;
    errorMessage.value = '';
  
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
      doctor_id: formData.doctor_id ? parseInt(formData.doctor_id, 10) : null, // Número o null
      appointment_time: appointmentTimeISO, // Enviar formato ISO UTC
      notes: formData.notes || null, // Enviar null si está vacío
    };
  
    // Llamar a la acción del store para actualizar la cita
    const success = await appointmentsStore.updateAppointmentData(props.appointment.id, dataToSend);
  
    isLoading.value = false;
    if (success) {
      emit('submitted'); // Indicar éxito al padre (modal)
      emit('close'); // Cerrar el modal
    } else {
      // Mostrar error del store
      errorMessage.value = appointmentsStore.currentError || 'Error desconocido al actualizar la cita.';
    }
  };
  
  // Exponer handleSubmit para que el botón en el slot del modal lo llame
  defineExpose({ handleSubmit, isLoading });
  </script>