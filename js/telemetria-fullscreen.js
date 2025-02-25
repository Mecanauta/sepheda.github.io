// Funcionalidad para pantalla completa
document.addEventListener('DOMContentLoaded', function() {
    const btnFullscreen = document.getElementById('btn-telemetria-fullscreen');
    const telemetriaContainer = document.getElementById('telemetria-container');
    
    if (btnFullscreen && telemetriaContainer) {
        btnFullscreen.addEventListener('click', function() {
            // Crear un clon del contenedor para modo pantalla completa
            const fullscreenContainer = telemetriaContainer.cloneNode(true);
            fullscreenContainer.classList.add('telemetria-fullscreen');
            
            // Cambiar el botón por uno de cerrar
            const header = fullscreenContainer.querySelector('.card-header');
            header.innerHTML = `
                <h2 class="card-title">Telemetría en Tiempo Real</h2>
                <button class="btn-close-fullscreen" id="btn-close-fullscreen">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            `;
            
            // Añadir a la página
            document.body.appendChild(fullscreenContainer);
            document.body.style.overflow = 'hidden'; // Evitar scroll
            
            // Actualizar IDs para evitar duplicados
            const newVoltageTxt = fullscreenContainer.querySelector('#voltaje-value');
            newVoltageTxt.id = 'voltaje-value-fs';
            
            const newAmperajeTxt = fullscreenContainer.querySelector('#amperaje-value');
            newAmperajeTxt.id = 'amperaje-value-fs';
            
            const newRpmTxt = fullscreenContainer.querySelector('#rpm-value');
            newRpmTxt.id = 'rpm-value-fs';
            
            const newVientoTxt = fullscreenContainer.querySelector('#viento-value');
            newVientoTxt.id = 'viento-value-fs';
            
            const newTableBody = fullscreenContainer.querySelector('#telemetria-table-body');
            newTableBody.id = 'telemetria-table-body-fs';
            
            // Función para actualizar también los valores en pantalla completa
            const oldUpdateTelemetria = window.actualizarTelemetria;
            window.actualizarTelemetria = function() {
                // Ejecutar la función original
                oldUpdateTelemetria();
                
                // Si existe el modo pantalla completa, actualizar también esos valores
                if (document.getElementById('voltaje-value-fs')) {
                    const datos = generarDatosSensores(); // Reutilizar la misma función
                    
                    document.getElementById('voltaje-value-fs').textContent = datos.voltaje + " V";
                    document.getElementById('amperaje-value-fs').textContent = datos.amperaje + " A";
                    document.getElementById('rpm-value-fs').textContent = datos.rpm + " RPM";
                    document.getElementById('viento-value-fs').textContent = datos.velocidadViento + " m/s";
                    
                    // Actualizar también la tabla de historial
                    const tabla = document.getElementById('telemetria-table-body-fs');
                    const fila = document.createElement("tr");
                    
                    fila.innerHTML = `
                        <td>${datos.voltaje} V</td>
                        <td>${datos.amperaje} A</td>
                        <td>${datos.rpm} RPM</td>
                        <td>${datos.velocidadViento} m/s</td>
                        <td>${datos.hora}</td>
                    `;
                    
                    tabla.insertBefore(fila, tabla.firstChild);
                    
                    if (tabla.children.length > 10) {
                        tabla.removeChild(tabla.lastChild);
                    }
                }
            };
            
            // Configurar evento para cerrar la pantalla completa
            document.getElementById('btn-close-fullscreen').addEventListener('click', function() {
                // Restaurar función original
                window.actualizarTelemetria = oldUpdateTelemetria;
                
                // Eliminar el contenedor de pantalla completa
                document.body.removeChild(fullscreenContainer);
                document.body.style.overflow = ''; // Restaurar scroll
            });
        });
    }
});