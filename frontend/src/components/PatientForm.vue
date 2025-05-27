<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div class="grid grid-cols-1 gap-4">
      <!-- Nombre -->
      <div>
        <label for="patient_name" class="block text-sm font-medium text-navy dark:text-dark-primary">Nombre completo *</label>
        <div class="mt-1">
          <input
            type="text"
            id="patient_name"
            v-model="formData.name"
            required
            autocomplete="name"
            placeholder="Nombre y apellidos"
            :class="[
              'block w-full rounded-md border-gray-300 dark:border-dark-border shadow-sm focus:border-secondary focus:ring-secondary dark:focus:border-secondary-dark dark:focus:ring-secondary-dark sm:text-sm text-navy dark:text-dark-primary dark:bg-dark-surface',
              validationErrors.name ? 'border-red-500 dark:border-red-500' : ''
            ]"
          />
          <div v-if="validationErrors.name" class="mt-1 text-sm text-red-600 dark:text-red-400">
            {{ validationErrors.name }}
          </div>
        </div>
      </div>

      <!-- Información de contacto -->
      <div>
        <label for="patient_contact" class="block text-sm font-medium text-navy dark:text-dark-primary">Información de contacto</label>
        <div class="mt-1">
          <input
            type="text"
            id="patient_contact"
            v-model="formData.contact_info"
            placeholder="Teléfono o correo electrónico"
            :class="[
              'block w-full rounded-md border-gray-300 dark:border-dark-border shadow-sm focus:border-secondary focus:ring-secondary dark:focus:border-secondary-dark dark:focus:ring-secondary-dark sm:text-sm text-navy dark:text-dark-primary dark:bg-dark-surface',
              validationErrors.contact_info ? 'border-red-500 dark:border-red-500' : ''
            ]"
          />
          <div v-if="validationErrors.contact_info" class="mt-1 text-sm text-red-600 dark:text-red-400">
            {{ validationErrors.contact_info }}
          </div>
        </div>
      </div>

      <!-- Fecha de nacimiento -->
      <div>
        <label for="patient_dob" class="block text-sm font-medium text-navy dark:text-dark-primary">Fecha de nacimiento</label>
        <div class="mt-1">
          <input
            type="date"
            id="patient_dob"
            v-model="formData.date_of_birth"
            :class="[
              'block w-full rounded-md border-gray-300 dark:border-dark-border shadow-sm focus:border-secondary focus:ring-secondary dark:focus:border-secondary-dark dark:focus:ring-secondary-dark sm:text-sm text-navy dark:text-dark-primary dark:bg-dark-surface',
              validationErrors.date_of_birth ? 'border-red-500 dark:border-red-500' : ''
            ]"
          />
          <div v-if="validationErrors.date_of_birth" class="mt-1 text-sm text-red-600 dark:text-red-400">
            {{ validationErrors.date_of_birth }}
          </div>
        </div>
      </div>

      <!-- Error general -->
      <div v-if="errorMessage" class="rounded-md bg-red-50 dark:bg-dark-danger/30 p-4">
        <div class="flex">
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800 dark:text-dark-danger">Error al guardar</h3>
            <div class="mt-2 text-sm text-red-700 dark:text-dark-danger">
              <p>{{ errorMessage }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </form>

  <!-- Modal para error de duplicado -->
  <BaseModal :show="isDuplicateErrorModalOpen" @close="isDuplicateErrorModalOpen = false">
    <template #title>
      <div class="flex items-center">
        <svg class="h-6 w-6 text-red-600 dark:text-red-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        Paciente Duplicado
      </div>
    </template>
    <template #default>
      <p class="text-sm text-gray-700 dark:text-dark-text">
        {{ duplicateErrorModalMessage }}
      </p>
      <p class="text-sm text-gray-600 dark:text-dark-muted mt-2">
        No se pueden crear dos pacientes con los mismos datos exactos.
      </p>
    </template>
    <template #footer>
      <button
        type="button"
        @click="isDuplicateErrorModalOpen = false"
        class="inline-flex w-full justify-center rounded-md bg-primary dark:bg-secondary-dark px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-light dark:hover:bg-secondary sm:ml-3 sm:w-auto transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark dark:focus:ring-offset-dark-surface dark:focus:ring-secondary"
      >
        Entendido
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue';
import { usePatientsStore } from '@/stores/patients';
import { validatePatientData, findDuplicatePatient } from '@/utils/validation';
import BaseModal from '@/components/BaseModal.vue';

// Props
const props = defineProps({
  initialData: { // Prop opcional para los datos iniciales en modo edición
    type: Object,
    default: null,
  },
});

// Emits
const emit = defineEmits(['close', 'submitted']);

// Store
const patientsStore = usePatientsStore();

// Estado del formulario
const formData = reactive({
  id: null, // Guardar ID si estamos editando
  name: '',
  contact_info: '',
  date_of_birth: '',
});
const isLoading = ref(false);
const errorMessage = ref('');
const isEditing = ref(false); // Para saber si estamos editando
const validationErrors = ref({});
const isDuplicateErrorModalOpen = ref(false);
const duplicateErrorModalMessage = ref('');

// Watch for the duplicate error modal closing to refresh the patient list
watch(isDuplicateErrorModalOpen, (newValue, oldValue) => {
  if (oldValue === true && newValue === false) {
    // Duplicate error modal has been closed, refresh the patients list
    // to ensure the UI is up-to-date and any related errors are cleared.
    // patientsStore.fetchPatients();
    window.location.reload();
  }
});

// Observar cambios en initialData para llenar el formulario en modo edición
watch(() => props.initialData, (newData) => {
  if (newData) {
    isEditing.value = true;
    formData.id = newData.id;
    formData.name = newData.name || '';
    formData.contact_info = newData.contact_info || '';
    formData.date_of_birth = newData.date_of_birth || '';
  } else {
    // Resetear si no hay datos iniciales (modo creación)
    isEditing.value = false;
    formData.id = null;
    formData.name = '';
    formData.contact_info = '';
    formData.date_of_birth = '';
  }
  // Resetear errores y advertencias al cambiar de modo o datos iniciales
  errorMessage.value = '';
  validationErrors.value = {};
  isDuplicateErrorModalOpen.value = false;
  duplicateErrorModalMessage.value = '';
}, { immediate: true }); // Ejecutar al inicio también

// Computed para detectar posibles duplicados en tiempo real (SOLO PARA EDICIÓN)
// En modo creación, la validación de duplicados se hace en el submit via backend
const possibleDuplicateInEditMode = computed(() => {
  if (!isEditing.value || !formData.name.trim()) return null;
  // No verificar si los datos identificativos no han cambiado respecto a los iniciales
  if (props.initialData && 
      formData.name === props.initialData.name &&
      (formData.contact_info || null) === (props.initialData.contact_info || null) &&
      (formData.date_of_birth || null) === (props.initialData.date_of_birth || null)
  ) {
    return null; 
  }
  
  const currentData = {
    name: formData.name,
    contact_info: formData.contact_info || null,
    date_of_birth: formData.date_of_birth || null
  };
  
  return findDuplicatePatient(
    currentData, 
    patientsStore.patients, 
    formData.id // Excluir el ID actual que se está editando
  );
});

// Ya no se necesita el watcher para la advertencia de duplicado en tiempo real
// La advertencia de duplicado en el formulario (amarilla) ha sido eliminada.
// El error de duplicado exacto se maneja con un modal al intentar guardar.

// Manejar envío
const handleSubmit = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  validationErrors.value = {};
  isDuplicateErrorModalOpen.value = false; 
  duplicateErrorModalMessage.value = ''; 

  const dataToSend = {
    name: formData.name.trim(),
    contact_info: formData.contact_info ? formData.contact_info.trim() : null,
    date_of_birth: formData.date_of_birth || null,
  };

  const validation = validatePatientData(dataToSend);
  if (!validation.isValid) {
    validationErrors.value = validation.errors;
    isLoading.value = false;
    return;
  }

  // Si estamos editando, y hay un posible duplicado con datos DIFERENTES al original,
  // se podría considerar mostrar una advertencia aquí, pero la solicitud es no permitir la creación/actualización si son EXACTAMENTE iguales.
  // El backend ya maneja el error 409 para duplicados exactos en creación y actualización.

  let success = false;
  let resultData = null;

  try {
    if (isEditing.value && formData.id) {
      resultData = await patientsStore.updatePatient(formData.id, dataToSend);
      success = !!resultData; // updatePatient ahora devuelve el paciente o null/lanza error
    } else {
      resultData = await patientsStore.createPatient(dataToSend);
      success = !!resultData;
    }

    if (success) {
      emit('submitted', resultData);
      emit('close');
    } else {
      if (patientsStore.currentError && patientsStore.currentError.toLowerCase().includes('ya existe un paciente')) {
        duplicateErrorModalMessage.value = patientsStore.currentError;
        isDuplicateErrorModalOpen.value = true;
      } else {
        errorMessage.value = patientsStore.currentError || 'Error desconocido al guardar el paciente.';
      }
    }
  } catch (err) {
      // El store debería haber manejado el error y puesto un mensaje en patientsStore.currentError
      // Pero por si acaso, se captura aquí también.
      console.error("Error submitting patient form:", err);
      if (err.message && err.message.toLowerCase().includes('ya existe un paciente')) {
        duplicateErrorModalMessage.value = err.message;
        isDuplicateErrorModalOpen.value = true;
      } else {
        errorMessage.value = err.message || 'Ocurrió un error inesperado.';
      }
  } finally {
      isLoading.value = false;
  }
};

defineExpose({ handleSubmit, isLoading });
</script>