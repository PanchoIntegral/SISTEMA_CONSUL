<template>
    <div
      v-if="show"
      class="fixed inset-0 bg-navy dark:bg-black bg-opacity-75 dark:bg-opacity-80 transition-opacity z-40"
      aria-hidden="true"
      @click="close"
    ></div>
  
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    >
      <div class="relative w-full max-h-[90vh] transform overflow-hidden rounded-lg bg-white dark:bg-dark-elevated text-left shadow-xl dark:shadow-dark-md transition-all sm:my-8 sm:max-w-lg border-t-4 border-secondary dark:border-secondary-dark">
        <div class="absolute top-0 right-0 pt-4 pr-4 block sm:hidden">
          <button
            type="button"
            @click="close"
            class="rounded-md bg-white dark:bg-dark-elevated text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-secondary-dark"
          >
            <span class="sr-only">Cerrar</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="bg-white dark:bg-dark-elevated px-4 pb-4 pt-5 sm:p-6 sm:pb-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
              <h3 class="text-base font-semibold leading-6 text-primary dark:text-dark-heading mb-2" id="modal-title">
                <slot name="title">Título del Modal</slot>
              </h3>
              <div class="mt-2">
                <slot>Contenido del modal aquí...</slot>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 dark:bg-dark-surface px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
          <slot name="footer">
            <button
              type="button"
              @click="close"
              class="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-dark-button px-3 py-2 text-sm font-semibold text-navy dark:text-white shadow-sm dark:shadow-dark-sm ring-1 ring-inset ring-gray-300 dark:ring-dark-border hover:bg-gray-50 dark:hover:bg-dark-accent/30 sm:mt-0 sm:w-auto transition-colors"
            >
              Cerrar
            </button>
          </slot>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  const props = defineProps({
    show: {
      type: Boolean,
      required: true,
    },
  });
  
  const emit = defineEmits(['close']);
  
  const close = () => {
    emit('close');
  };
  </script>
  
  <style scoped>
  /* Estilos para scrollbar personalizado */
  .overflow-y-auto::-webkit-scrollbar {
    width: 8px;
  }
  
  .overflow-y-auto::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  .dark .overflow-y-auto::-webkit-scrollbar-track {
    background: #2E2E48;
    border-radius: 4px;
  }
  
  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: #c5c5c5;
    border-radius: 4px;
  }
  
  .dark .overflow-y-auto::-webkit-scrollbar-thumb {
    background: #4A4A6A;
    border-radius: 4px;
  }
  
  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #a0a0a0;
  }
  
  .dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #5A5A7A;
  }
  </style>