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
            class="block w-full rounded-md border-gray-300 dark:border-dark-border shadow-sm focus:border-secondary focus:ring-secondary dark:focus:border-secondary-dark dark:focus:ring-secondary-dark sm:text-sm text-navy dark:text-dark-primary dark:bg-dark-surface"
          />
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
            class="block w-full rounded-md border-gray-300 dark:border-dark-border shadow-sm focus:border-secondary focus:ring-secondary dark:focus:border-secondary-dark dark:focus:ring-secondary-dark sm:text-sm text-navy dark:text-dark-primary dark:bg-dark-surface"
          />
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
            class="block w-full rounded-md border-gray-300 dark:border-dark-border shadow-sm focus:border-secondary focus:ring-secondary dark:focus:border-secondary-dark dark:focus:ring-secondary-dark sm:text-sm text-navy dark:text-dark-primary dark:bg-dark-surface"
          />
        </div>
      </div>

      <!-- Género -->
      <div>
        <label for="patient_gender" class="block text-sm font-medium text-navy dark:text-dark-primary">Género</label>
        <div class="mt-1">
          <select
            id="patient_gender"
            v-model="formData.gender"
            class="block w-full rounded-md border-gray-300 dark:border-dark-border shadow-sm focus:border-secondary focus:ring-secondary dark:focus:border-secondary-dark dark:focus:ring-secondary-dark sm:text-sm text-navy dark:text-dark-primary dark:bg-dark-surface"
          >
            <option value="">No especificado</option>
            <option value="male">Masculino</option>
            <option value="female">Femenino</option>
            <option value="other">Otro</option>
          </select>
        </div>
      </div>

      <!-- Información médica -->
      <div>
        <label for="patient_medical_info" class="block text-sm font-medium text-navy dark:text-dark-primary">Información médica (opcional)</label>
        <div class="mt-1">
          <textarea
            id="patient_medical_info"
            v-model="formData.medical_info"
            rows="3"
            placeholder="Alergias, condiciones médicas, medicamentos, etc."
            class="block w-full rounded-md border-gray-300 dark:border-dark-border shadow-sm focus:border-secondary focus:ring-secondary dark:focus:border-secondary-dark dark:focus:ring-secondary-dark sm:text-sm text-navy dark:text-dark-primary dark:bg-dark-surface"
          ></textarea>
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
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'; // Importar watch y onMounted
import { usePatientsStore } from '@/stores/patients';

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
}, { immediate: true }); // Ejecutar al inicio también


// Manejar envío
const handleSubmit = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  // Preparar datos (filtrar null/vacíos si es necesario)
  const dataToSend = {
    name: formData.name,
    contact_info: formData.contact_info || null,
    date_of_birth: formData.date_of_birth || null,
  };

  let success = false;
  let resultData = null;

  try {
    if (isEditing.value && formData.id) {
      // Llamar a la acción de actualizar
      success = await patientsStore.updatePatient(formData.id, dataToSend);
      resultData = success ? { ...dataToSend, id: formData.id } : null; // Devolver datos actualizados
    } else {
      // Llamar a la acción de crear
      resultData = await patientsStore.createPatient(dataToSend);
      success = !!resultData;
    }

    if (success) {
      emit('submitted', resultData); // Pasar datos guardados
      emit('close'); // Cerrar el modal
    } else {
      // Mostrar error del store
      errorMessage.value = patientsStore.currentError || 'Error desconocido al guardar el paciente.';
    }
  } catch (err) {
      // Capturar errores inesperados (poco probable si el store los maneja)
      console.error("Error submitting patient form:", err);
      errorMessage.value = 'Ocurrió un error inesperado.';
  } finally {
      isLoading.value = false;
  }
};

// Exponer método para que el modal lo llame
defineExpose({ handleSubmit, isLoading });
</script>