// Script de diagnóstico detallado para el problema de citas no visibles
console.log('🔍 Iniciando diagnóstico detallado de citas...');

// 1. Verificar si Vue está cargado
if (typeof window.Vue !== 'undefined') {
    console.log('✅ Vue está disponible');
} else {
    console.log('❌ Vue no está disponible');
}

// 2. Verificar si la aplicación Vue está montada
const app = document.getElementById('app');
if (app) {
    console.log('✅ Elemento #app encontrado');
    console.log('📊 Contenido del app:', app.innerHTML.length > 0 ? 'Tiene contenido' : 'Vacío');
} else {
    console.log('❌ Elemento #app no encontrado');
}

// 3. Verificar si hay errores en la consola
const originalError = console.error;
const errors = [];
console.error = function(...args) {
    errors.push(args);
    originalError.apply(console, args);
};

// 4. Verificar localStorage para token de autenticación
const token = localStorage.getItem('auth_token');
console.log('🔑 Token de autenticación:', token ? 'Presente' : 'Ausente');

// 5. Verificar si hay datos en el store de Pinia (si está disponible)
setTimeout(() => {
    try {
        // Intentar acceder al store de appointments
        const appointmentsStore = window.__PINIA_STORES__?.appointments;
        if (appointmentsStore) {
            console.log('📦 Store de appointments encontrado');
            console.log('📊 Datos del store:', {
                appointments: appointmentsStore.appointments?.length || 0,
                loading: appointmentsStore.loading,
                error: appointmentsStore.currentError
            });
        } else {
            console.log('❌ Store de appointments no encontrado');
        }
    } catch (e) {
        console.log('❌ Error accediendo al store:', e.message);
    }
}, 2000);

// 6. Verificar elementos DOM relacionados con citas
setTimeout(() => {
    const appointmentCards = document.querySelectorAll('[class*="appointment"]');
    console.log('🃏 Tarjetas de citas encontradas:', appointmentCards.length);
    
    const appointmentElements = document.querySelectorAll('[class*="cita"]');
    console.log('🃏 Elementos con "cita" en clase:', appointmentElements.length);
    
    // Verificar si hay elementos ocultos
    const hiddenElements = document.querySelectorAll('[style*="display: none"], [style*="visibility: hidden"]');
    console.log('👻 Elementos ocultos:', hiddenElements.length);
    
    // Verificar elementos con opacity 0
    const transparentElements = document.querySelectorAll('[style*="opacity: 0"]');
    console.log('👻 Elementos transparentes:', transparentElements.length);
    
}, 3000);

// 7. Verificar llamadas a la API
const originalFetch = window.fetch;
const apiCalls = [];
window.fetch = function(...args) {
    const url = args[0];
    if (typeof url === 'string' && url.includes('appointments')) {
        apiCalls.push({
            url,
            timestamp: new Date().toISOString()
        });
        console.log('🌐 Llamada a API de citas:', url);
    }
    return originalFetch.apply(this, args);
};

// 8. Verificar errores de red
setTimeout(() => {
    console.log('📊 Resumen de diagnóstico:');
    console.log('- Errores capturados:', errors.length);
    console.log('- Llamadas a API de citas:', apiCalls.length);
    
    if (errors.length > 0) {
        console.log('❌ Errores encontrados:');
        errors.forEach((error, index) => {
            console.log(`  ${index + 1}.`, error);
        });
    }
    
    if (apiCalls.length > 0) {
        console.log('🌐 Llamadas a API realizadas:');
        apiCalls.forEach((call, index) => {
            console.log(`  ${index + 1}.`, call);
        });
    }
}, 5000);

// 9. Función para probar manualmente la API
window.testAppointmentsAPI = async function() {
    console.log('🧪 Probando API de citas manualmente...');
    
    const token = localStorage.getItem('auth_token');
    if (!token) {
        console.log('❌ No hay token de autenticación');
        return;
    }
    
    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`http://127.0.0.1:5000/api/v1/appointments?date=${today}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📡 Respuesta de la API:', response.status, response.statusText);
        
        if (response.ok) {
            const data = await response.json();
            console.log('📊 Datos recibidos:', data);
            console.log('📊 Número de citas:', data.length);
            
            if (data.length > 0) {
                console.log('📋 Primera cita:', data[0]);
            }
        } else {
            const errorData = await response.text();
            console.log('❌ Error de la API:', errorData);
        }
    } catch (error) {
        console.log('❌ Error de red:', error.message);
    }
};

console.log('🔍 Diagnóstico iniciado. Usa testAppointmentsAPI() para probar la API manualmente.'); 