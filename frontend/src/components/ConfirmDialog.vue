<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-navy dark:bg-black bg-opacity-75 dark:bg-opacity-80 transition-opacity z-40"
    aria-hidden="true"
    @click="$emit('cancel')"
  ></div>

  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
  >
    <div class="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-dark-elevated text-left shadow-xl dark:shadow-dark-md transition-all sm:my-8 border-t-4 border-secondary dark:border-secondary-dark">
      <div class="bg-white dark:bg-dark-elevated px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
        <div class="sm:flex sm:items-start">
          <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 dark:bg-primary-dark/20 sm:mx-0 sm:h-10 sm:w-10">
            <svg class="h-6 w-6 text-primary dark:text-secondary" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
            <h3 class="text-base font-semibold leading-6 text-primary dark:text-dark-heading" id="modal-title">
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
          class="inline-flex w-full justify-center rounded-md bg-primary dark:bg-secondary-dark px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-light dark:hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-secondary-dark sm:ml-3 sm:w-auto"
        >
          {{ confirmText }}
        </button>
        <button
          @click="$emit('cancel')"
          type="button"
          class="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-dark-button px-3 py-2 text-sm font-semibold text-navy dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-dark-border hover:bg-gray-50 dark:hover:bg-dark-accent/30 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary-dark sm:mt-0 sm:w-auto"
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
  }
});

defineEmits(['confirm', 'cancel']);
</script> 