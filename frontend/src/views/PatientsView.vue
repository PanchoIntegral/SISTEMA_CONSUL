<template>
    <div class="p-2 sm:p-4 md:p-8">
      <h1 class="text-2xl font-semibold mb-4 sm:mb-6 text-gray-800 dark:text-dark-heading">Gestión de Pacientes</h1>
  
      <div class="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between gap-3 sm:items-center">
        <div class="relative w-full sm:w-64">
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
          </div>
          <input 
            type="search" 
            v-model="searchQuery" 
            @input="handleSearch"
            class="block w-full p-2 pl-10 text-sm text-navy dark:text-white border border-gray-300 dark:border-dark-border rounded-lg bg-gray-50 dark:bg-dark-surface focus:ring-secondary focus:border-secondary dark:focus:ring-secondary-dark dark:focus:border-secondary-dark" 
            placeholder="Buscar pacientes..." 
          />
        </div>
        <button
          @click="openPatientModal()" class="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors w-full sm:w-auto dark:bg-secondary-dark dark:hover:bg-secondary"
        >
          + Nuevo Paciente
        </button>
      </div>
  
      <div v-if="patientsStore.loading && !isPatientModalOpen" class="text-center py-10">
        <p class="text-gray-500 dark:text-dark-muted">Cargando pacientes...</p>
      </div>
  
      <div v-else-if="patientsStore.currentError && !isPatientModalOpen" class="rounded-md bg-red-50 dark:bg-dark-danger/30 p-4 mb-4 sm:mb-6">
         <div class="flex"> <div class="ml-3"> <h3 class="text-sm font-medium text-red-800 dark:text-dark-danger">Error al cargar pacientes</h3> <div class="mt-2 text-sm text-red-700 dark:text-dark-danger"> <p>{{ patientsStore.currentError }}</p> </div> </div> </div>
       </div>
  
      <div v-else class="overflow-x-auto shadow dark:shadow-dark-sm ring-1 ring-black ring-opacity-5 dark:ring-dark-border sm:rounded-lg">
        <!-- Tabla para pantallas medianas y grandes -->
        <table v-if="patientsStore.patients.length > 0" class="min-w-full divide-y divide-gray-300 dark:divide-dark-border hidden sm:table">
          <thead class="bg-gray-50 dark:bg-dark-surface">
            <tr>
              <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-navy dark:text-dark-primary sm:pl-6">Nombre</th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-navy dark:text-dark-primary">Contacto</th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-navy dark:text-dark-primary">Fecha Nacimiento</th>
              <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span class="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-dark-border bg-white dark:bg-dark-card">
            <tr v-for="patient in patientsStore.patients" :key="patient.id" class="transition-colors hover:bg-gray-50 dark:hover:bg-dark-elevated">
              <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-navy dark:text-dark-primary sm:pl-6">{{ patient.name }}</td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-700 dark:text-dark-secondary">{{ patient.contact_info || '-' }}</td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-700 dark:text-dark-secondary">{{ formattedDate(patient.date_of_birth) || '-' }}</td>
              <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                <button @click="editPatient(patient)" class="text-secondary hover:text-secondary-light dark:text-secondary-dark dark:hover:text-secondary mr-3 transition-colors">
                  Editar<span class="sr-only">, {{ patient.name }}</span>
                </button>
                <button @click="confirmDeletePatient(patient)" class="text-red-600 hover:text-red-900 dark:text-dark-danger dark:hover:text-red-400 transition-colors">
                  Eliminar<span class="sr-only">, {{ patient.name }}</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Vista de tarjetas para móviles -->
        <div class="sm:hidden">
          <div v-if="patientsStore.patients.length > 0" class="divide-y divide-gray-200 dark:divide-dark-border">
            <div v-for="patient in patientsStore.patients" :key="patient.id" class="bg-white dark:bg-dark-card p-4 transition-colors">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="text-sm font-medium text-navy dark:text-dark-primary">{{ patient.name }}</h3>
                  <p class="text-xs text-gray-700 dark:text-dark-secondary mt-1" v-if="patient.contact_info">
                    <span class="font-medium">Contacto:</span> {{ patient.contact_info }}
                  </p>
                  <p class="text-xs text-gray-700 dark:text-dark-secondary mt-1" v-if="patient.date_of_birth">
                    <span class="font-medium">Nacimiento:</span> {{ formattedDate(patient.date_of_birth) }}
                  </p>
                </div>
                <div class="flex space-x-2">
                  <button @click="editPatient(patient)" class="p-1.5 rounded-full bg-secondary bg-opacity-10 text-secondary dark:bg-secondary-dark/20 dark:text-secondary-light">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button @click="confirmDeletePatient(patient)" class="p-1.5 rounded-full bg-red-100 text-red-600 dark:bg-dark-danger/20 dark:text-dark-danger">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="patientsStore.patients.length === 0" class="text-center py-10 bg-white dark:bg-dark-card sm:rounded-lg">
          <p class="text-gray-500 dark:text-dark-muted">No hay pacientes registrados.</p>
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
           <div class="flex flex-col sm:flex-row-reverse w-full gap-2 sm:gap-0">
             <button 
               type="button" 
               @click="submitPatientForm" 
               :disabled="patientFormRef?.isLoading" 
               class="inline-flex justify-center rounded-md bg-primary dark:bg-secondary-dark px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-light dark:hover:bg-secondary sm:ml-3 disabled:opacity-50 transition-colors"
             >
               <span v-if="patientFormRef?.isLoading">Guardando...</span>
               <span v-else>{{ isEditing ? 'Actualizar Paciente' : 'Registrar Paciente' }}</span>
             </button>
             <button 
               type="button" 
               @click="closePatientModal" 
               class="inline-flex justify-center rounded-md bg-white dark:bg-dark-elevated px-3 py-2 text-sm font-semibold text-navy dark:text-dark-primary shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-dark-border hover:bg-gray-50 dark:hover:bg-dark-accent/30 transition-colors"
             >
               Cancelar
             </button>
           </div>
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