// Script de diagnóstico para SepheIA
console.log('--------------------------------');
console.log('Diagnóstico de SepheIA');
console.log('--------------------------------');
console.log('Timestamp:', new Date().toISOString());
console.log('TurbineAI disponible:', !!window.TurbineAI);
console.log('firebase disponible:', typeof firebase !== 'undefined');
console.log('firebase.auth disponible:', firebase && typeof firebase.auth !== 'undefined');
console.log('firebase.firestore disponible:', firebase && typeof firebase.firestore !== 'undefined');

// Verificar si el script de turbina se cargó
const turbineScript = document.querySelector('script[src*="ai-turbine-analysis.js"]');
if (turbineScript) {
    console.log('Script ai-turbine-analysis.js encontrado en el DOM');
    console.log('Estado del script:', turbineScript.readyState || 'no disponible');
    console.log('URL del script:', turbineScript.src);
} else {
    console.log('Script ai-turbine-analysis.js NO encontrado en el DOM');
}

// Verificar eventos personalizados
let eventReceived = false;
window.addEventListener('turbineAIReady', () => {
    eventReceived = true;
    console.log('Evento turbineAIReady recibido');
});

// Verificar después de un pequeño delay
setTimeout(() => {
    console.log('--- Después de 1 segundo ---');
    console.log('TurbineAI disponible:', !!window.TurbineAI);
    console.log('Evento turbineAIReady recibido:', eventReceived);
    console.log('-----------------------------');
}, 1000);

// Escuchar errores globales
window.addEventListener('error', function(event) {
    console.error('Error global detectado:');
    console.error('Mensaje:', event.message);
    console.error('Archivo:', event.filename);
    console.error('Línea:', event.lineno);
    console.error('Columna:', event.colno);
});

// Verificar carga completa de la página
window.addEventListener('load', function() {
    console.log('Evento window.load ejecutado');
    console.log('TurbineAI disponible en load:', !!window.TurbineAI);
});

console.log('Script de diagnóstico cargado correctamente');