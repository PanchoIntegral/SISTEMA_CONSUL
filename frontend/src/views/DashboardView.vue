<template>
  <div class="p-2 sm:p-4 md:p-8">
    <h1 class="text-2xl font-semibold mb-4 sm:mb-6 text-gray-800">Dashboard de Estadísticas</h1>

    <div class="mb-4 sm:mb-6">
      <label for="month-selector" class="block text-sm font-medium text-navy mb-2">Seleccionar Mes:</label>
      <select
        id="month-selector"
        v-model="selectedMonth"
        @change="fetchDashboardData"
        class="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm p-2"
      >
        <option v-for="(month, index) in months" :key="index" :value="index + 1">
          {{ month }}
        </option>
      </select>
    </div>

    <div v-if="isLoading" class="text-center py-6 sm:py-10">
      <p class="text-gray-500">Cargando estadísticas...</p>
    </div>

    <div v-else-if="error" class="rounded-md bg-red-50 p-4 mb-4 sm:mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error al cargar estadísticas</h3>
          <div class="mt-2 text-sm text-red-700">
            <p>{{ error }}</p>
          </div>
          <div class="mt-4">
            <button
              type="button"
              @click="fetchDashboardData"
              class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
        <!-- Tarjeta 1: Total de Citas -->
        <div class="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <h2 class="text-lg font-medium text-primary mb-2">Total de Citas</h2>
          <p class="text-3xl font-bold text-secondary">{{ stats.totalAppointments }}</p>
          <div class="mt-4 h-48 sm:h-64">
            <canvas ref="appointmentsChart"></canvas>
          </div>
        </div>

        <!-- Tarjeta 2: Tiempo Promedio de Espera -->
        <div class="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <h2 class="text-lg font-medium text-primary mb-2">Tiempo Promedio de Espera</h2>
          <p class="text-3xl font-bold text-wave-blue">{{ stats.avgWaitTime }} min</p>
          <div class="mt-4 h-48 sm:h-64">
            <canvas ref="waitTimeChart"></canvas>
          </div>
        </div>

        <!-- Tarjeta 3: Tiempo Promedio de Consulta -->
        <div class="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <h2 class="text-lg font-medium text-primary mb-2">Tiempo Promedio de Consulta</h2>
          <p class="text-3xl font-bold text-wave-teal">{{ stats.avgConsultTime }} min</p>
          <div class="mt-4 h-48 sm:h-64">
            <canvas ref="consultTimeChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Gráfico principal -->
      <div class="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <h2 class="text-lg font-medium text-primary mb-2">Citas por Doctor</h2>
        <div class="mt-4 h-60 sm:h-80">
          <canvas ref="doctorsChart"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, watch, computed } from 'vue';
  import Chart from 'chart.js/auto';
  // Asegúrate que esta ruta sea correcta
  // import { useDoctorsStore } from '@/stores/doctors'; // Comentado si no se usa directamente aquí
  import { useDashboardStore } from '@/stores/dashboard';

  // Referencias para los gráficos
  const appointmentsChart = ref(null);
  const waitTimeChart = ref(null);
  const consultTimeChart = ref(null);
  const doctorsChart = ref(null);

  // Charts instances
  let appointmentsChartInstance = null;
  let waitTimeChartInstance = null;
  let consultTimeChartInstance = null;
  let doctorsChartInstance = null;

  // Store de dashboard
  const dashboardStore = useDashboardStore();

  // Computed properties para acceder al estado del store
  const isLoading = computed(() => dashboardStore.loading);
  const error = computed(() => dashboardStore.currentError); // Usar el error del store
  const stats = computed(() => dashboardStore.stats);

  // Selector de mes
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const currentDate = new Date();
  const selectedMonth = ref(currentDate.getMonth() + 1); // Mes actual (1-12)
  const currentYear = currentDate.getFullYear();

  // Comentado si no se usa directamente aquí
  // const doctorsStore = useDoctorsStore();

  // Función para obtener datos generales del dashboard (se llama al inicio y al cambiar mes)
  const fetchDashboardData = async () => {
    try {
     
      await dashboardStore.fetchDashboardStats(selectedMonth.value, currentYear);

      if (!dashboardStore.currentError) {
           await updateCharts(); // Hacerla async y esperar a que termine
      }

    } catch (err) {
      console.error('Error en fetchDashboardData:', err);
    }
  };

  // Función para actualizar específicamente los gráficos
  const updateCharts = async () => {
    // Datos para los gráficos
    let days = [];
    let waitTimeData = [];
    let consultTimeData = [];
    let appointmentsData = []; // Para el gráfico de citas por día

    const numDaysInMonth = new Date(currentYear, selectedMonth.value, 0).getDate();
    const defaultDays = Array.from({ length: numDaysInMonth }, (_, i) => (i + 1).toString());

    try {
        // --- Obtener datos específicos para los gráficos de línea ---
        // Estas acciones ahora devuelven el array directamente de la API
        const waitTimeResponse = await dashboardStore.fetchWaitTimeData(selectedMonth.value, currentYear);
        const consultTimeResponse = await dashboardStore.fetchConsultTimeData(selectedMonth.value, currentYear);
        // *** USAR LA NUEVA ACCIÓN para citas por día ***
        const appointmentsByDayResponse = await dashboardStore.fetchAppointmentsByDay(selectedMonth.value, currentYear);

        // --- Procesar Tiempo de Espera ---
        if (Array.isArray(waitTimeResponse) && waitTimeResponse.length > 0) {
            waitTimeResponse.sort((a, b) => a.day - b.day);
            days = waitTimeResponse.map(item => item.day.toString()); // Usar días reales si hay datos
            waitTimeData = waitTimeResponse.map(item => item.avgWaitTime);
        } else {
            days = [...defaultDays]; // Usar días por defecto si no hay datos
            waitTimeData = Array(days.length).fill(0);
        }

        // --- Procesar Tiempo de Consulta ---
        // Asegurarnos de que los datos coincidan con los 'days' calculados
        if (Array.isArray(consultTimeResponse) && consultTimeResponse.length > 0) {
            consultTimeResponse.sort((a, b) => a.day - b.day);
            consultTimeData = days.map(day => {
                const matchingDay = consultTimeResponse.find(item => item.day.toString() === day);
                return matchingDay ? matchingDay.avgConsultTime : 0;
            });
        } else {
            consultTimeData = Array(days.length).fill(0);
        }

        // --- Procesar Citas por Día ---
        if (Array.isArray(appointmentsByDayResponse) && appointmentsByDayResponse.length > 0) {
            appointmentsByDayResponse.sort((a, b) => a.day - b.day);
            appointmentsData = days.map(day => {
                const matchingDay = appointmentsByDayResponse.find(item => item.day.toString() === day);
                return matchingDay ? matchingDay.count : 0;
            });
        } else {
            appointmentsData = Array(days.length).fill(0);
        }

        // --- Destruir y Crear Gráficos ---
        if (appointmentsChartInstance) appointmentsChartInstance.destroy();
        if (waitTimeChartInstance) waitTimeChartInstance.destroy();
        if (consultTimeChartInstance) consultTimeChartInstance.destroy();
        if (doctorsChartInstance) doctorsChartInstance.destroy();

        // Gráfico de citas por día
        appointmentsChartInstance = new Chart(appointmentsChart.value.getContext('2d'), { // Usar getContext('2d')
            type: 'line',
            data: {
                labels: days,
                datasets: [{
                    label: 'Citas por día',
                    data: appointmentsData,
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        // Gráfico de tiempo de espera
        waitTimeChartInstance = new Chart(waitTimeChart.value.getContext('2d'), { // Usar getContext('2d')
            type: 'line',
            data: {
                labels: days,
                datasets: [{
                    label: 'Tiempo de espera (min)',
                    data: waitTimeData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        // Gráfico de tiempo de consulta
        consultTimeChartInstance = new Chart(consultTimeChart.value.getContext('2d'), { // Usar getContext('2d')
            type: 'line',
            data: {
                labels: days,
                datasets: [{
                    label: 'Tiempo de consulta (min)',
                    data: consultTimeData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

       
        const doctorChartData = stats.value.appointmentsByDoctor || []; // Usar fallback por si acaso
        // Usar nombres exactos de la API (asumiendo que son estos)
        const doctorNames = doctorChartData.map(d => d.doctorName);
        const doctorCounts = doctorChartData.map(d => d.appointmentCount);

        doctorsChartInstance = new Chart(doctorsChart.value.getContext('2d'), { 
            type: 'bar',
            data: {
                labels: doctorNames,
                datasets: [{
                    label: 'Número de citas',
                    data: doctorCounts,
                    backgroundColor: [
                       'rgba(79, 70, 229, 0.7)',
                       'rgba(16, 185, 129, 0.7)',
                       'rgba(59, 130, 246, 0.7)',
                       'rgba(249, 115, 22, 0.7)',
                       'rgba(236, 72, 153, 0.7)'
                       
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                }
            }
        });

    } catch (err) {
        console.error('Error al actualizar los gráficos:', err);
        // Podrías setear un error específico para los gráficos si lo deseas
        // error.value = 'Error al renderizar los gráficos.';
    }
};

// Cargar datos iniciales al montar el componente
onMounted(() => {
  // Comentado si no se usa directamente aquí
  // await doctorsStore.fetchDoctors();
  fetchDashboardData(); // Llama a la función principal que luego llama a updateCharts
});

// Observar cambios en el mes seleccionado para recargar todo
watch(selectedMonth, () => {
  fetchDashboardData();
});
</script>

<style scoped>
/* Ajustes específicos para gráficos responsivos */
canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>