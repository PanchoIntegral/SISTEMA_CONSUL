<template>
  <div class="bg-white dark:bg-dark-background min-h-screen py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <div class="md:flex md:items-center md:justify-between mb-6">
        <div class="flex-1 min-w-0">
          <h1 class="text-2xl font-bold leading-7 text-navy dark:text-dark-primary sm:text-3xl">
            Días bloqueados
          </h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-dark-secondary">
            Gestiona los días en los que no aceptarás citas
          </p>
        </div>
      </div>

      <!-- Selector de doctor -->
      <div class="bg-white dark:bg-dark-surface shadow overflow-hidden sm:rounded-lg p-4 mb-6">
        <div class="flex flex-col sm:flex-row sm:items-center gap-4">
          <div class="w-full sm:w-1/3">
            <label for="doctor-select" class="block text-sm font-medium text-gray-700 dark:text-dark-secondary mb-1">
              Selecciona un doctor
            </label>
            <select
              id="doctor-select"
              v-model="selectedDoctorId"
              @change="handleDoctorChange"
              class="block w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-navy focus:border-navy dark:bg-dark-surface dark:text-dark-primary"
            >
              <option value="" disabled>Selecciona un doctor</option>
              <option v-for="doctor in doctorsStore.doctors" :key="doctor.id" :value="doctor.id">
                {{ doctor.name }}
              </option>
            </select>
          </div>
          
          <!-- Estado de carga -->
          <div v-if="doctorsStore.loadingBlockedDays" class="flex items-center text-gray-500 dark:text-gray-300">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-navy dark:border-dark-accent mr-2"></div>
            <span>Cargando días bloqueados...</span>
          </div>
          
          <!-- Estado de error -->
          <div v-if="doctorsStore.errorBlockedDays" class="text-red-600 dark:text-red-400">
            Error: {{ doctorsStore.errorBlockedDays }}
          </div>
        </div>
      </div>

      <!-- Calendario y formulario -->
      <div v-if="selectedDoctorId" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Calendario -->
        <div class="lg:col-span-2 bg-white dark:bg-dark-surface shadow overflow-hidden sm:rounded-lg p-4">
          <h2 class="text-lg font-medium text-navy dark:text-dark-primary mb-4 flex items-center justify-between">
            <span>Calendario</span>
            <span class="text-sm text-gray-500" v-if="blockedDaysCountText">
              {{ blockedDaysCountText }}
            </span>
          </h2>
          
          <div v-if="doctorsStore.loadingBlockedDays" class="flex justify-center items-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-navy dark:border-dark-accent"></div>
          </div>
          
          <div v-else-if="doctorsStore.errorBlockedDays" class="rounded-md bg-red-50 dark:bg-dark-danger/30 p-4">
            <div class="flex">
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800 dark:text-dark-danger">Error al cargar días bloqueados</h3>
                <div class="mt-2 text-sm text-red-700 dark:text-dark-danger">
                  <p>{{ doctorsStore.errorBlockedDays }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else>
            <!-- Navegación del calendario -->
            <div class="flex items-center justify-between mb-4">
              <button 
                @click="previousMonth" 
                class="p-1 text-gray-400 hover:text-navy dark:hover:text-dark-accent"
              >
                <span class="sr-only">Mes anterior</span>
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 class="text-lg font-medium text-navy dark:text-dark-primary">
                {{ currentMonthName }} {{ currentYear }}
              </h3>
              <button 
                @click="nextMonth" 
                class="p-1 text-gray-400 hover:text-navy dark:hover:text-dark-accent"
              >
                <span class="sr-only">Mes siguiente</span>
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <!-- Días de la semana -->
            <div class="grid grid-cols-7 gap-px">
              <div v-for="day in daysOfWeek" :key="day" class="text-center py-2 text-sm font-medium text-gray-700 dark:text-dark-secondary">
                {{ day }}
              </div>
            </div>
            
            <!-- Días del mes con key única para forzar re-render -->
            <div class="grid grid-cols-7 gap-px mt-1" :key="`calendar-${selectedDoctorId}-${refreshKey}`">
              <div 
                v-for="(day, index) in calendarDays" 
                :key="`${selectedDoctorId}-${day.date}-${index}`"
                :class="getDayClasses(day)"
                @click="day.isCurrentMonth && day.date >= today ? selectDate(day.date) : null"
              >
                <div class="py-2 px-1">
                  <span 
                    v-if="day.isCurrentMonth"
                    :class="{'font-bold': isSelectedDate(day.date), 'text-navy dark:text-dark-accent': isSelectedDate(day.date)}"
                  >
                    {{ day.dayNumber }}
                  </span>
                  <span v-else class="text-gray-400 dark:text-dark-border">
                    {{ day.dayNumber }}
                  </span>
                  
                  <!-- Indicador de día bloqueado - Mejorado visualmente -->
                  <div 
                    v-if="isBlockedDay(day.date)" 
                    class="mt-1 w-full h-3 bg-red-500 dark:bg-red-700 rounded-full flex items-center justify-center"
                    :title="getBlockedDayReason(day.date)"
                  >
                    <span class="text-xs text-white font-bold">✕</span>
                  </div>
                </div>
                <!-- Overlay para día bloqueado -->
                <div 
                  v-if="isBlockedDay(day.date)" 
                  class="absolute inset-0 border-2 border-red-500 dark:border-red-700 rounded-sm opacity-60 pointer-events-none"
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Formulario para bloquear días -->
        <div class="bg-white dark:bg-dark-surface shadow overflow-hidden sm:rounded-lg p-4">
          <h2 class="text-lg font-medium text-navy dark:text-dark-primary mb-4">Bloquear día</h2>
          
          <form @submit.prevent="handleBlockDay">
            <div class="mb-4">
              <label for="selected-date" class="block text-sm font-medium text-gray-700 dark:text-dark-secondary mb-1">
                Fecha seleccionada
              </label>
              <input 
                type="date" 
                id="selected-date"
                v-model="selectedDate"
                :min="today"
                required
                class="block w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-navy focus:border-navy dark:bg-dark-surface dark:text-dark-primary"
              />
            </div>
            
            <div class="mb-4">
              <label for="block-reason" class="block text-sm font-medium text-gray-700 dark:text-dark-secondary mb-1">
                Motivo
              </label>
              <input 
                type="text" 
                id="block-reason"
                v-model="blockReason"
                placeholder="Ej: Vacaciones, Capacitación, etc."
                class="block w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-navy focus:border-navy dark:bg-dark-surface dark:text-dark-primary"
              />
            </div>
            
            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="doctorsStore.loadingBlockedDays || !selectedDate || !selectedDoctorId"
                class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-navy hover:bg-navy-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy dark:bg-dark-accent dark:hover:bg-dark-accent-hover disabled:opacity-50"
              >
                <span v-if="doctorsStore.loadingBlockedDays">Guardando...</span>
                <span v-else>Bloquear día</span>
              </button>
            </div>
          </form>
          
          <!-- Lista de días bloqueados -->
          <div class="mt-6">
            <h3 class="text-md font-medium text-navy dark:text-dark-primary mb-2">
              Días bloqueados
            </h3>
            
            <div v-if="doctorsStore.blockedDays.length === 0" class="text-sm text-gray-500 dark:text-dark-secondary">
              No hay días bloqueados
            </div>
            
            <ul v-else class="divide-y divide-gray-200 dark:divide-dark-border">
              <li 
                v-for="day in sortedBlockedDays" 
                :key="`blocked-${day.id}`" 
                class="py-3"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-navy dark:text-dark-primary">
                      {{ formatDate(day.blocked_date) }}
                    </p>
                    <p class="text-sm text-gray-500 dark:text-dark-secondary">
                      {{ day.reason }}
                    </p>
                  </div>
                  <button 
                    @click="handleDeleteBlockedDay(day.id)"
                    class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    :disabled="doctorsStore.loadingBlockedDays"
                  >
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div v-else class="bg-white dark:bg-dark-surface shadow overflow-hidden sm:rounded-lg p-6 text-center">
        <p class="text-gray-500 dark:text-dark-secondary">
          Selecciona un doctor para gestionar sus días bloqueados
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useDoctorsStore } from '@/stores/doctors';
import { useToastStore } from '@/stores/toast';

