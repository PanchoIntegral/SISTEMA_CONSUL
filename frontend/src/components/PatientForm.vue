<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div>
      <label for="patient-name" class="block text-sm font-medium text-gray-700">Nombre Completo</label>
      <input
        type="text"
        id="patient-name"
        v-model="formData.name"
        required
        placeholder="Nombre Apellido"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
      />
    </div>

    <div>
      <label for="contact-info" class="block text-sm font-medium text-gray-700">Información de Contacto</label>
      <input
        type="text"
        id="contact-info"
        v-model="formData.contact_info"
        placeholder="Email o Teléfono"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
      />
    </div>

    <div>
      <label for="date-of-birth" class="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
      <input
        type="date"
        id="date-of-birth"
        v-model="formData.date_of_birth"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
      />
    </div>

     <div v-if="errorMessage" class="text-sm text-red-600" role="alert">
       {{ errorMessage }}
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