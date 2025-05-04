<template>
    <div class="p-4 md:p-8">
      <h1 class="text-2xl font-semibold mb-6 text-gray-800">Gestión de Pacientes</h1>
  
      <div class="mb-6 flex justify-between items-center">
        <div class="relative w-64">
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg class="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
          </div>
          <input 
            type="search" 
            v-model="searchQuery" 
            @input="handleSearch"
            class="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500" 
            placeholder="Buscar pacientes..." 
          />
        </div>
        <button
          @click="openPatientModal()" class="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
        >
          + Nuevo Paciente
        </button>
      </div>
  
      <div v-if="patientsStore.loading && !isPatientModalOpen" class="text-center py-10">
        <p class="text-gray-500">Cargando pacientes...</p>
      </div>
  
      <div v-else-if="patientsStore.currentError && !isPatientModalOpen" class="rounded-md bg-red-50 p-4 mb-6">
         <div class="flex"> <div class="ml-3"> <h3 class="text-sm font-medium text-red-800">Error al cargar pacientes</h3> <div class="mt-2 text-sm text-red-700"> <p>{{ patientsStore.currentError }}</p> </div> </div> </div>
       </div>
  
      <div v-else class="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <table v-if="patientsStore.patients.length > 0" class="min-w-full divide-y divide-gray-300">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Nombre</th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Contacto</th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Fecha Nacimiento</th>
              <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span class="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="patient in patientsStore.patients" :key="patient.id">
              <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{{ patient.name }}</td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ patient.contact_info || '-' }}</td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ formattedDate(patient.date_of_birth) || '-' }}</td>
              <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                <button @click="editPatient(patient)" class="text-indigo-600 hover:text-indigo-900 mr-3">
                  Editar<span class="sr-only">, {{ patient.name }}</span>
                </button>
                <button @click="confirmDeletePatient(patient)" class="text-red-600 hover:text-red-900">
                  Eliminar<span class="sr-only">, {{ patient.name }}</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="text-center py-10 bg-white sm:rounded-lg">
          <p class="text-gray-500">No hay pacientes registrados.</p>
        </div>
      </div>
  
       <BaseModal :show="isPatientModalOpen" @close="closePatientModal">
         <template #title>{{ isEditing ? 'Editar Paciente' : 'Registrar Nuevo Paciente' }}</template>
         <template #default>
           <PatientForm
              ref="patientFormRef"
              :key="editingPatient?.id || 'new'"
              :initial-data="editingPatient"
              @close="closePatientModal"
              @submitted="handlePatientSubmitted"
           />
         </template>
         <template #footer>
           <button type="button" @click="submitPatientForm" :disabled="patientFormRef?.isLoading" class="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto disabled:opacity-50">
             <span v-if="patientFormRef?.isLoading">Guardando...</span>
             <span v-else>{{ isEditing ? 'Actualizar Paciente' : 'Registrar Paciente' }}</span>
           </button>
           <button type="button" @click="closePatientModal" class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">Cancelar</button>
         </template>
       </BaseModal>
  
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted, watch } from 'vue';
  import { usePatientsStore } from '@/stores/patients';
  import BaseModal from '@/components/BaseModal.vue';
  import PatientForm from '@/components/PatientForm.vue';
  
  const patientsStore = usePatientsStore();
  
  const isPatientModalOpen = ref(false);
  const patientFormRef = ref(null);
  const isEditing = ref(false);
  const editingPatient = ref(null);
  const searchQuery = ref('');
  
  // Debounce para la búsqueda
  let searchTimeout = null;
  
  onMounted(() => {
    patientsStore.fetchPatients();
  });
  
  // Función para manejar la búsqueda con debounce
  const handleSearch = () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      patientsStore.fetchPatients(true, searchQuery.value);
    }, 300); // Esperar 300ms después de que el usuario deje de escribir
  };
  
  // Limpiar el timeout cuando el componente se desmonta
  onUnmounted(() => {
    clearTimeout(searchTimeout);
  });
  
  // Observar cambios en el término de búsqueda del store
  watch(() => patientsStore.currentSearchTerm, (newSearchTerm) => {
    // Sincronizar el término de búsqueda local con el del store
    if (searchQuery.value !== newSearchTerm) {
      searchQuery.value = newSearchTerm;
    }
  });
  
  const formattedDate = (dateString) => {
      if (!dateString) return null;
      try {
          const date = new Date(dateString + 'T00:00:00');
          return date.toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' });
      } catch (e) { return dateString; }
  };
  
  // Abre modal para crear
  const openPatientModal = () => {
      editingPatient.value = null; // Asegurar que no hay datos iniciales
      isEditing.value = false;
      isPatientModalOpen.value = true;
  };
  
  // Abre modal para editar
  const editPatient = (patient) => {
      editingPatient.value = { ...patient }; // Copiar datos para el formulario
      isEditing.value = true;
      isPatientModalOpen.value = true;
  };
  
  // Cierra modal y resetea estado de edición
  const closePatientModal = () => {
      isPatientModalOpen.value = false;
      // Pequeño delay para que no se vea el cambio de datos antes de cerrar
      setTimeout(() => {
          isEditing.value = false;
          editingPatient.value = null;
      }, 300); // Ajustar si es necesario
  };
  
  // Llama al método submit del formulario hijo
  const submitPatientForm = () => {
      patientFormRef.value?.handleSubmit();
  };
  
  // Manejar evento 'submitted' del formulario
  const handlePatientSubmitted = (newOrUpdatedPatient) => {
      console.log('Paciente guardado:', newOrUpdatedPatient);
      closePatientModal();
      // La lista se actualiza en el store, la UI debería reflejarlo
  };
  
  // Confirmar y eliminar paciente
  const confirmDeletePatient = (patient) => {
      if (confirm(`¿Estás seguro de que deseas eliminar a ${patient.name}? Esta acción no se puede deshacer.`)) {
          console.log('Eliminando paciente:', patient.id);
          patientsStore.deletePatient(patient.id); // Llamar a la acción del store
      }
  };
  
  </script>
  
  <style scoped>
  /* Estilos si son necesarios */
  </style>