// Stores
const doctorsStore = useDoctorsStore();
const toastStore = useToastStore();

// Estado local
const selectedDoctorId = ref('');
const selectedDate = ref('');
const blockReason = ref('No disponible');
const currentMonth = ref(new Date().getMonth());
const currentYear = ref(new Date().getFullYear());
const refreshKey = ref(0); // Clave para forzar re-renderizado del calendario

// Contador de días bloqueados
const blockedDaysCountText = computed(() => {
  if (!doctorsStore.blockedDays || doctorsStore.blockedDays.length === 0) return '';
  return `${doctorsStore.blockedDays.length} días bloqueados`;
});

// Obtener la fecha actual en formato YYYY-MM-DD
const today = new Date().toISOString().split('T')[0];

// Cargar doctores al montar el componente y asegurar datos frescos
onMounted(async () => {
  try {
    // Forzar refresh para obtener datos actualizados
    await doctorsStore.fetchDoctors(true);
    // Restaurar doctor seleccionado si estaba en sesión
    const storedDoctorId = sessionStorage.getItem('selectedDoctorId');
    if (storedDoctorId && Array.isArray(doctorsStore.doctors) && doctorsStore.doctors.length > 0) {
      // Comprobar si el ID existe en la lista de doctores
      if (doctorsStore.doctors.some(doc => doc.id === parseInt(storedDoctorId))) {
        selectedDoctorId.value = storedDoctorId;
        // Cargar días bloqueados inmediatamente
        await loadBlockedDays(storedDoctorId);
      }
    }
  } catch (err) {
    console.error('Error al cargar doctores:', err);
    toastStore.showToast('Error al cargar los doctores', 'error');
  }
});

