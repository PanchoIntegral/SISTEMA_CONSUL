<template>
  <div class="flex items-center space-x-2 text-sm">
    <!-- Indicador visual -->
    <div 
      :class="[
        'w-3 h-3 rounded-full transition-colors duration-300',
        isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
      ]"
      :title="statusTooltip"
    ></div>
    
    <!-- Texto del estado -->
    <span 
      :class="[
        'text-xs font-medium',
        isConnected ? 'text-green-700' : 'text-red-700'
      ]"
    >
      {{ statusText }}
    </span>
    
    <!-- Botón de reconexión si hay error -->
    <button
      v-if="!isConnected && showReconnectButton"
      @click="reconnect"
      class="text-xs text-blue-600 hover:text-blue-800 underline focus:outline-none"
      title="Intentar reconectar realtime"
    >
      Reconectar
    </button>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useAppointmentsStore } from '@/stores/appointments'

const appointmentsStore = useAppointmentsStore()
const showReconnectButton = ref(false)

// Estados computados
const isConnected = computed(() => appointmentsStore.isRealtimeConnected)

const statusText = computed(() => {
  if (isConnected.value) {
    return 'Tiempo real activo'
  } else if (appointmentsStore.realtimeConnectionError) {
    return 'Error de conexión'
  } else {
    return 'Desconectado'
  }
})

const statusTooltip = computed(() => {
  if (isConnected.value) {
    return 'Las actualizaciones en tiempo real están funcionando correctamente'
  } else if (appointmentsStore.realtimeConnectionError) {
    return `Error: ${appointmentsStore.realtimeConnectionError}`
  } else {
    return 'Las actualizaciones en tiempo real no están disponibles'
  }
})

// Funciones
const reconnect = () => {
  console.log('Intentando reconectar realtime...')
  appointmentsStore.unsubscribeFromRealtimeUpdates()
  
  setTimeout(() => {
    appointmentsStore.subscribeToRealtimeUpdates()
  }, 1000)
}

// Mostrar botón de reconexión después de 5 segundos sin conexión
let reconnectTimer = null

const handleConnectionChange = () => {
  if (isConnected.value) {
    showReconnectButton.value = false
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  } else {
    // Mostrar botón de reconexión después de 5 segundos
    reconnectTimer = setTimeout(() => {
      showReconnectButton.value = true
    }, 5000)
  }
}

onMounted(() => {
  // Vigilar cambios en el estado de conexión
  handleConnectionChange()
})

onUnmounted(() => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
  }
})

// Reactivo a cambios en isConnected
import { watch } from 'vue'
watch(isConnected, handleConnectionChange)
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style> 