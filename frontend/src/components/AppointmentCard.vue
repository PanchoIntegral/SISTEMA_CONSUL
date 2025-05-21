<template>
    <div class="border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden bg-white group"
         :class="{'border-wave-green': appointment.status === 'Completada',
                 'border-red-400': appointment.status === 'Cancelada',
                 'border-wave-blue': appointment.status === 'En Espera',
                 'border-wave-teal': appointment.status === 'En Consulta',
                 'border-gray-300': appointment.status === 'Programada' || appointment.status === 'No Asistió'}">
      
      <!-- Encabezado de la tarjeta con horario y estado -->
      <div class="flex items-center justify-between px-4 py-3 border-b"
           :class="{'bg-wave-green bg-opacity-5': appointment.status === 'Completada',
                   'bg-red-100': appointment.status === 'Cancelada',
                   'bg-wave-blue bg-opacity-5': appointment.status === 'En Espera',
                   'bg-wave-teal bg-opacity-5': appointment.status === 'En Consulta',
                   'bg-gray-50': appointment.status === 'Programada' || appointment.status === 'No Asistió'}">
        <div class="flex items-center gap-2">
          <div class="flex flex-col">
            <span class="font-bold text-lg text-primary">{{ formattedTime }}</span>
            <span class="text-xs text-gray-500">{{ formattedDate }}</span>
          </div>
        </div>
        <span
          :class="statusClass"
          class="text-xs font-semibold px-3 py-1 rounded-full"
        >
          {{ appointment.status }}
        </span>
      </div>
      
      <!-- Etiqueta de proceso médico (sticky note) mejorada -->
      <div v-if="appointment.medical_process_tag" class="relative mt-1 mb-2">
        <div class="flex items-center">
          <div class="ml-4 px-3 py-1.5 text-xs font-semibold rounded-md shadow-sm bg-gradient-to-r from-amber-50 to-yellow-100 border-l-4 border-l-amber-400 flex items-center space-x-1.5" 
               style="max-width: 90%;">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span class="text-amber-800 font-medium">{{ appointment.medical_process_tag }}</span>
          </div>
        </div>
      </div>
      
      <!-- Selector de etiqueta de proceso médico (botón +) -->
      <div v-if="['En Espera', 'En Consulta'].includes(appointment.status)" class="px-4 pt-1 pb-0 relative">
        <div v-if="!showTagSelector" class="flex justify-start">
          <button 
            @click="toggleTagSelector"
            class="text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 p-1 rounded-full border border-amber-200 flex items-center justify-center w-6 h-6 transition-colors"
            title="Añadir etiqueta de proceso médico">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        
        <!-- Panel emergente para seleccionar etiqueta -->
        <div v-if="showTagSelector" class="absolute z-50 left-4 mt-1 bg-white rounded-md shadow-md border border-gray-200 p-2 min-w-[180px] max-h-[200px] overflow-y-auto tag-selector">
          <div class="flex justify-between items-center mb-2 pb-1 border-b sticky top-0 bg-white z-10">
            <span class="text-xs font-medium text-gray-700">Proceso médico</span>
            <button @click="toggleTagSelector" class="text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="space-y-1">
            <button 
              @click="selectTag('')"
              class="w-full text-left text-xs p-1.5 rounded hover:bg-gray-100 flex items-center"
              :class="{'bg-gray-100': selectedMedicalProcessTag === ''}">
              <span class="text-gray-700">Sin etiqueta</span>
            </button>
            <button 
              v-for="tag in medicalProcessTags" 
              :key="tag"
              @click="selectTag(tag)"
              class="w-full text-left text-xs p-1.5 rounded hover:bg-amber-50 flex items-center"
              :class="{'bg-amber-50': selectedMedicalProcessTag === tag}">
              <svg v-if="selectedMedicalProcessTag === tag" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-amber-600 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span v-else class="w-3 h-3 mr-1.5 flex-shrink-0"></span>
              <span class="text-amber-800">{{ tag }}</span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Cuerpo de la tarjeta con información del paciente y doctor -->
      <div class="p-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <!-- Información de paciente y doctor -->
          <div class="space-y-2">
            <div class="flex items-center">
              <div class="w-8 h-8 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <div class="flex items-center">
                  <p class="text-sm font-semibold text-navy">{{ appointment.patient?.name || 'N/A' }}</p>
                  <span v-if="appointment.is_recurring_patient" class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary bg-opacity-10 text-secondary" title="Paciente recurrente">
                    <svg class="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clip-rule="evenodd"></path>
                    </svg>
                    <span class="hidden sm:inline">Recurrente</span>
                  </span>
                </div>
              </div>
            </div>
            
            <div class="flex items-center">
              <div class="w-8 h-8 bg-wave-teal bg-opacity-10 rounded-full flex items-center justify-center mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-wave-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p class="text-sm text-gray-600">Dr. {{ appointment.doctor?.name || 'N/A' }}</p>
            </div>
            
            <div v-if="appointment.notes" class="flex mt-2">
              <div class="w-8 h-8 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div class="overflow-hidden">
                <p class="text-xs text-gray-500 line-clamp-2">{{ appointment.notes }}</p>
              </div>
            </div>
          </div>
          
          <!-- Tiempos y métricas -->
          <div class="space-y-2 border-t pt-3 md:pt-0 md:border-t-0 md:border-l md:pl-4 mt-2 md:mt-0">
            <div v-if="appointment.status === 'En Espera'" 
                class="bg-gray-50 rounded-md p-2 flex items-center justify-between">
              <span class="text-xs font-medium text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Timer:
              </span>
              <TimerDisplay :status="'En Espera'" :start-time="appointment.arrival_time" class="text-xs font-semibold text-navy font-sans" />
            </div>
            
            <div v-if="appointment.status === 'En Consulta'" class="space-y-2">
              <div class="bg-wave-blue bg-opacity-5 rounded-md p-2 flex items-center justify-between">
                <span class="text-xs font-medium text-wave-blue">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Espera:
                </span>
                <TimerDisplay 
                  :status="'En Espera'" 
                  :start-time="appointment.arrival_time" 
                  :end-time="appointment.consultation_start_time"
                  class="text-xs font-semibold text-navy font-sans" 
                />
              </div>
              <div class="bg-wave-teal bg-opacity-5 rounded-md p-2 flex items-center justify-between">
                <span class="text-xs font-medium text-wave-teal">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Consulta:
                </span>
                <TimerDisplay :status="'En Consulta'" :start-time="appointment.consultation_start_time" class="text-xs font-semibold text-navy font-sans" />
              </div>
            </div>

            <div v-if="appointment.status === 'Completada' && (appointment.calculated_wait_time_seconds !== null || appointment.calculated_consultation_time_seconds !== null)" 
                class="flex gap-2">
              <div class="flex-1 bg-wave-blue bg-opacity-5 rounded-md p-2 text-center">
                <span class="text-xs text-wave-blue font-medium block">Espera</span>
                <span class="text-sm font-semibold text-navy">{{ formatDuration(appointment.calculated_wait_time_seconds) }}</span>
              </div>
              <div class="flex-1 bg-wave-green bg-opacity-5 rounded-md p-2 text-center">
                <span class="text-xs text-wave-green font-medium block">Consulta</span>
                <span class="text-sm font-semibold text-navy">{{ formatDuration(appointment.calculated_consultation_time_seconds) }}</span>
              </div>
            </div>

            <div v-if="appointment.status === 'Programada'" class="bg-gray-50 rounded-md p-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-xs font-medium text-gray-500">Programada para hoy</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Botones de acción -->
      <div class="px-4 py-3 bg-gray-50 border-t flex flex-wrap gap-2 justify-end">
        <!-- Botones de estado -->
        <button
          @click="$emit('change-status', 'En Espera')"
          v-if="appointment.status === 'Programada'"
          class="text-xs bg-wave-blue bg-opacity-10 text-wave-blue px-3 py-1.5 rounded-md hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-wave-blue focus:ring-offset-1 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span class="hidden sm:inline">Marcar</span> Llegada
        </button>
        <button
          @click="$emit('change-status', 'No Asistió')"
          v-if="appointment.status === 'Programada'"
          class="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-md hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          No Asistió
        </button>
        <button
          @click="$emit('change-status', 'En Consulta')"
          v-if="appointment.status === 'En Espera'"
          class="text-xs bg-wave-teal bg-opacity-10 text-wave-teal px-3 py-1.5 rounded-md hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-wave-teal focus:ring-offset-1 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="hidden sm:inline">Iniciar</span> Consulta
        </button>
        <button
          @click="$emit('change-status', 'Completada')"
          v-if="appointment.status === 'En Consulta'"
          class="text-xs bg-wave-green bg-opacity-10 text-wave-green px-3 py-1.5 rounded-md hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-wave-green focus:ring-offset-1 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span class="hidden sm:inline">Finalizar</span> Consulta
        </button>
        <button
          @click="$emit('change-status', 'Cancelada')"
          v-if="['Programada', 'En Espera', 'En Consulta'].includes(appointment.status)"
          class="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Cancelar
        </button>

        <!-- Botones de edición y eliminación -->
        <button
          @click="$emit('edit-appointment')"
          v-if="['Programada'].includes(appointment.status)"
          class="text-xs bg-primary bg-opacity-10 text-primary px-3 py-1.5 rounded-md hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Editar
        </button>
        <button
          @click="confirmDelete"
          v-if="['Programada', 'Cancelada', 'No Asistió'].includes(appointment.status)"
          class="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Eliminar
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed, ref } from 'vue';
  import TimerDisplay from './TimerDisplay.vue';
  
  // Props
  const props = defineProps({
    appointment: {
      type: Object,
      required: true,
    },
  });
  
  // Emits
  const emit = defineEmits(['change-status', 'edit-appointment', 'delete-appointment', 'update-tag']);
  
  // Estado para la etiqueta seleccionada
  const selectedMedicalProcessTag = ref(props.appointment.medical_process_tag || '');
  
  // Estado para controlar la visibilidad del selector
  const showTagSelector = ref(false);
  
  // Lista de etiquetas de procesos médicos disponibles
  const medicalProcessTags = [
    'Dilatación',
    'Inyección',
    'Láser',
    'OCT',
    'OCT/Campimetría',
    'Campimetría'
  ];
  
  // Función para alternar la visibilidad del selector
  const toggleTagSelector = () => {
    showTagSelector.value = !showTagSelector.value;
  };
  
  // Función para seleccionar una etiqueta
  const selectTag = (tag) => {
    selectedMedicalProcessTag.value = tag;
    emit('update-tag', tag);
    showTagSelector.value = false;
  };
  
  // Función para actualizar la etiqueta de proceso médico
  const updateMedicalProcessTag = () => {
    emit('update-tag', selectedMedicalProcessTag.value);
  };
  
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

  // Computed para formatear fecha
  const formattedDate = computed(() => {
    if (!props.appointment.appointment_time) return '';
    try {
      const date = new Date(props.appointment.appointment_time);
      return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
    } catch (e) {
      console.error("Error formatting date:", e);
      return '';
    }
  });
  
  // Computed para clases de estado
  const statusClass = computed(() => {
     switch (props.appointment.status) {
      case 'Programada': return 'bg-gray-100 text-navy';
      case 'En Espera': return 'bg-wave-blue bg-opacity-10 text-wave-blue';
      case 'En Consulta': return 'bg-wave-teal bg-opacity-10 text-wave-teal';
      case 'Completada': return 'bg-wave-green bg-opacity-10 text-wave-green';
      case 'Cancelada': return 'bg-red-100 text-red-800';
      case 'No Asistió': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
  /* Clase para limitar el número de líneas de texto */
  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Tamaño de texto extra pequeño para el selector compacto */
  .text-2xs {
    font-size: 0.65rem; /* Más pequeño que text-xs */
    line-height: 1rem;
  }

  /* Estilos para el selector de etiquetas */
  .tag-selector {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  </style>