<template>
    <div class="timer-display">
      <span v-if="status === 'En Espera'">
        Espera: {{ displayTime }}
      </span>
      <span v-else-if="status === 'En Consulta'">
        Consulta: {{ displayTime }}
      </span>
      </div>
  </template>
  
  <script setup>
  import { ref, computed, watch, onUnmounted } from 'vue';
  
  const props = defineProps({
    status: {
      type: String,
      required: true,
    },
    startTime: {
      // Timestamp ISO string (arrival_time o consultation_start_time)
      type: String,
      default: null,
    },
    endTime: {
      // Timestamp ISO string para cuando el timer debe detenerse
      type: String,
      default: null,
    }
  });
  
  const elapsedSeconds = ref(0);
  const intervalId = ref(null);
  
  // Formatea los segundos a MM:SS
  const displayTime = computed(() => {
    if (elapsedSeconds.value < 0) return '00:00';
    const mins = Math.floor(elapsedSeconds.value / 60);
    const secs = elapsedSeconds.value % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  });
  
  // Función para iniciar/actualizar el temporizador
  const startTimer = () => {
    // Limpiar intervalo anterior si existe
    if (intervalId.value) {
      clearInterval(intervalId.value);
      intervalId.value = null;
    }
  
    // Solo iniciar si el estado es activo y hay hora de inicio
    if ((props.status === 'En Espera' || props.status === 'En Consulta') && props.startTime) {
      try {
        const start = new Date(props.startTime).getTime();
        if (isNaN(start)) {
            console.error("Invalid startTime prop:", props.startTime);
            elapsedSeconds.value = -1; // Indicar error
            return;
        }
        
        // Si hay un endTime, calcular los segundos estáticos entre startTime y endTime
        if (props.endTime && props.status === 'En Espera') {
          try {
            const end = new Date(props.endTime).getTime();
            if (!isNaN(end) && end >= start) {
              // Calcular el tiempo fijo entre inicio y fin
              elapsedSeconds.value = Math.floor((end - start) / 1000);
              // No iniciamos un intervalo, ya que el tiempo es estático
              return;
            }
          } catch (e) {
            console.error("Error parsing endTime:", props.endTime, e);
            // Continuamos con el cálculo normal si hay un error con endTime
          }
        }

        // Calcular segundos iniciales transcurridos
        const now = Date.now();
        elapsedSeconds.value = Math.max(0, Math.floor((now - start) / 1000));
  
        // Iniciar intervalo para actualizar cada segundo
        intervalId.value = setInterval(() => {
          elapsedSeconds.value++;
        }, 1000);
  
      } catch (e) {
          console.error("Error parsing startTime:", props.startTime, e);
          elapsedSeconds.value = -1; // Indicar error
      }
    } else {
      // Si el estado no es activo o no hay hora, resetear
      elapsedSeconds.value = 0;
    }
  };
  
  // Observar cambios en las props para iniciar/detener el timer
  watch(() => [props.status, props.startTime, props.endTime], startTimer, { immediate: true });
  
  // Limpiar el intervalo cuando el componente se destruye
  onUnmounted(() => {
    if (intervalId.value) {
      clearInterval(intervalId.value);
    }
  });
  </script>
  
  <style scoped>
  /* Removing monospace font in favor of system font */
  .timer-display {
    /* Using system font family instead of monospace */
    font-family: inherit;
  }
  </style>