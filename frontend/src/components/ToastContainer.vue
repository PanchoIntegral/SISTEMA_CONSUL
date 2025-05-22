<template>
  <div class="toast-container">
    <ToastNotification
      v-for="toast in toasts"
      :key="toast.id"
      :show="toast.show"
      :title="toast.title"
      :message="toast.message"
      :type="toast.type"
      :position="toast.position"
      :auto-close="false"
      @close="dismissToast(toast.id)"
    />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import ToastNotification from './ToastNotification.vue';
import { toastService } from '../services/toastService';

// Referencia a los toasts activos
const toasts = ref([]);

// Actualizar la lista de toasts cada vez que cambia
const updateToasts = () => {
  toasts.value = toastService.getToasts();
};

// Cerrar un toast específico
const dismissToast = (id) => {
  toastService.dismiss(id);
};

// Configurar un observador para mantener sincronizada la lista de toasts
onMounted(() => {
  // Inicializar la lista
  updateToasts();
  
  // Configurar un intervalo para verificar cambios en los toasts
  // Esto es una solución simple. En una aplicación más compleja,
  // podríamos usar un patrón de observador o un sistema de eventos
  const interval = setInterval(updateToasts, 100);
  
  // Limpiar el intervalo cuando el componente se desmonta
  onUnmounted(() => {
    clearInterval(interval);
  });
});
</script>

<style scoped>
.toast-container {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  overflow: hidden;
}

.toast-container > * {
  pointer-events: auto;
}
</style> 