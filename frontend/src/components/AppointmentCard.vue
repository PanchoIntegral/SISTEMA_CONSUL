<template>
    <div class="p-4 border rounded-md shadow-sm bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div class="flex-grow">
        <div class="flex items-center gap-3 mb-2">
          <span class="font-semibold text-lg text-indigo-700">{{ formattedTime }}</span>
          <span
            :class="statusClass"
            class="text-xs font-medium px-2.5 py-0.5 rounded-full"
          >
            {{ appointment.status }}
          </span>
        </div>
        <p class="text-sm font-medium text-gray-900 flex items-center">
          Paciente: {{ appointment.patient?.name || 'N/A' }}
          <span v-if="appointment.is_recurring_patient" class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800" title="Paciente recurrente">
            <svg class="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clip-rule="evenodd"></path>
            </svg>
            Recurrente
          </span>
        </p>
        <p class="text-sm text-gray-600">
          Doctor: {{ appointment.doctor?.name || 'N/A' }}
        </p>
        <p v-if="appointment.notes" class="text-xs text-gray-500 mt-1">
          Notas: {{ appointment.notes }}
        </p>
  
        <div class="mt-2 text-sm text-gray-700">
           <TimerDisplay :status="appointment.status" :start-time="timerStartTime" />
           <span v-if="appointment.status === 'Completada' && (appointment.calculated_wait_time_seconds !== null || appointment.calculated_consultation_time_seconds !== null)">
               Espera: {{ formatDuration(appointment.calculated_wait_time_seconds) }} /
               Consulta: {{ formatDuration(appointment.calculated_consultation_time_seconds) }}
           </span>
        </div>
        </div>
  
      <div class="flex flex-wrap gap-2 justify-start sm:justify-end w-full sm:w-auto flex-shrink-0">
         <!-- Botones de estado -->
         <button
           @click="$emit('change-status', 'En Espera')"
           v-if="appointment.status === 'Programada'"
           class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
         >
           Marcar Llegada
         </button>
         <button
           @click="$emit('change-status', 'En Consulta')"
           v-if="appointment.status === 'En Espera'"
           class="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1"
         >
           Iniciar Consulta
         </button>
         <button
           @click="$emit('change-status', 'Completada')"
           v-if="appointment.status === 'En Consulta'"
           class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
         >
           Finalizar Consulta
         </button>
         <button
           @click="$emit('change-status', 'Cancelada')"
           v-if="['Programada', 'En Espera', 'En Consulta'].includes(appointment.status)"
           class="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
         >
           Cancelar Cita
         </button>

         <!-- Botones de edición y eliminación -->
         <button
           @click="$emit('edit-appointment')"
           v-if="['Programada'].includes(appointment.status)"
           class="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
         >
           Editar
         </button>
         <button
           @click="confirmDelete"
           v-if="['Programada', 'Cancelada', 'No Asistió'].includes(appointment.status)"
           class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
         >
           Eliminar
         </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  import TimerDisplay from './TimerDisplay.vue'; // <-- Importar TimerDisplay
  
  // Props
  const props = defineProps({
    appointment: {
      type: Object,
      required: true,
    },
  });
  
  // Emits
  const emit = defineEmits(['change-status', 'edit-appointment', 'delete-appointment']);
  
  // Función para confirmar eliminación
  const confirmDelete = () => {
    if (confirm(`¿Está seguro que desea eliminar la cita de ${props.appointment.patient?.name || 'este paciente'}?`)) {
      emit('delete-appointment', props.appointment.id);
    }
  };
  
  // Computed para formatear hora
  const formattedTime = computed(() => {
    if (!props.appointment.appointment_time) return 'N/A';
    try {
      const date = new Date(props.appointment.appointment_time);
      return date.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch (e) {
      console.error("Error formatting time:", e);
      return 'Hora inválida';
    }
  });
  
  // Computed para clases de estado
  const statusClass = computed(() => {
    // ... (código de clases igual que antes) ...
     switch (props.appointment.status) {
      case 'Programada': return 'bg-gray-100 text-gray-800';
      case 'En Espera': return 'bg-blue-100 text-blue-800';
      case 'En Consulta': return 'bg-yellow-100 text-yellow-800';
      case 'Completada': return 'bg-green-100 text-green-800';
      case 'Cancelada': return 'bg-red-100 text-red-800';
      case 'No Asistió': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  });
  
  // Computed para determinar qué timestamp pasar al TimerDisplay
  const timerStartTime = computed(() => {
      if (props.appointment.status === 'En Consulta') {
          return props.appointment.consultation_start_time;
      } else if (props.appointment.status === 'En Espera') {
          return props.appointment.arrival_time;
      }
      return null; // No hay timer activo en otros estados
  });
  
  // Helper para formatear duración MM:SS
  const formatDuration = (seconds) => {
      if (seconds === null || seconds === undefined || seconds < 0) return '--:--';
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
  
  </script>
  
  <style scoped>
  /* Estilos específicos si son necesarios */
  </style>