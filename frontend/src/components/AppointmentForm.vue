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
              <option v-for="patient in (patientsStore.patients || [])" :key="patient.id" :value="patient.id">
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
              @change="handleDoctorChange"
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

        <!-- Calendario de días bloqueados (solo se muestra si hay un doctor seleccionado) -->
        <div v-if="formData.doctor_id && doctorsStore.blockedDays.length > 0" class="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h3 class="text-sm font-medium text-navy mb-3">Días bloqueados para el doctor seleccionado</h3>
          
          <!-- Mini calendario -->
          <div class="bg-white rounded-lg p-3 border">
            <div class="flex items-center justify-between mb-3">
              <button 
                type="button"
                @click="previousMonth" 
                class="p-1 hover:bg-gray-100 rounded"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h4 class="text-sm font-medium">{{ currentMonthName }} {{ currentYear }}</h4>
              <button 
                type="button"
                @click="nextMonth" 
                class="p-1 hover:bg-gray-100 rounded"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <!-- Días de la semana -->
            <div class="grid grid-cols-7 gap-1 mb-2">
              <div v-for="day in daysOfWeek" :key="day" class="text-xs text-center text-gray-500 py-1">
                {{ day }}
              </div>
            </div>
            
            <!-- Días del calendario -->
            <div class="grid grid-cols-7 gap-1">
              <div 
                v-for="(day, index) in calendarDays" 
                :key="`calendar-${index}`"
                :class="getDayClasses(day)"
                class="text-xs text-center py-1 relative"
              >
                <span 
                  v-if="day.isCurrentMonth"
                  :class="{'text-gray-900': !isBlockedDay(day.date), 'text-red-600 font-bold': isBlockedDay(day.date)}"
                >
                  {{ day.dayNumber }}
                </span>
                <span v-else class="text-gray-300">
                  {{ day.dayNumber }}
                </span>
                
                <!-- Indicador visual para días bloqueados -->
                <div 
                  v-if="isBlockedDay(day.date)" 
                  class="absolute inset-0 bg-red-100 border border-red-300 rounded"
                  :title="getBlockedDayReason(day.date)"
                >
                </div>
                
                <!-- Marcador de día bloqueado -->
                <div 
                  v-if="isBlockedDay(day.date)" 
                  class="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"
                  :title="getBlockedDayReason(day.date)"
                ></div>
              </div>
            </div>
          </div>
          
          <!-- Lista de días bloqueados -->
          <div class="mt-3">
            <h4 class="text-xs font-medium text-gray-700 mb-2">Días bloqueados:</h4>
            <div class="max-h-20 overflow-y-auto">
              <div v-for="day in sortedBlockedDays" :key="day.id" class="text-xs text-gray-600 flex justify-between items-center py-1">
                <span>{{ formatBlockedDate(day.blocked_date) }}</span>
                <span class="text-red-600">{{ day.reason }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Mensaje informativo si no hay días bloqueados -->
        <div v-else-if="formData.doctor_id && !doctorsStore.loadingBlockedDays && doctorsStore.blockedDays.length === 0" class="border border-green-200 rounded-lg p-3 bg-green-50">
          <p class="text-sm text-green-700">✓ El doctor seleccionado no tiene días bloqueados</p>
        </div>

        <!-- Indicador de carga para días bloqueados -->
        <div v-else-if="formData.doctor_id && doctorsStore.loadingBlockedDays" class="border border-gray-200 rounded-lg p-3 bg-gray-50">
          <div class="flex items-center justify-center">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-navy mr-2"></div>
            <span class="text-sm text-gray-600">Cargando días bloqueados...</span>
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
              <!-- Advertencia si la fecha seleccionada está bloqueada -->
              <div v-if="isSelectedDateBlocked" class="text-red-600 text-xs mt-1 font-medium">
                ⚠️ Advertencia: Esta fecha está bloqueada para el doctor seleccionado ({{ getBlockedDateReason }})
              </div>
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
import { ref, reactive, onMounted, computed, watch } from 'vue';
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

// Estado para el calendario
const currentMonth = ref(new Date().getMonth());
const currentYear = ref(new Date().getFullYear());

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

// Días bloqueados ordenados
const sortedBlockedDays = computed(() => {
  if (!doctorsStore.blockedDays || !Array.isArray(doctorsStore.blockedDays)) return [];
  
  return [...doctorsStore.blockedDays].sort((a, b) => {
    return new Date(a.blocked_date) - new Date(b.blocked_date);
  });
});

// Verificar si la fecha seleccionada está bloqueada
const isSelectedDateBlocked = computed(() => {
  if (!formData.appointment_date || !formData.doctor_id) return false;
  return isBlockedDay(formData.appointment_date);
});

// Obtener la razón del bloqueo de la fecha seleccionada
const getBlockedDateReason = computed(() => {
  if (!isSelectedDateBlocked.value) return '';
  return getBlockedDayReason(formData.appointment_date);
});

// Funciones del calendario
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

const getDayClasses = (day) => {
  const baseClasses = 'relative';
  const blockedClasses = isBlockedDay(day.date) ? 'bg-red-50' : '';
  return `${baseClasses} ${blockedClasses}`;
};

// Verificar si un día está bloqueado
const isBlockedDay = (date) => {
  if (!date || !doctorsStore.blockedDays || !Array.isArray(doctorsStore.blockedDays)) return false;
  
  const normalizedDate = typeof date === 'string' ? date : date.toISOString().split('T')[0];
  
  return doctorsStore.blockedDays.some(day => {
    const blockedDate = day.blocked_date ? day.blocked_date.split('T')[0] : null;
    return blockedDate === normalizedDate;
  });
};

const getBlockedDayReason = (date) => {
  if (!doctorsStore.blockedDays || !Array.isArray(doctorsStore.blockedDays)) return '';
  
  const normalizedDate = typeof date === 'string' ? date : date.toISOString().split('T')[0];
  
  const day = doctorsStore.blockedDays.find(day => {
    const blockedDate = day.blocked_date ? day.blocked_date.split('T')[0] : null;
    return blockedDate === normalizedDate;
  });
  
  return day ? day.reason : '';
};

const formatBlockedDate = (dateString) => {
  if (!dateString) return '';
  
  const dateParts = dateString.split('T')[0].split('-');
  if (dateParts.length !== 3) return dateString;
  
  const year = parseInt(dateParts[0]);
  const month = parseInt(dateParts[1]) - 1;
  const day = parseInt(dateParts[2]);
  
  const date = new Date(Date.UTC(year, month, day));
  
  const options = { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' };
  return new Intl.DateTimeFormat('es-ES', options).format(date);
};

// Manejar cambio de doctor
const handleDoctorChange = async () => {
  if (formData.doctor_id) {
    try {
      await doctorsStore.getBlockedDays(formData.doctor_id);
    } catch (error) {
      console.error('Error al cargar días bloqueados:', error);
    }
  } else {
    // Limpiar días bloqueados si no hay doctor seleccionado
    doctorsStore.clearBlockedDays();
  }
};

// Cargar pacientes y doctores al montar
onMounted(() => {
  patientsStore.fetchAllPatients(); // Usar fetchAllPatients para obtener todos los pacientes sin paginación
  doctorsStore.fetchDoctors();
});

// Manejar envío
const handleSubmit = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  showDoctorUnavailableAlert.value = false;

  // Convertir fecha/hora usando la utilidad de zona horaria de Tijuana
  let appointmentTimeISO = '';
  try {
    if (!formData.appointment_date || !formData.appointment_time) throw new Error("Fecha y hora requeridas");
    
    // Importar la utilidad de zona horaria
    const { createTijuanaDateTimeAsUTC } = await import('@/utils/timezoneUtils.js');
    
    // Convertir la fecha/hora seleccionada a UTC considerando zona horaria de Tijuana
    appointmentTimeISO = createTijuanaDateTimeAsUTC(formData.appointment_date, formData.appointment_time);
    
    console.log('Fecha seleccionada:', formData.appointment_date, formData.appointment_time);
    console.log('Fecha convertida a UTC (desde Tijuana):', appointmentTimeISO);
    
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