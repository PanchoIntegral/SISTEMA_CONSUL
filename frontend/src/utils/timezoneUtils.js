/**
 * Utilidades para manejo de zona horaria de Tijuana
 */

/**
 * Convierte una fecha y hora seleccionada localmente a UTC,
 * considerando que el usuario está en zona horaria de Tijuana
 * @param {string} dateStr - Fecha en formato YYYY-MM-DD
 * @param {string} timeStr - Hora en formato HH:MM
 * @returns {string} - Fecha en formato ISO UTC
 */
export function createTijuanaDateTimeAsUTC(dateStr, timeStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // Calcular el offset de Tijuana según horario de verano
  const tijuanaOffset = getTijuanaOffset(year, month, day);
  
  // Convertir la hora de Tijuana a UTC
  // Si Tijuana está en UTC-7 y son las 11:00, en UTC son las 11:00 + 7 = 18:00
  const utcHours = hours - tijuanaOffset; // -(-7) = +7
  
  // Crear fecha UTC directamente
  const utcDate = new Date(Date.UTC(year, month - 1, day, utcHours, minutes));
  
  // Si la conversión de horas causó un cambio de día, ajustar
  if (utcHours >= 24) {
    // Día siguiente
    const nextDay = new Date(Date.UTC(year, month - 1, day + 1, utcHours - 24, minutes));
    return nextDay.toISOString();
  } else if (utcHours < 0) {
    // Día anterior
    const prevDay = new Date(Date.UTC(year, month - 1, day - 1, utcHours + 24, minutes));
    return prevDay.toISOString();
  }
  
  return utcDate.toISOString();
}

/**
 * Determina el offset de zona horaria de Tijuana para una fecha específica
 * @param {number} year - Año
 * @param {number} month - Mes (1-12)
 * @param {number} day - Día
 * @returns {number} - Offset en horas (negativo para UTC oeste)
 */
function getTijuanaOffset(year, month, day) {
  // Tijuana sigue las reglas de horario de verano del Pacífico (PST/PDT)
  // Horario de verano: segundo domingo de marzo al primer domingo de noviembre
  
  // Calcular segundo domingo de marzo
  const march = new Date(year, 2, 1); // Marzo
  const firstSundayMarch = 7 - march.getDay();
  const secondSundayMarch = firstSundayMarch + 7;
  
  // Calcular primer domingo de noviembre
  const november = new Date(year, 10, 1); // Noviembre
  const firstSundayNovember = 7 - november.getDay();
  
  const currentDate = new Date(year, month - 1, day);
  const dstStart = new Date(year, 2, secondSundayMarch);
  const dstEnd = new Date(year, 10, firstSundayNovember);
  
  // Si estamos en horario de verano (entre segundo domingo de marzo y primer domingo de noviembre)
  if (currentDate >= dstStart && currentDate < dstEnd) {
    return -7; // UTC-7 (PDT)
  } else {
    return -8; // UTC-8 (PST)
  }
}

/**
 * Convierte una fecha UTC a formato local de Tijuana para mostrar
 * @param {string} utcDateStr - Fecha en formato ISO UTC
 * @returns {Object} - Objeto con date y time en formato local
 */
export function convertUTCToTijuanaLocal(utcDateStr) {
  const utcDate = new Date(utcDateStr);
  
  // Obtener los componentes en UTC
  const year = utcDate.getUTCFullYear();
  const month = utcDate.getUTCMonth() + 1;
  const day = utcDate.getUTCDate();
  const hours = utcDate.getUTCHours();
  const minutes = utcDate.getUTCMinutes();
  
  // Obtener el offset de Tijuana para esta fecha UTC
  const tijuanaOffset = getTijuanaOffset(year, month, day);
  
  // Convertir UTC a hora de Tijuana
  // Si UTC son las 18:00 y Tijuana está en UTC-7, entonces en Tijuana son las 18:00 - 7 = 11:00
  const tijuanaHours = hours + tijuanaOffset; // + (-7) = -7
  
  // Manejar cambios de día
  let finalYear = year;
  let finalMonth = month;
  let finalDay = day;
  let finalHours = tijuanaHours;
  
  if (tijuanaHours >= 24) {
    // Día siguiente
    finalHours = tijuanaHours - 24;
    const nextDay = new Date(Date.UTC(year, month - 1, day + 1));
    finalYear = nextDay.getUTCFullYear();
    finalMonth = nextDay.getUTCMonth() + 1;
    finalDay = nextDay.getUTCDate();
  } else if (tijuanaHours < 0) {
    // Día anterior
    finalHours = tijuanaHours + 24;
    const prevDay = new Date(Date.UTC(year, month - 1, day - 1));
    finalYear = prevDay.getUTCFullYear();
    finalMonth = prevDay.getUTCMonth() + 1;
    finalDay = prevDay.getUTCDate();
  }
  
  // Formatear para inputs HTML
  const dateStr = finalYear + '-' + 
                  String(finalMonth).padStart(2, '0') + '-' + 
                  String(finalDay).padStart(2, '0');
  
  const timeStr = String(finalHours).padStart(2, '0') + ':' + 
                  String(minutes).padStart(2, '0');
  
  return { date: dateStr, time: timeStr };
} 