// Cargar días bloqueados y asegurar actualización
const loadBlockedDays = async (doctorId) => {
  if (!doctorId) return;
  
  try {
    console.log(`Cargando días bloqueados para doctor ID: ${doctorId}`);
    // Limpiar los días bloqueados actuales
    doctorsStore.clearBlockedDays();
    
    // Cargar nuevos días bloqueados
    await doctorsStore.getBlockedDays(doctorId);
    
    // Incrementar clave de refresco para forzar reconstrucción del calendario
    refreshKey.value++;
    
    console.log(`Días bloqueados cargados: ${doctorsStore.blockedDays.length}`);
    if (doctorsStore.blockedDays.length > 0) {
      doctorsStore.blockedDays.forEach(day => {
        console.log(`Día bloqueado: ${day.blocked_date}`);
      });
    }
  } catch (err) {
    console.error('Error al cargar días bloqueados:', err);
    toastStore.showToast('Error al cargar días bloqueados', 'error');
  }
};

// Vigilar cambios en el doctor seleccionado
watch(selectedDoctorId, async (newValue, oldValue) => {
  if (newValue && newValue !== oldValue) {
    // Resetear la fecha seleccionada al cambiar de doctor
    selectedDate.value = '';
    
    // Guardar selección en sessionStorage
    sessionStorage.setItem('selectedDoctorId', newValue);
    
    // Cargar días bloqueados del nuevo doctor
    await loadBlockedDays(newValue);
    
    // Mostrar mensaje de éxito
    const doctorName = getDoctorName(newValue);
    toastStore.showToast(`Días bloqueados cargados para ${doctorName}`, 'info');
  }
});

// Helpers para el calendario
const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const currentMonthName = computed(() => {
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return monthNames[currentMonth.value];
});

const calendarDays = computed(() => {
  const days = [];
  const firstDay = new Date(currentYear.value, currentMonth.value, 1);
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0);
  
  // Añadir días del mes anterior
  const firstDayOfWeek = firstDay.getDay();
  const prevMonthLastDay = new Date(currentYear.value, currentMonth.value, 0).getDate();
  
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const prevMonthDay = prevMonthLastDay - i;
    const date = new Date(currentYear.value, currentMonth.value - 1, prevMonthDay);
    days.push({
      date: date.toISOString().split('T')[0],
      dayNumber: prevMonthDay,
      isCurrentMonth: false
    });
  }
  
  // Añadir días del mes actual
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(currentYear.value, currentMonth.value, i);
    days.push({
      date: date.toISOString().split('T')[0],
      dayNumber: i,
      isCurrentMonth: true
    });
  }
  
  // Añadir días del mes siguiente
  const nextMonthDays = 42 - days.length; // 6 semanas * 7 días
  for (let i = 1; i <= nextMonthDays; i++) {
    const date = new Date(currentYear.value, currentMonth.value + 1, i);
    days.push({
      date: date.toISOString().split('T')[0],
      dayNumber: i,
      isCurrentMonth: false
    });
  }
  
  return days;
});

// Obtener días bloqueados ordenados por fecha
const sortedBlockedDays = computed(() => {
  if (!doctorsStore.blockedDays || !Array.isArray(doctorsStore.blockedDays)) return [];
  
  return [...doctorsStore.blockedDays].sort((a, b) => {
    return new Date(a.blocked_date) - new Date(b.blocked_date);
  });
});

// Crear computed reactivos para los días bloqueados
const currentBlockedDays = computed(() => {
  if (!doctorsStore.blockedDays || !Array.isArray(doctorsStore.blockedDays)) return [];
  
  return doctorsStore.blockedDays.map(day => ({
    ...day, 
    date: day.blocked_date ? day.blocked_date.split('T')[0] : null
  }));
});

