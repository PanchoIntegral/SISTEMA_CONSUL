import { ref, reactive } from 'vue';

// Estado global para las notificaciones
const toasts = reactive([]);
const toastId = ref(0);

// Servicio para gestionar las notificaciones toast
export const toastService = {
  // Mostrar una notificación de tipo info
  info(title, message, options = {}) {
    this.show({
      type: 'info',
      title,
      message,
      ...options
    });
  },

  // Mostrar una notificación de tipo éxito
  success(title, message, options = {}) {
    this.show({
      type: 'success',
      title,
      message,
      ...options
    });
  },

  // Mostrar una notificación de tipo error
  error(title, message, options = {}) {
    this.show({
      type: 'error',
      title,
      message,
      ...options
    });
  },

  // Mostrar una notificación de tipo advertencia
  warning(title, message, options = {}) {
    this.show({
      type: 'warning',
      title,
      message,
      ...options
    });
  },

  // Método principal para mostrar cualquier tipo de notificación
  show({ type = 'info', title = 'Notificación', message = '', position = 'top-right', duration = 5000, autoClose = true }) {
    const id = toastId.value++;
    
    // Crear la nueva notificación
    const toast = {
      id,
      type,
      title,
      message,
      position,
      duration,
      autoClose,
      show: true
    };
    
    // Añadir a la lista de notificaciones
    toasts.push(toast);
    
    // Configurar auto-cierre si está habilitado
    if (autoClose && duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }
    
    return id;
  },

  // Cerrar una notificación específica por su ID
  dismiss(id) {
    const index = toasts.findIndex(toast => toast.id === id);
    if (index !== -1) {
      toasts[index].show = false;
      // Eliminar después de la animación de salida
      setTimeout(() => {
        const removeIndex = toasts.findIndex(toast => toast.id === id);
        if (removeIndex !== -1) {
          toasts.splice(removeIndex, 1);
        }
      }, 300); // Duración de la animación
    }
  },

  // Cerrar todas las notificaciones
  dismissAll() {
    toasts.forEach(toast => {
      this.dismiss(toast.id);
    });
  },

  // Obtener todas las notificaciones (para el componente que las renderiza)
  getToasts() {
    return toasts;
  }
};

export default toastService; 