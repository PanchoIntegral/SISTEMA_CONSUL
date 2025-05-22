<template>
  <transition name="toast">
    <div 
      v-if="show"
      class="fixed z-50 flex items-center max-w-md p-4 rounded-lg shadow-md dark:shadow-dark-md border-l-4"
      :class="[
        positionClasses,
        type === 'success' ? 'bg-green-50 dark:bg-dark-card border-green-500 dark:border-green-600' : 
        type === 'error' ? 'bg-red-50 dark:bg-dark-card border-red-500 dark:border-red-600' : 
        type === 'warning' ? 'bg-amber-50 dark:bg-dark-card border-amber-500 dark:border-amber-600' : 
        'bg-blue-50 dark:bg-dark-card border-secondary dark:border-secondary-dark'
      ]"
    >
      <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg"
        :class="[
          type === 'success' ? 'text-green-500 dark:text-green-400 bg-green-100 dark:bg-green-900/20' : 
          type === 'error' ? 'text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/20' : 
          type === 'warning' ? 'text-amber-500 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/20' : 
          'text-primary dark:text-secondary bg-primary/10 dark:bg-primary-dark/20'
        ]"
      >
        <svg v-if="type === 'success'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
        </svg>
        <svg v-else-if="type === 'error'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
        </svg>
        <svg v-else-if="type === 'warning'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
        </svg>
        <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
        </svg>
      </div>
      <div class="ml-3 text-sm font-normal">
        <div class="font-medium" :class="[
          type === 'success' ? 'text-green-700 dark:text-green-400' : 
          type === 'error' ? 'text-red-700 dark:text-red-400' : 
          type === 'warning' ? 'text-amber-700 dark:text-amber-400' : 
          'text-primary dark:text-dark-heading'
        ]">
          {{ title }}
        </div>
        <div class="mt-1" :class="[
          type === 'success' ? 'text-green-600 dark:text-green-300' : 
          type === 'error' ? 'text-red-600 dark:text-red-300' : 
          type === 'warning' ? 'text-amber-600 dark:text-amber-300' : 
          'text-navy dark:text-dark-secondary'
        ]">
          {{ message }}
        </div>
      </div>
      <button 
        @click="close" 
        type="button" 
        class="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 focus:outline-none focus:ring-2"
        :class="[
          type === 'success' ? 'text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 focus:ring-green-400' : 
          type === 'error' ? 'text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 focus:ring-red-400' : 
          type === 'warning' ? 'text-amber-500 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 focus:ring-amber-400' : 
          'text-primary hover:text-primary-light dark:text-secondary dark:hover:text-secondary-light focus:ring-secondary'
        ]"
        aria-label="Cerrar"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
        </svg>
      </button>
    </div>
  </transition>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Notificación'
  },
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'success', 'error', 'warning'].includes(value)
  },
  position: {
    type: String,
    default: 'top-right',
    validator: (value) => ['top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'].includes(value)
  },
  duration: {
    type: Number,
    default: 5000
  },
  autoClose: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['close']);

const positionClasses = computed(() => {
  switch (props.position) {
    case 'top-right':
      return 'top-4 right-4 animate-slide-in-right';
    case 'top-left':
      return 'top-4 left-4';
    case 'bottom-right':
      return 'bottom-4 right-4 animate-slide-in-right';
    case 'bottom-left':
      return 'bottom-4 left-4';
    case 'top-center':
      return 'top-4 left-1/2 transform -translate-x-1/2';
    case 'bottom-center':
      return 'bottom-4 left-1/2 transform -translate-x-1/2';
    default:
      return 'top-4 right-4 animate-slide-in-right';
  }
});

const timer = ref(null);

onMounted(() => {
  if (props.autoClose && props.duration > 0) {
    timer.value = setTimeout(() => {
      close();
    }, props.duration);
  }
});

const close = () => {
  if (timer.value) {
    clearTimeout(timer.value);
  }
  emit('close');
};
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.toast-enter-to,
.toast-leave-from {
  opacity: 1;
  transform: translateX(0);
}
</style> 