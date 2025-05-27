/**
 * Utilidades de validación para el sistema
 */

/**
 * Normaliza una cadena de texto para comparación
 * @param {string} str - La cadena a normalizar
 * @returns {string} - La cadena normalizada
 */
export const normalizeString = (str) => {
  if (!str) return '';
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
};

/**
 * Verifica si dos pacientes tienen los mismos datos exactos
 * @param {object} patient1 - Primer paciente
 * @param {object} patient2 - Segundo paciente
 * @returns {boolean} - True si son exactamente iguales
 */
export const arePatientDataEqual = (patient1, patient2) => {
  if (!patient1 || !patient2) return false;
  
  const name1 = normalizeString(patient1.name);
  const name2 = normalizeString(patient2.name);
  
  const contact1 = patient1.contact_info ? normalizeString(patient1.contact_info) : null;
  const contact2 = patient2.contact_info ? normalizeString(patient2.contact_info) : null;
  
  const dob1 = patient1.date_of_birth || null;
  const dob2 = patient2.date_of_birth || null;
  
  return name1 === name2 && 
         contact1 === contact2 && 
         dob1 === dob2;
};

/**
 * Busca pacientes duplicados en una lista
 * @param {object} patientData - Datos del paciente a verificar
 * @param {Array} patientList - Lista de pacientes existentes
 * @param {number} excludeId - ID a excluir de la búsqueda (para ediciones)
 * @returns {object|null} - Paciente duplicado encontrado o null
 */
export const findDuplicatePatient = (patientData, patientList, excludeId = null) => {
  if (!patientData || !patientList) return null;
  
  return patientList.find(patient => {
    if (excludeId && patient.id === excludeId) return false;
    return arePatientDataEqual(patientData, patient);
  }) || null;
};

/**
 * Valida los datos de un paciente
 * @param {object} patientData - Datos del paciente
 * @returns {object} - Objeto con isValid y errores
 */
export const validatePatientData = (patientData) => {
  const errors = {};
  
  if (!patientData.name || !patientData.name.trim()) {
    errors.name = 'El nombre es requerido';
  } else if (patientData.name.trim().length < 2) {
    errors.name = 'El nombre debe tener al menos 2 caracteres';
  }
  
  if (patientData.contact_info && patientData.contact_info.length > 0) {
    const contactInfo = patientData.contact_info.trim();
    // Validación básica de email o teléfono
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{7,}$/;
    
    if (!emailRegex.test(contactInfo) && !phoneRegex.test(contactInfo)) {
      errors.contact_info = 'Debe ser un email válido o un número de teléfono válido';
    }
  }
  
  if (patientData.date_of_birth) {
    const birthDate = new Date(patientData.date_of_birth);
    const today = new Date();
    
    if (birthDate > today) {
      errors.date_of_birth = 'La fecha de nacimiento no puede ser futura';
    }
    
    const maxAge = 120;
    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - maxAge);
    
    if (birthDate < minDate) {
      errors.date_of_birth = `La fecha de nacimiento no puede ser anterior a ${maxAge} años`;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}; 