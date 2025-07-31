<template>
  <div class="bg-white rounded-lg shadow p-4 border">
    <h3 class="text-lg font-medium text-gray-900 mb-4">🔧 Debug: Realtime Connection</h3>
    
    <div class="space-y-4">
      <!-- Estado de conexión -->
      <div>
        <h4 class="text-sm font-medium text-gray-700 mb-2">Estado de Conexión</h4>
        <div class="flex items-center space-x-3">
          <div 
            :class="[
              'w-4 h-4 rounded-full',
              appointmentsStore.isRealtimeConnected ? 'bg-green-500' : 'bg-red-500'
            ]"
          ></div>
          <span class="text-sm">
            {{ appointmentsStore.isRealtimeConnected ? 'Conectado' : 'Desconectado' }}
          </span>
        </div>
      </div>

      <!-- Información del canal -->
      <div>
        <h4 class="text-sm font-medium text-gray-700 mb-2">Canal Activo</h4>
        <p class="text-sm text-gray-600">
          {{ appointmentsStore.realtimeChannel ? 'appointments-changes' : 'Ninguno' }}
        </p>
        <p v-if="appointmentsStore.realtimeConnectionError" class="text-sm text-red-600 mt-1">
          Error: {{ appointmentsStore.realtimeConnectionError }}
        </p>
      </div>

      <!-- Controles -->
      <div class="flex space-x-2">
        <button
          @click="testConnection"
          :disabled="isLoading"
          class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {{ isLoading ? 'Probando...' : 'Probar Conexión' }}
        </button>
        
        <button
          @click="forceReconnect"
          :disabled="isLoading"
          class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          Reconectar
        </button>
      </div>

      <!-- Logs recientes -->
      <div>
        <h4 class="text-sm font-medium text-gray-700 mb-2">Eventos Recientes</h4>
        <div class="bg-gray-50 rounded-md p-3 max-h-48 overflow-y-auto">
          <div v-if="recentEvents.length === 0" class="text-sm text-gray-500">
            No hay eventos recientes
          </div>
          <div v-else class="space-y-1">
            <div 
              v-for="(event, index) in recentEvents" 
              :key="index"
              class="text-xs font-mono"
            >
              <span class="text-gray-500">{{ event.timestamp }}</span>
              <span :class="getEventColor(event.type)" class="ml-2">
                {{ event.type }}
              </span>
              <span class="text-gray-700 ml-2">{{ event.message }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAppointmentsStore } from '@/stores/appointments'
import { supabase } from '@/supabaseClient'

const appointmentsStore = useAppointmentsStore()
const isLoading = ref(false)
const recentEvents = ref([])

const addEvent = (type, message) => {
  const timestamp = new Date().toLocaleTimeString()
  recentEvents.value.unshift({ timestamp, type, message })
  
  // Mantener solo los últimos 20 eventos
  if (recentEvents.value.length > 20) {
    recentEvents.value = recentEvents.value.slice(0, 20)
  }
}

const getEventColor = (type) => {
  switch (type) {
    case 'SUCCESS': return 'text-green-600'
    case 'ERROR': return 'text-red-600'
    case 'WARNING': return 'text-yellow-600'
    case 'INFO': return 'text-blue-600'
    default: return 'text-gray-600'
  }
}

const testConnection = async () => {
  isLoading.value = true
  addEvent('INFO', 'Iniciando prueba de conexión...')
  
  try {
    // Importar el servicio de real-time dinámicamente
    const { default: realtimeService } = await import('@/services/realtimeService')
    
    // Verificar disponibilidad de real-time
    const isAvailable = await realtimeService.checkRealtimeAvailability()
    
    if (isAvailable) {
      addEvent('SUCCESS', 'Real-time disponible')
    } else {
      addEvent('ERROR', 'Real-time no disponible')
    }
    
    // Obtener información de depuración
    const debugInfo = realtimeService.getDebugInfo()
    addEvent('INFO', `Autenticado: ${debugInfo.isAuthenticated}`)
    addEvent('INFO', `Usuario: ${debugInfo.currentSession || 'Ninguno'}`)
    addEvent('INFO', `Canales Supabase: ${debugInfo.supabaseChannels}`)
    
    // Verificar estado del store
    if (appointmentsStore.isRealtimeConnected) {
      addEvent('SUCCESS', 'Store: Realtime conectado')
      addEvent('INFO', `Canal: ${appointmentsStore.realtimeChannel ? 'appointments-changes' : 'undefined'}`)
    } else {
      addEvent('WARNING', 'Store: Realtime desconectado')
      if (appointmentsStore.realtimeConnectionError) {
        addEvent('ERROR', `Error: ${appointmentsStore.realtimeConnectionError}`)
      }
    }
    
    // Verificar si Supabase está disponible
    const { data, error } = await supabase
      .from('appointments')
      .select('count', { count: 'exact', head: true })
    
    if (error) {
      addEvent('ERROR', `Error en consulta: ${error.message}`)
    } else {
      addEvent('SUCCESS', 'Conexión a Supabase exitosa')
    }
    
  } catch (err) {
    addEvent('ERROR', `Error en prueba: ${err.message}`)
  } finally {
    isLoading.value = false
  }
}

const forceReconnect = () => {
  isLoading.value = true
  addEvent('INFO', 'Forzando reconexión...')
  
  try {
    // Desconectar y volver a conectar
    appointmentsStore.unsubscribeFromRealtimeUpdates()
    
    setTimeout(() => {
      appointmentsStore.subscribeToRealtimeUpdates()
      addEvent('INFO', 'Reconexión iniciada')
      isLoading.value = false
    }, 1000)
    
  } catch (err) {
    addEvent('ERROR', `Error en reconexión: ${err.message}`)
    isLoading.value = false
  }
}

onMounted(() => {
  addEvent('INFO', 'Debugger iniciado')
})

onUnmounted(() => {
  // Limpiar si es necesario
})
</script> 