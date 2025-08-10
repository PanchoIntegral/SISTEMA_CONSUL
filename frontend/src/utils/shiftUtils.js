/**
 * Utilidades para manejo de turnos de citas
 */

/**
 * Determina el turno basado en la hora de la cita
 * @param {string} appointmentTimeStr - String de fecha/hora en formato ISO
 * @returns {string} - 'mañana', 'tarde', 'fuera_horario'
 */
export function getShiftFromTime(appointmentTimeStr) {
  try {
    if (!appointmentTimeStr) return 'indeterminado';
    
    // Crear fecha desde el string ISO
    const appointmentDate = new Date(appointmentTimeStr);
    
    // Obtener la hora local (ya convertida por el navegador)
    const hour = appointmentDate.getHours();
    
    // Determinar turno
    if (hour >= 9 && hour < 15) {  // 9:00 AM - 2:59 PM
      return 'mañana';
    } else if (hour >= 16 && hour < 21) {  // 4:00 PM - 8:59 PM
      return 'tarde';
    } else {
      return 'fuera_horario';
    }
  } catch (error) {
    console.error('Error determinando turno:', error);
    return 'indeterminado';
  }
}

/**
 * Obtiene el nombre de visualización del turno
 * @param {string} shift - Turno ('mañana', 'tarde', etc.)
 * @returns {string} - Nombre legible del turno
 */
export function getShiftDisplayName(shift) {
  const shiftNames = {
    'mañana': 'Mañana',
    'tarde': 'Tarde',
    'fuera_horario': 'Fuera de horario',
    'indeterminado': 'Sin determinar'
  };
  return shiftNames[shift] || shift;
}

/**
 * Obtiene el componente de icono correspondiente al turno
 * @param {string} shift - Turno ('mañana', 'tarde', etc.)
 * @returns {object} - Objeto con propiedades del icono para usar en componentes
 */
export function getShiftIconProps(shift) {
  const shiftIcons = {
    'mañana': {
      path: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
      title: 'Turno Mañana'
    },
    'tarde': {
      path: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z',
      title: 'Turno Tarde'
    },
    'fuera_horario': {
      path: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      title: 'Fuera de Horario'
    },
    'indeterminado': {
      path: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      title: 'Horario Sin Determinar'
    }
  };
  
  return shiftIcons[shift] || {
    path: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    title: 'Cita'
  };
}

/**
 * Obtiene información completa del turno
 * @param {string} appointmentTimeStr - String de fecha/hora en formato ISO
 * @returns {object} - Objeto con shift, displayName, iconProps
 */
export function getShiftInfo(appointmentTimeStr) {
  const shift = getShiftFromTime(appointmentTimeStr);
  return {
    shift,
    displayName: getShiftDisplayName(shift),
    iconProps: getShiftIconProps(shift)
  };
}

/**
 * Obtiene el rango de horas del turno
 * @param {string} shift - Turno ('mañana', 'tarde')
 * @returns {string} - Rango de horas legible
 */
export function getShiftTimeRange(shift) {
  const timeRanges = {
    'mañana': '9:00 AM - 3:00 PM',
    'tarde': '4:00 PM - 9:00 PM',
    'fuera_horario': 'Fuera del horario normal',
    'indeterminado': 'Horario no disponible'
  };
  return timeRanges[shift] || 'Horario desconocido';
}