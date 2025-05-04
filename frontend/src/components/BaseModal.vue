<template>
    <div
      v-if="show"
      class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-40"
      aria-hidden="true"
      @click="close"
    ></div>
  
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
        <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
              <h3 class="text-base font-semibold leading-6 text-gray-900" id="modal-title">
                <slot name="title">Título del Modal</slot>
              </h3>
              <div class="mt-2">
                <slot>Contenido del modal aquí...</slot>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
          <slot name="footer">
            <button
              type="button"
              @click="close"
              class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
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