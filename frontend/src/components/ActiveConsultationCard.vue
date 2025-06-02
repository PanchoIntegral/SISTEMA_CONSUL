<template>
  <div class="border rounded-lg shadow-sm overflow-hidden bg-white" data-status="En Consulta">
    <div class="flex items-center justify-between px-4 py-3 border-b bg-wave-teal bg-opacity-5">
      <div class="flex items-center gap-2">
        <div class="flex flex-col">
          <span class="font-bold text-lg text-primary">{{ formattedTime }}</span>
          <span class="text-xs text-gray-500">{{ formattedDate }}</span>
        </div>
      </div>
      <span class="text-xs font-semibold px-3 py-1 rounded-full bg-wave-teal bg-opacity-10 text-wave-teal">
        En Consulta
      </span>
    </div>
    
    <div class="p-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="space-y-2">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <div class="flex items-center">
                <p class="text-sm font-semibold text-navy">{{ consultation.patient?.name || 'N/A' }}</p>
              </div>
            </div>
          </div>
          
          <div class="flex items-center">
            <div class="w-8 h-8 bg-wave-teal bg-opacity-10 rounded-full flex items-center justify-center mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-wave-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p class="text-sm text-gray-600">{{ formattedDoctorName }}</p>
          </div>
          
          <div v-if="consultation.notes" class="flex mt-2">
            <div class="w-8 h-8 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div class="overflow-hidden">
              <p class="text-xs text-gray-500 line-clamp-2">{{ consultation.notes }}</p>
            </div>
          </div>
        </div>
        
        <!-- Timers Section -->
        <div class="space-y-2 border-t pt-3 md:pt-0 md:border-t-0 md:border-l md:pl-4 mt-2 md:mt-0">
          <div class="bg-wave-blue bg-opacity-5 rounded-md p-2 flex items-center justify-between">
            <span class="text-xs font-medium text-wave-blue">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Espera:
            </span>
            <TimerDisplay 
              :status="'En Espera'" 
              :start-time="consultation.arrival_time" 
              :end-time="consultation.consultation_start_time" 
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
            <TimerDisplay 
              :status="'En Consulta'" 
              :start-time="consultation.consultation_start_time" 
              class="text-xs font-semibold text-navy font-sans" 
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Botones de acción -->
    <div class="px-4 py-3 bg-gray-50 border-t flex flex-wrap gap-2 justify-end">
      <button
        @click="$emit('complete-consultation')"
        class="text-xs bg-wave-green bg-opacity-10 text-wave-green px-3 py-1.5 rounded-md hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-wave-green focus:ring-offset-1 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span class="hidden sm:inline">Finalizar</span> Consulta
      </button>
      <button
        @click="$emit('cancel-consultation')"
        class="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        Cancelar
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import TimerDisplay from './TimerDisplay.vue';

// Props
const props = defineProps({
  consultation: {
    type: Object,
    required: true,
  },
});

// Emits
const emit = defineEmits(['complete-consultation', 'cancel-consultation']);

// Computed para formatear el nombre del doctor
const formattedDoctorName = computed(() => {
  const doctorName = props.consultation.doctor?.name;
  if (!doctorName || doctorName === 'N/A') return 'N/A';
  
  // Verificar si el nombre ya incluye un título (Dr., Dra., Doctor, Doctora)
  const hasTitle = /^(Dr\.?|Dra\.?|Doctor|Doctora)/i.test(doctorName);
  
  return hasTitle ? doctorName : `Dr. ${doctorName}`;
});

// Computed para formatear hora
const formattedTime = computed(() => {
  if (!props.consultation.appointment_time) return 'N/A';
  try {
    // Convertir UTC a Tijuana manualmente
    const utcDate = new Date(props.consultation.appointment_time);
    const year = utcDate.getUTCFullYear();
    const month = utcDate.getUTCMonth() + 1;
    const day = utcDate.getUTCDate();
    const utcHours = utcDate.getUTCHours();
    const utcMinutes = utcDate.getUTCMinutes();
    
    // Calcular offset de Tijuana (horario de verano/estándar)
    const tijuanaOffset = getTijuanaOffsetForDisplay(year, month, day);
    
    // Convertir UTC a hora de Tijuana
    const tijuanaHours = utcHours + tijuanaOffset;
    
    // Manejar cambios de día si es necesario
    const finalHours = tijuanaHours >= 24 ? tijuanaHours - 24 : 
                      tijuanaHours < 0 ? tijuanaHours + 24 : tijuanaHours;
    
    // Formatear en formato 12 horas
    const hour12 = finalHours === 0 ? 12 : finalHours > 12 ? finalHours - 12 : finalHours;
    const ampm = finalHours >= 12 ? 'p.m.' : 'a.m.';
    const minutesStr = utcMinutes.toString().padStart(2, '0');
    
    return `${hour12}:${minutesStr} ${ampm}`;
  } catch (e) {
    console.error("Error formatting time:", e);
    return 'Hora inválida';
  }
});

