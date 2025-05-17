<template>
  <div class="p-2 sm:p-4 md:p-8">
    <h1 class="text-2xl font-semibold mb-4 sm:mb-6 text-gray-800 dark:text-white flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-indigo-600 dark:text-indigo-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      Dashboard de Estadísticas
    </h1>

    <div class="flex items-center justify-between mb-4 sm:mb-6">
      <div>
        <label for="month-selector" class="block text-sm font-medium text-navy dark:text-gray-300 mb-2">Seleccionar Mes:</label>
        <select
          id="month-selector"
          v-model="selectedMonth"
          @change="fetchDashboardData"
          class="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option v-for="(month, index) in months" :key="index" :value="index + 1">
            {{ month }}
          </option>
        </select>
      </div>
      
      <div class="hidden md:block">
        <span class="text-sm font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full">{{ currentYear }}</span>
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-12 sm:py-16">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      <p class="text-gray-500 dark:text-gray-400 mt-4">Cargando estadísticas...</p>
    </div>

    <div v-else-if="error" class="rounded-md bg-red-50 dark:bg-red-900/30 p-4 mb-4 sm:mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800 dark:text-red-300">Error al cargar estadísticas</h3>
          <div class="mt-2 text-sm text-red-700 dark:text-red-400">
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

    <div v-else class="space-y-6">
      <!-- Tarjetas principales -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <!-- Tarjeta 1: Total de Citas -->
        <div class="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-5 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center mb-3">
            <div class="bg-indigo-100 dark:bg-indigo-800/50 p-2 rounded-full mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-600 dark:text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 class="text-lg font-semibold text-indigo-800 dark:text-indigo-300">Total de Citas</h2>
          </div>
          <div class="flex items-end">
            <span class="text-3xl font-bold text-indigo-700 dark:text-indigo-400">{{ stats.totalAppointments }}</span>
            <span class="text-sm text-indigo-600/70 dark:text-indigo-400/70 ml-2 mb-1">citas este mes</span>
          </div>
          <div class="mt-4 h-48 sm:h-64">
            <canvas ref="appointmentsChart"></canvas>
          </div>
        </div>

        <!-- Tarjeta 2: Tiempo Promedio de Espera -->
        <div class="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-5 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center mb-3">
            <div class="bg-blue-100 dark:bg-blue-800/50 p-2 rounded-full mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 class="text-lg font-semibold text-blue-800 dark:text-blue-300">Tiempo Promedio de Espera</h2>
          </div>
          <div class="flex items-end">
            <span class="text-3xl font-bold text-blue-700 dark:text-blue-400">{{ stats.avgWaitTime }}</span>
            <span class="text-sm text-blue-600/70 dark:text-blue-400/70 ml-2 mb-1">minutos</span>
          </div>
          <div class="mt-4 h-48 sm:h-64">
            <canvas ref="waitTimeChart"></canvas>
          </div>
        </div>

        <!-- Tarjeta 3: Tiempo Promedio de Consulta -->
        <div class="bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 p-5 rounded-xl border border-teal-200 dark:border-teal-800 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center mb-3">
            <div class="bg-teal-100 dark:bg-teal-800/50 p-2 rounded-full mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-teal-600 dark:text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 class="text-lg font-semibold text-teal-800 dark:text-teal-300">Tiempo Promedio de Consulta</h2>
          </div>
          <div class="flex items-end">
            <span class="text-3xl font-bold text-teal-700 dark:text-teal-400">{{ stats.avgConsultTime }}</span>
            <span class="text-sm text-teal-600/70 dark:text-teal-400/70 ml-2 mb-1">minutos</span>
          </div>
          <div class="mt-4 h-48 sm:h-64">
            <canvas ref="consultTimeChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Nueva sección: Estado de las citas -->
      <div class="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md mb-4 md:mb-6">
        <h2 class="flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-white mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
          </svg>
          Estado de Citas
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Citas Completadas -->
          <div class="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-5 rounded-xl border border-green-200 dark:border-green-800 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center mb-3">
              <div class="bg-green-100 dark:bg-green-800/50 p-2 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-green-800 dark:text-green-300">Citas Completadas</h3>
            </div>
            <div class="flex items-end justify-between">
              <p class="text-3xl font-bold text-green-700 dark:text-green-400">{{ stats.completedAppointments }}</p>
              <p class="text-sm font-medium bg-green-200 dark:bg-green-800/70 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                {{ calculatePercentage(stats.completedAppointments, stats.totalAppointments) }}% del total
              </p>
            </div>
          </div>
          
          <!-- Citas Canceladas -->
          <div class="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-5 rounded-xl border border-red-200 dark:border-red-800 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center mb-3">
              <div class="bg-red-100 dark:bg-red-800/50 p-2 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-600 dark:text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-red-800 dark:text-red-300">Citas Canceladas</h3>
            </div>
            <div class="flex items-end justify-between">
              <p class="text-3xl font-bold text-red-700 dark:text-red-400">{{ stats.canceledAppointments }}</p>
              <p class="text-sm font-medium bg-red-200 dark:bg-red-800/70 text-red-800 dark:text-red-200 px-2 py-1 rounded-full">
                {{ calculatePercentage(stats.canceledAppointments, stats.totalAppointments) }}% del total
              </p>
            </div>
          </div>
          
          <!-- No Asistió -->
          <div class="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-5 rounded-xl border border-purple-200 dark:border-purple-800 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center mb-3">
              <div class="bg-purple-100 dark:bg-purple-800/50 p-2 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-600 dark:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-purple-800 dark:text-purple-300">No Asistió</h3>
            </div>
            <div class="flex items-end justify-between">
              <p class="text-3xl font-bold text-purple-700 dark:text-purple-400">{{ stats.noshowAppointments }}</p>
              <p class="text-sm font-medium bg-purple-200 dark:bg-purple-800/70 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full">
                {{ calculatePercentage(stats.noshowAppointments, stats.totalAppointments) }}% del total
              </p>
            </div>
          </div>
        </div>
        
        <div class="mt-8 p-4 bg-white dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-700 shadow-inner">
          <div class="flex flex-col md:flex-row items-center justify-between mb-4">
            <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 md:mb-0">Distribución de citas por estado</h4>
            <div class="flex gap-4">
              <div class="flex items-center">
                <div class="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                <span class="text-xs text-gray-600 dark:text-gray-300">Completadas</span>
              </div>
              <div class="flex items-center">
                <div class="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                <span class="text-xs text-gray-600 dark:text-gray-300">Canceladas</span>
              </div>
              <div class="flex items-center">
                <div class="w-3 h-3 bg-purple-500 rounded-full mr-1"></div>
                <span class="text-xs text-gray-600 dark:text-gray-300">No Asistió</span>
              </div>
            </div>
          </div>
          <div class="h-64">
            <canvas ref="statusChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Gráfico principal -->
      <div class="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/90 dark:to-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div class="flex items-center mb-4">
          <div class="bg-gray-200 dark:bg-gray-700 p-2 rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 class="text-lg font-semibold text-gray-800 dark:text-white">Citas por Doctor</h2>
        </div>
        
        <div class="mt-4 h-72 sm:h-80 p-2">
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
  const statusChart = ref(null);

  // Charts instances
  let appointmentsChartInstance = null;
  let waitTimeChartInstance = null;
  let consultTimeChartInstance = null;
  let doctorsChartInstance = null;
  let statusChartInstance = null;

  // Store de dashboard
  const dashboardStore = useDashboardStore();

  // Computed properties para acceder al estado del store
  const isLoading = computed(() => dashboardStore.loading);
  const error = computed(() => dashboardStore.currentError); // Usar el error del store
  const stats = computed(() => dashboardStore.stats);

  // Función para calcular porcentaje
  const calculatePercentage = (value, total) => {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  };

  // Detectar modo oscuro para ajustar los gráficos
  const isDarkMode = computed(() => {
    return document.documentElement.classList.contains('dark') || 
           window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

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

    // Colores para los gráficos adaptados al modo oscuro
    const textColor = isDarkMode.value ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)';
    const gridColor = isDarkMode.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    // Opciones comunes para los gráficos en modo oscuro
    const darkModeOptions = {
      scales: {
        x: {
          ticks: { color: textColor },
          grid: { color: gridColor }
        },
        y: {
          ticks: { color: textColor },
          grid: { color: gridColor }
        }
      },
      plugins: {
        legend: {
          labels: { color: textColor }
        }
      }
    };

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
        if (statusChartInstance) statusChartInstance.destroy();

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
            options: { 
                responsive: true, 
                maintainAspectRatio: false,
                ...(isDarkMode.value ? darkModeOptions : {})
            }
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
            options: { 
                responsive: true, 
                maintainAspectRatio: false,
                ...(isDarkMode.value ? darkModeOptions : {})
            }
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
            options: { 
                responsive: true, 
                maintainAspectRatio: false,
                ...(isDarkMode.value ? darkModeOptions : {})
            }
        });

        // Gráfico de estado de citas (nuevo)
        statusChartInstance = new Chart(statusChart.value.getContext('2d'), { 
            type: 'doughnut',
            data: {
                labels: ['Completadas', 'Canceladas', 'No Asistió'],
                datasets: [{
                    data: [
                        stats.value.completedAppointments,
                        stats.value.canceledAppointments,
                        stats.value.noshowAppointments
                    ],
                    backgroundColor: [
                        'rgba(34, 197, 94, 0.7)', // Verde para Completadas
                        'rgba(239, 68, 68, 0.7)',  // Rojo para Canceladas
                        'rgba(147, 51, 234, 0.7)'  // Morado para No Asistió
                    ],
                    borderColor: [
                        'rgb(22, 163, 74)',        // Verde oscuro borde
                        'rgb(220, 38, 38)',        // Rojo oscuro borde
                        'rgb(126, 34, 206)'        // Morado oscuro borde
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        position: 'bottom',
                        labels: { 
                            padding: 20,
                            color: textColor
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                let value = context.raw;
                                let total = context.dataset.data.reduce((a, b) => a + b, 0);
                                let percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
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
                    legend: { 
                        display: false
                    }
                },
                ...(isDarkMode.value ? darkModeOptions : {})
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
  
  // Observar cambios en el modo oscuro
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', () => {
    fetchDashboardData();
  });
  
  // Observar cambios en la clase 'dark' del HTML para temas personalizados
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        fetchDashboardData();
      }
    });
  });
  
  observer.observe(document.documentElement, { attributes: true });
});

// Observar cambios en el mes seleccionado para recargar todo
watch(selectedMonth, () => {
  fetchDashboardData();
});

// Observar cambios en el modo oscuro
watch(isDarkMode, () => {
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