// Funciones
const handleDoctorChange = async () => {
  if (selectedDoctorId.value) {
    await loadBlockedDays(selectedDoctorId.value);
  }
};

// Obtener nombre del doctor por ID
const getDoctorName = (doctorId) => {
  if (!doctorId || !doctorsStore.doctors) return '';
  const doctor = doctorsStore.doctors.find(d => d.id === parseInt(doctorId));
  return doctor ? doctor.name : '';
};

const previousMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
};

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
};

const selectDate = (date) => {
  selectedDate.value = date;
};

const isSelectedDate = (date) => {
  return selectedDate.value === date;
};

// Verificar si un día está bloqueado
const isBlockedDay = (date) => {
  if (!date || !doctorsStore.blockedDays || !Array.isArray(doctorsStore.blockedDays)) return false;
  
  // Normalizar formato de fecha para comparación
  const normalizedDate = typeof date === 'string' ? date : date.toISOString().split('T')[0];
  
  const isBlocked = doctorsStore.blockedDays.some(day => {
    const blockedDate = day.blocked_date ? day.blocked_date.split('T')[0] : null;
    return blockedDate === normalizedDate;
  });
  
  return isBlocked;
};

const getBlockedDayReason = (date) => {
  if (!doctorsStore.blockedDays || !Array.isArray(doctorsStore.blockedDays)) return '';
  
  // Normalizar formato de fecha para comparación
  const normalizedDate = typeof date === 'string' ? date : date.toISOString().split('T')[0];
  
  const day = doctorsStore.blockedDays.find(day => {
    const blockedDate = day.blocked_date ? day.blocked_date.split('T')[0] : null;
    return blockedDate === normalizedDate;
  });
  
  return day ? day.reason : '';
};

// Clases CSS para los días del calendario
const getDayClasses = (day) => {
  const baseClasses = 'text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-border/20 relative';
  const todayClasses = day.date === today ? 'bg-blue-50 dark:bg-blue-900/20' : '';
  const blockedClasses = isBlockedDay(day.date) ? 'bg-red-50 dark:bg-red-900/30 calendar-day-blocked' : '';
  const selectedClasses = isSelectedDate(day.date) ? 'ring-2 ring-navy dark:ring-dark-accent' : '';
  const disabledClasses = (!day.isCurrentMonth || day.date < today) ? 'opacity-50 cursor-not-allowed' : '';
  
  return `${baseClasses} ${todayClasses} ${blockedClasses} ${selectedClasses} ${disabledClasses}`;
};

const handleBlockDay = async () => {
  if (!selectedDate.value || !selectedDoctorId.value) return;
  
  try {
    const newDay = await doctorsStore.addBlockedDay(selectedDoctorId.value, selectedDate.value, blockReason.value || 'No disponible');
    
    // Limpiar el formulario
    blockReason.value = 'No disponible';
    
    // Mostrar notificación de éxito
    toastStore.showToast('Día bloqueado correctamente', 'success');
    
    // Incrementar clave de refresco para forzar reconstrucción del calendario
    refreshKey.value++;
    
    // Recargar días bloqueados para asegurar datos frescos
    await loadBlockedDays(selectedDoctorId.value);
  } catch (error) {
    console.error('Error al bloquear día:', error);
    toastStore.showToast('Error al bloquear el día', 'error');
  }
};

const handleDeleteBlockedDay = async (id) => {
  try {
    await doctorsStore.deleteBlockedDay(id);
    
    // Mostrar notificación
    toastStore.showToast('Día desbloqueado correctamente', 'success');
    
    // Incrementar clave de refresco para forzar reconstrucción del calendario
    refreshKey.value++;
  } catch (error) {
    console.error('Error al eliminar día bloqueado:', error);
    toastStore.showToast('Error al desbloquear el día', 'error');
  }
};

const formatDate = (dateString) => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
};
</script>

<style scoped>
.calendar-day-blocked {
  position: relative;
  overflow: visible;
  box-shadow: 0 0 0 1px theme('colors.red.500') inset;
}

.dark .calendar-day-blocked {
  box-shadow: 0 0 0 1px theme('colors.red.700') inset;
}

@keyframes pulse-red {
  0% { box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.7) inset; }
  50% { box-shadow: 0 0 0 2px rgba(239, 68, 68, 1) inset; }
  100% { box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.7) inset; }
}

.calendar-day-blocked {
  animation: pulse-red 2s infinite;
}
</style> 