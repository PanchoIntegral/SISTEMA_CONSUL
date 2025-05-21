<template>
  <div class="p-2 sm:p-4 md:p-8">
    <h1 class="text-2xl font-semibold mb-4 sm:mb-6 text-gray-800">Consulta Activa</h1>
    
    <div v-if="loading" class="text-center py-10">
      <p class="text-gray-500">Cargando consulta...</p>
    </div>
    
    <div v-else-if="error" class="rounded-md bg-red-50 p-4 mb-6">
      <div class="flex">
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error al cargar la consulta</h3>
          <div class="mt-2 text-sm text-red-700">
            <p>{{ error }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else-if="activeConsultation">
      <ActiveConsultationCard 
        :consultation="activeConsultation"
        @complete-consultation="completeConsultation"
        @cancel-consultation="cancelConsultation"
      />
    </div>
    
    <div v-else class="text-center py-10">
      <p class="text-gray-500">No hay consulta activa actualmente.</p>
      <button
        @click="goToAppointments"
        class="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-light"
      >
        Ver citas
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ActiveConsultationCard from '@/components/ActiveConsultationCard.vue';
import { useAppointmentsStore } from '@/stores/appointments';

const router = useRouter();
const appointmentsStore = useAppointmentsStore();

const activeConsultation = ref(null);
const loading = ref(true);
const error = ref(null);

// Función para obtener la consulta activa
const fetchActiveConsultation = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // Obtener citas actuales (si no han sido cargadas aún)
    if (appointmentsStore.appointments.length === 0) {
      await appointmentsStore.fetchAppointments();
    }
    
    // Buscar la cita en consulta
    const consultation = appointmentsStore.appointments.find(
      appointment => appointment.status === 'En Consulta'
    );
    
    activeConsultation.value = consultation || null;
  } catch (err) {
    console.error('Error al obtener la consulta activa:', err);
    error.value = err.message || 'Error al cargar la consulta activa';
  } finally {
    loading.value = false;
  }
};

// Función para finalizar la consulta
const completeConsultation = async () => {
  if (!activeConsultation.value) return;
  
  try {
    await appointmentsStore.changeAppointmentStatus(
      activeConsultation.value.id,
      'Completada'
    );
    
    // Redirigir a la vista de citas
    router.push('/');
  } catch (err) {
    console.error('Error al finalizar la consulta:', err);
    error.value = err.message || 'Error al finalizar la consulta';
  }
};

// Función para cancelar la consulta
const cancelConsultation = async () => {
  if (!activeConsultation.value) return;
  
  try {
    await appointmentsStore.changeAppointmentStatus(
      activeConsultation.value.id,
      'Cancelada'
    );
    
    // Redirigir a la vista de citas
    router.push('/');
  } catch (err) {
    console.error('Error al cancelar la consulta:', err);
    error.value = err.message || 'Error al cancelar la consulta';
  }
};

// Función para ir a la vista de citas
const goToAppointments = () => {
  router.push('/');
};

// Cargar la consulta activa cuando se monta el componente
onMounted(fetchActiveConsultation);
</script> 