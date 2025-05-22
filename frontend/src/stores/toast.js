import { defineStore } from 'pinia';
import { ref } from 'vue';
import toastService from '@/services/toastService';

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([]);

  // Mostrar una notificación toast
  const showToast = (message, type = 'info', options = {}) => {
    let title = '';
    
    // Configurar título según tipo
    switch(type) {
      case 'success':
        title = 'Éxito';
        break;
      case 'error':
        title = 'Error';
        break;
      case 'warning':
        title = 'Advertencia';
        break;
      case 'info':
      default:
        title = 'Información';
        break;
    }
    
    // Usar el servicio de toast
    return toastService.show({
      type,
      title,
      message,
      ...options
    });
  };
  
  // Cerrar una notificación específica
  const dismissToast = (id) => {
    toastService.dismiss(id);
  };
  
  // Cerrar todas las notificaciones
  const dismissAllToasts = () => {
    toastService.dismissAll();
  };

  return {
    toasts,
    showToast,
    dismissToast,
    dismissAllToasts
  };
}); 