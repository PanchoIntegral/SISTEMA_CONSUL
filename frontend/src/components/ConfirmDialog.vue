<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-navy dark:bg-black bg-opacity-75 dark:bg-opacity-80 backdrop-blur-xs transition-opacity z-40 animate-fade-in"
    aria-hidden="true"
    @click="$emit('cancel')"
  ></div>

  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
  >
    <div 
      class="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-dark-elevated text-left shadow-xl dark:shadow-dark-md transition-all sm:my-8 border-t-4 border-secondary dark:border-secondary-dark animate-modal-entry"
      @click.stop
    >
      <div class="bg-white dark:bg-dark-elevated px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
        <div class="sm:flex sm:items-start">
          <div 
            class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10"
            :class="{
              'bg-primary/10 dark:bg-primary-dark/20': type === 'confirm',
              'bg-red-100 dark:bg-red-900/20': type === 'delete',
              'bg-amber-100 dark:bg-amber-900/20': type === 'warning',
              'bg-green-100 dark:bg-green-900/20': type === 'success'
            }"
          >
            <svg v-if="type === 'confirm'" class="h-6 w-6 text-primary dark:text-secondary" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <svg v-else-if="type === 'delete'" class="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            <svg v-else-if="type === 'warning'" class="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <svg v-else-if="type === 'success'" class="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
            <h3 class="text-lg font-semibold leading-6 text-primary dark:text-dark-heading" id="modal-title">
              {{ title }}
            </h3>
            <div class="mt-2">
              <p class="text-sm text-navy dark:text-dark-secondary">
                {{ message }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-gray-50 dark:bg-dark-surface px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
        <button
          @click="$emit('confirm')"
          type="button"
          :class="[
            'inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 sm:ml-3 sm:w-auto transition-colors',
            type === 'delete' ? 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 focus:ring-red-500 dark:focus:ring-red-400' : 
            type === 'warning' ? 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800 focus:ring-amber-500 dark:focus:ring-amber-400' :
            type === 'success' ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 focus:ring-green-500 dark:focus:ring-green-400' :
            'bg-primary dark:bg-secondary-dark hover:bg-primary-light dark:hover:bg-secondary focus:ring-primary-light dark:focus:ring-secondary-dark'
          ]"
        >
          {{ confirmText }}
        </button>
        <button
          @click="$emit('cancel')"
          type="button"
          class="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-dark-button px-3 py-2 text-sm font-semibold text-navy dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-dark-border hover:bg-gray-50 dark:hover:bg-dark-accent/30 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary-dark sm:mt-0 sm:w-auto transition-colors"
        >
          {{ cancelText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: 'Confirmar acción'
  },
  message: {
    type: String,
    default: '¿Estás seguro de que deseas realizar esta acción?'
  },
  confirmText: {
    type: String,
    default: 'Aceptar'
  },
  cancelText: {
    type: String,
    default: 'Cancelar'
  },
  type: {
    type: String,
    default: 'confirm',
    validator: (value) => ['confirm', 'delete', 'warning', 'success'].includes(value)
  }
});

defineEmits(['confirm', 'cancel']);
</script>

<style scoped>
/* Animación de entrada para el diálogo */
@keyframes dialogEntry {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-dialog-entry {
  animation: dialogEntry 0.2s ease-out forwards;
}
</style> 