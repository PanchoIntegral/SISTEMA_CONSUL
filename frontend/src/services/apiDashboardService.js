// src/services/apiDashboardService.js
import apiClient from './apiClient';

export default {
  /**
   * Obtiene las estadísticas del dashboard para un mes y año específicos
   * @param {number} month - Mes (1-12)
   * @param {number} year - Año
   * @returns {Promise<Object>} Datos estadísticos
   */
  async getDashboardStats(month, year) {
    try {
      const response = await apiClient.get(`/dashboard/stats`, {
        params: { month, year },
        timeout: 10000 // Timeout de 10 segundos
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas del dashboard:', error);
      if (error.code === 'ECONNABORTED') {
        throw new Error('Tiempo de espera agotado. Verifica tu conexión a internet.');
      } else if (error.response) {
        throw new Error(error.response.data?.message || 'Error al obtener estadísticas');
      } else if (error.message === 'Network Error') {
        throw new Error('Error de red. Verifica tu conexión o que el servidor esté en funcionamiento.');
      }
      throw error;
    }
  },

  /**
   * Obtiene el tiempo promedio de espera por día para un mes específico
   * @param {number} month - Mes (1-12)
   * @param {number} year - Año
   * @returns {Promise<Array>} Datos de tiempo de espera por día
   */
  async getAverageWaitTimeByDay(month, year) {
    try {
      const response = await apiClient.get(`/dashboard/wait-time`, {
        params: { month, year },
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener tiempos de espera:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || 'Error al obtener tiempos de espera');
      }
      throw error;
    }
  },

  /**
   * Obtiene el tiempo promedio de consulta por día para un mes específico
   * @param {number} month - Mes (1-12)
   * @param {number} year - Año
   * @returns {Promise<Array>} Datos de tiempo de consulta por día
   */
  async getAverageConsultTimeByDay(month, year) {
    try {
      const response = await apiClient.get(`/dashboard/consult-time`, {
        params: { month, year },
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener tiempos de consulta:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || 'Error al obtener tiempos de consulta');
      }
      throw error;
    }
  },

  /**
   * Obtiene el número de citas por doctor para un mes específico
   * @param {number} month - Mes (1-12)
   * @param {number} year - Año
   * @returns {Promise<Array>} Datos de citas por doctor
   */
  async getAppointmentsByDoctor(month, year) {
    try {
      const response = await apiClient.get(`/dashboard/appointments-by-doctor`, {
        params: { month, year },
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener citas por doctor:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || 'Error al obtener citas por doctor');
      }
      throw error;
    }
  },

  /**
   * Obtiene el número de citas por día para un mes específico
   * @param {number} month - Mes (1-12)
   * @param {number} year - Año
   * @returns {Promise<Array>} Datos de citas por día [{day: N, count: M}, ...]
   */
  async getAppointmentsByDay(month, year) {
    try {
      const response = await apiClient.get(`/dashboard/appointments-by-day`, {
        params: { month, year },
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener citas por día:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || 'Error al obtener citas por día');
      }
      throw error;
    }
  }
};