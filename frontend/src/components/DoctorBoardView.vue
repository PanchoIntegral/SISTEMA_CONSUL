  <template>
    <!-- Modal para seleccionar proceso médico desde la vista por doctor -->
    <BaseModal :show="showTagModal" @close="showTagModal = false">
      <template #title>Seleccionar Proceso Médico</template>
      <div class="space-y-2">
        <p class="text-sm text-gray-600 mb-4">Seleccione el proceso que se está realizando para la cita de <strong class="text-navy">{{ selectedApptForTag?.patient?.name || 'este paciente' }}</strong>.</p>
        <button
          @click="selectTag('')"
          class="w-full text-left text-sm p-2.5 rounded-lg hover:bg-gray-100 flex items-center"
          :class="{'bg-gray-100 font-semibold': selectedMedicalProcessTag === ''}">
          <span class="text-gray-700">Sin etiqueta</span>
        </button>
        <button
          v-for="tag in medicalProcessTags"
          :key="tag"
          @click="selectTag(tag)"
          class="w-full text-left text-sm p-2.5 rounded-lg hover:bg-amber-50 flex items-center"
          :class="{'bg-amber-100 font-semibold': selectedMedicalProcessTag === tag}">
          <span class="text-amber-800">{{ tag }}</span>
        </button>
      </div>
      <template #footer>
        <button type="button" @click="showTagModal = false" class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-navy shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto transition-colors">Cancelar</button>
      </template>
    </BaseModal>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <template v-if="visibleDoctors.length === 0">
      <div class="text-center py-10">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p class="mt-2 text-sm text-gray-500">No hay doctores disponibles para mostrar.</p>
      </div>
    </template>
    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="doctor in visibleDoctors" :key="doctor.id" class="flex flex-col">
          <!-- Encabezado del doctor -->
          <div class="bg-gradient-to-r from-primary to-primary-light rounded-t-lg px-4 py-3 shadow-sm">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h3 class="text-sm font-bold text-white">{{ doctor.name }}</h3>
            </div>
            <div class="mt-1 flex items-center gap-2 text-xs text-white text-opacity-90">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{{ getAppointmentsByDoctor(doctor.id).length }} cita(s)</span>
            </div>
          </div>
          
          <!-- Lista de citas compactas -->
          <div class="bg-gray-50 rounded-b-lg border border-t-0 border-gray-200 p-3 min-h-[200px] flex-1">
            <template v-if="getAppointmentsByDoctor(doctor.id).length > 0">
              <div class="space-y-2">
                <div 
                  v-for="appt in getAppointmentsByDoctor(doctor.id)" 
                  :key="appt.id" 
                  class="bg-white rounded-md border border-gray-200 p-3 hover:shadow-md transition-all duration-200 cursor-pointer"
                  @click="$emit('edit-appointment', appt)"
                >
                  <!-- Hora y Estado en una línea -->
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span class="text-sm font-semibold text-gray-900">{{ formatTime(appt.appointment_time) }}</span>
                    </div>
                    <span 
                      class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                      :class="getStatusClasses(appt.status)"
                    >
                      {{ getStatusShortName(appt.status) }}
                    </span>
                  </div>

                  <!-- Nombre del paciente -->
                  <div class="flex items-center gap-2 mb-2">
                    <svg class="w-4 h-4 text-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p class="text-sm font-medium text-gray-900 truncate">{{ appt.patient?.name || 'Sin paciente' }}</p>
                  </div>

                  <!-- Timer solo si es relevante -->
                  <div v-if="shouldShowTimer(appt.status)" class="flex items-center gap-2 text-xs">
                    <svg class="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="text-gray-600">{{ getTimerLabel(appt.status) }}: {{ formatTimer(appt) }}</span>
                  </div>

                  <!-- Botones de acción rápida -->
                  <div class="flex gap-1 mt-2 pt-2 border-t border-gray-100">
                    <button
                      v-if="canChangeToWaiting(appt.status)"
                      @click.stop="$emit('change-status', appt.id, 'En Espera')"
                      class="flex-1 text-xs px-2 py-1 rounded bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition-colors"
                    >
                      En Espera
                    </button>
                    <button
                      v-if="canStartConsultation(appt.status)"
                      @click.stop="$emit('change-status', appt.id, 'En Consulta')"
                      class="flex-1 text-xs px-2 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                    >
                      Iniciar
                    </button>
                    <button
                      v-if="canMarkNoShow(appt.status)"
                      @click.stop="$emit('change-status', appt.id, 'No Asistió')"
                      class="flex-1 text-xs px-2 py-1 rounded bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
                    >
                      No Asistió
                    </button>
                    <button
                      v-if="canComplete(appt.status)"
                      @click.stop="$emit('change-status', appt.id, 'Completada')"
                      class="flex-1 text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                    >
                      Finalizar
                    </button>
                    <button
                      @click.stop="$emit('delete-appointment', appt.id)"
                      class="text-xs px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                      title="Eliminar"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <!-- Botón Añadir Proceso (visible en En Espera y En Consulta) -->
                  <div class="mt-2">
                    <button
                      v-if="['En Espera','En Consulta'].includes(appt.status)"
                      @click.stop="openTagModal(appt)"
                      class="w-full text-xs flex items-center justify-center gap-2 px-2 py-1 rounded border border-dashed border-amber-300 text-amber-700 hover:bg-amber-50 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                      <span v-if="!appt.medical_process_tag">+ Añadir Proceso</span>
                      <span v-else class="bg-amber-100 px-2 py-0.5 rounded font-medium text-amber-800">{{ appt.medical_process_tag }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="flex flex-col items-center justify-center h-full text-center py-6">
                <svg class="w-10 h-10 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p class="text-xs text-gray-500 italic">Sin citas con los filtros actuales</p>
              </div>
            </template>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import BaseModal from '@/components/BaseModal.vue';

const props = defineProps({
  doctors: Array,
  appointments: Array,
  selectedDate: String
});

// Emitir eventos al padre para que los maneje
const emit = defineEmits(['change-status', 'edit-appointment', 'delete-appointment', 'update-tag']);

// Estado para el modal de selección de proceso médico
const showTagModal = ref(false);
const selectedApptForTag = ref(null);
const selectedMedicalProcessTag = ref('');
const medicalProcessTags = [
  'Dilatación',
  'Inyección',
  'Láser',
  'OCT',
  'OCT/Campimetría',
  'Campimetría'
];

function openTagModal(appt) {
  selectedApptForTag.value = appt;
  selectedMedicalProcessTag.value = appt.medical_process_tag || '';
  showTagModal.value = true;
}

function selectTag(tag) {
  if (!selectedApptForTag.value) return;
  // Emitir id y tag para que el padre lo guarde
  emit('update-tag', selectedApptForTag.value.id, tag);
  showTagModal.value = false;
}

const visibleDoctors = computed(() => Array.isArray(props.doctors) ? props.doctors : []);

function getAppointmentsByDoctor(doctorId) {
  if (!Array.isArray(props.appointments)) return [];
  return props.appointments.filter(appt => {
    if (!appt) return false;
    const docId = appt.doctor?.id ?? appt.doctor_id;
    return String(docId) === String(doctorId);
  });
}

function formatTime(datetime) {
  if (!datetime) return '';
  const date = new Date(datetime);
  return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

function getStatusClasses(status) {
  const statusMap = {
    'Programada': 'bg-blue-100 text-blue-800 ring-1 ring-inset ring-blue-600/20',
    'En Espera': 'bg-yellow-100 text-yellow-800 ring-1 ring-inset ring-yellow-600/20',
    'En Consulta': 'bg-green-100 text-green-800 ring-1 ring-inset ring-green-600/20',
    'Completada': 'bg-emerald-100 text-emerald-800 ring-1 ring-inset ring-emerald-600/20',
    'Cancelada': 'bg-red-100 text-red-800 ring-1 ring-inset ring-red-600/20',
    'No Asistió': 'bg-gray-100 text-gray-800 ring-1 ring-inset ring-gray-600/20'
  };
  return statusMap[status] || 'bg-gray-100 text-gray-800 ring-1 ring-inset ring-gray-600/20';
}

function getStatusShortName(status) {
  const shortNames = {
    'Programada': 'Programada',
    'En Espera': 'Esperando',
    'En Consulta': 'En Consulta',
    'Completada': 'Completada',
    'Cancelada': 'Cancelada',
    'No Asistió': 'No Asistió'
  };
  return shortNames[status] || status;
}

// Determinar si mostrar timer según el estado
function shouldShowTimer(status) {
  return ['En Espera', 'En Consulta'].includes(status);
}

function getTimerLabel(status) {
  if (status === 'En Espera') return 'Espera';
  if (status === 'En Consulta') return 'Consulta';
  return '';
}

function formatTimer(appointment) {
  const now = new Date();
  let startTime;
  
  if (appointment.status === 'En Consulta' && appointment.consultation_start_time) {
    startTime = new Date(appointment.consultation_start_time);
  } else if (appointment.status === 'En Espera' && appointment.waiting_start_time) {
    startTime = new Date(appointment.waiting_start_time);
  } else {
    return '00:00';
  }
  
  const diff = Math.floor((now - startTime) / 1000);
  const minutes = Math.floor(diff / 60);
  const seconds = diff % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Lógica de botones según el estado
function canChangeToWaiting(status) {
  return status === 'Programada';
}

function canStartConsultation(status) {
  return ['Programada', 'En Espera'].includes(status);
}

function canComplete(status) {
  return status === 'En Consulta';
}

function canMarkNoShow(status) {
  return status === 'Programada';
}

</script>