// Computed para formatear fecha
const formattedDate = computed(() => {
  if (!props.consultation.appointment_time) return '';
  try {
    const utcDate = new Date(props.consultation.appointment_time);
    const year = utcDate.getUTCFullYear();
    const month = utcDate.getUTCMonth() + 1;
    const day = utcDate.getUTCDate();
    const utcHours = utcDate.getUTCHours();
    
    // Calcular offset de Tijuana
    const tijuanaOffset = getTijuanaOffsetForDisplay(year, month, day);
    
    // Verificar si el cambio de hora causa cambio de día
    const tijuanaHours = utcHours + tijuanaOffset;
    let finalDay = day;
    let finalMonth = month;
    let finalYear = year;
    
    if (tijuanaHours >= 24) {
      // Día siguiente
      const nextDay = new Date(Date.UTC(year, month - 1, day + 1));
      finalYear = nextDay.getUTCFullYear();
      finalMonth = nextDay.getUTCMonth() + 1;
      finalDay = nextDay.getUTCDate();
    } else if (tijuanaHours < 0) {
      // Día anterior
      const prevDay = new Date(Date.UTC(year, month - 1, day - 1));
      finalYear = prevDay.getUTCFullYear();
      finalMonth = prevDay.getUTCMonth() + 1;
      finalDay = prevDay.getUTCDate();
    }
    
    const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 
                       'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    
    return `${finalDay} ${monthNames[finalMonth - 1]}`;
  } catch (e) {
    console.error("Error formatting date:", e);
    return '';
  }
});

// Función helper para calcular el offset de Tijuana (versión corregida)
const getTijuanaOffsetForDisplay = (year, month, day) => {
  // Tijuana sigue las reglas de horario de verano del Pacífico (PST/PDT)
  // Horario de verano: segundo domingo de marzo al primer domingo de noviembre
  
  // Calcular segundo domingo de marzo
  const march1 = new Date(year, 2, 1); // Marzo 1 (mes 2 porque es 0-based)
  const march1DayOfWeek = march1.getDay(); // 0=domingo, 1=lunes, etc.
  // Días hasta el primer domingo de marzo
  const daysToFirstSunday = march1DayOfWeek === 0 ? 0 : 7 - march1DayOfWeek;
  const firstSundayMarch = 1 + daysToFirstSunday;
  const secondSundayMarch = firstSundayMarch + 7;
  
  // Calcular primer domingo de noviembre
  const november1 = new Date(year, 10, 1); // Noviembre 1 (mes 10 porque es 0-based)
  const november1DayOfWeek = november1.getDay();
  // Días hasta el primer domingo de noviembre
  const daysToFirstSundayNov = november1DayOfWeek === 0 ? 0 : 7 - november1DayOfWeek;
  const firstSundayNovember = 1 + daysToFirstSundayNov;
  
  const currentDate = new Date(year, month - 1, day);
  const dstStart = new Date(year, 2, secondSundayMarch, 2, 0, 0); // 2:00 AM del segundo domingo de marzo
  const dstEnd = new Date(year, 10, firstSundayNovember, 2, 0, 0); // 2:00 AM del primer domingo de noviembre
  
  // Si estamos en horario de verano (entre segundo domingo de marzo y primer domingo de noviembre)
  if (currentDate >= dstStart && currentDate < dstEnd) {
    return -7; // UTC-7 (PDT)
  } else {
    return -8; // UTC-8 (PST)
  }
};
</script>

<style scoped>
/* Add any component-specific styles here */
</style> 