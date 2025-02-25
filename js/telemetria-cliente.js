// Función para obtener hora actual
function obtenerHoraActual() {
    const ahora = new Date();
    return ahora.toLocaleString();
}

// Función para generar datos aleatorios de sensores
function generarDatosSensores() {
    return {
        voltaje: (Math.random() * 100).toFixed(2),
        amperaje: (Math.random() * 50).toFixed(2),
        rpm: (Math.random() * 5000).toFixed(0),
        velocidadViento: (Math.random() * 25).toFixed(2),
        hora: obtenerHoraActual()
    };
}

// Función para actualizar los valores en tiempo real
function actualizarTelemetria() {
    const datos = generarDatosSensores();
    
    // Actualizar valores en el dashboard
    document.getElementById("voltaje-value").textContent = datos.voltaje + " V";
    document.getElementById("amperaje-value").textContent = datos.amperaje + " A";
    document.getElementById("rpm-value").textContent = datos.rpm + " RPM";
    document.getElementById("viento-value").textContent = datos.velocidadViento + " m/s";
    
    // Agregar al historial
    agregarAlHistorial(datos);
}

// Función para agregar datos al historial
function agregarAlHistorial(datos) {
    const tabla = document.getElementById("telemetria-table-body");
    const fila = document.createElement("tr");
    
    fila.innerHTML = `
        <td>${datos.voltaje} V</td>
        <td>${datos.amperaje} A</td>
        <td>${datos.rpm} RPM</td>
        <td>${datos.velocidadViento} m/s</td>
        <td>${datos.hora}</td>
    `;
    
    // Agregar al principio de la tabla
    tabla.insertBefore(fila, tabla.firstChild);
    
    // Limitar a 10 filas
    if (tabla.children.length > 10) {
        tabla.removeChild(tabla.lastChild);
    }
}

// Iniciar telemetría cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si estamos en la página de telemetría
    if (document.getElementById('telemetria-container')) {
        // Actualizar datos cada 2 segundos
        setInterval(actualizarTelemetria, 2000);
        
        // Primera actualización inmediata
        actualizarTelemetria();
    }
});