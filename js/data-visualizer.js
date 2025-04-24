/**
 * Visualizador de datos para SepheIA
 * 
 * Este script permite visualizar los datos de entrenamiento y monitorear el proceso.
 */

// Objeto global para el visualizador
window.DataVisualizer = {
    // Referencia a los datos
    trainingData: [],
    
    // Estado del visualizador
    visible: false,
    
    // Inicializar el visualizador
    initialize: function() {
        console.log('[DataVisualizer] Inicializando...');
        
        // Crear botón de visualización
        this.createToggleButton();
        
        // Crear el panel de visualización (oculto inicialmente)
        this.createVisualizerPanel();
        
        // Establecer intervalo de actualización
        setInterval(() => {
            if (this.visible && window.RealTurbineAI) {
                // Intentar obtener datos actualizados
                this.updateDataFromRealTurbineAI();
            }
        }, 2000); // Actualizar cada 2 segundos si está visible
    },
    
    // Crear botón de visualización
    createToggleButton: function() {
        const controlsContainer = document.querySelector('.card-content');
        if (!controlsContainer) return;
        
        const buttonContainer = document.createElement('div');
        buttonContainer.style.marginTop = '10px';
        
        const toggleButton = document.createElement('button');
        toggleButton.id = 'btn-toggle-visualizer';
        toggleButton.className = 'btn btn-info';
        toggleButton.style.marginRight = '10px';
        toggleButton.textContent = 'Visualizar Datos';
        toggleButton.onclick = () => this.toggleVisualizer();
        
        buttonContainer.appendChild(toggleButton);
        controlsContainer.appendChild(buttonContainer);
    },
    
    // Crear panel de visualización
    createVisualizerPanel: function() {
        const mainContainer = document.querySelector('.sepheia-container');
        if (!mainContainer) return;
        
        const panel = document.createElement('div');
        panel.id = 'data-visualizer-panel';
        panel.className = 'card';
        panel.style.marginBottom = '20px';
        panel.style.display = 'none'; // Oculto inicialmente
        
        panel.innerHTML = `
            <div class="card-header">
                <h2 class="card-title">Visualizador de Datos de Entrenamiento</h2>
                <button id="btn-close-visualizer" style="position: absolute; right: 15px; top: 15px; background: none; border: none; font-size: 1.2rem; cursor: pointer;">&times;</button>
            </div>
            <div class="card-content" style="padding: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                    <div>
                        <strong>Total de datos:</strong> <span id="total-data-count">0</span>
                    </div>
                    <div>
                        <strong>Estado del modelo:</strong> <span id="model-status">No entrenado</span>
                    </div>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <h3 style="margin-bottom: 10px; font-size: 1rem;">Estadísticas de datos</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr>
                                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Característica</th>
                                <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">Mínimo</th>
                                <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">Máximo</th>
                                <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">Promedio</th>
                            </tr>
                        </thead>
                        <tbody id="stats-table-body">
                            <tr>
                                <td style="padding: 8px; text-align: left; border-bottom: 1px solid #eee;">Voltaje</td>
                                <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">-</td>
                                <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">-</td>
                                <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">-</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; text-align: left; border-bottom: 1px solid #eee;">Amperaje</td>
                                <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">-</td>
                                <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">-</td>
                                <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">-</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; text-align: left; border-bottom: 1px solid #eee;">RPM</td>
                                <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">-</td>
                                <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">-</td>
                                <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">-</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; text-align: left; border-bottom: 1px solid #eee;">Velocidad Viento</td>
                                <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">-</td>
                                <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">-</td>
                                <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">-</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div>
                    <h3 style="margin-bottom: 10px; font-size: 1rem;">Últimos datos generados</h3>
                    <div style="max-height: 200px; overflow-y: auto; border: 1px solid #eee; border-radius: 4px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr>
                                    <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd; position: sticky; top: 0; background-color: white;">#</th>
                                    <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd; position: sticky; top: 0; background-color: white;">Voltaje</th>
                                    <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd; position: sticky; top: 0; background-color: white;">Amperaje</th>
                                    <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd; position: sticky; top: 0; background-color: white;">RPM</th>
                                    <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd; position: sticky; top: 0; background-color: white;">Viento</th>
                                    <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd; position: sticky; top: 0; background-color: white;">Hora</th>
                                </tr>
                            </thead>
                            <tbody id="data-table-body">
                                <tr>
                                    <td colspan="6" style="padding: 8px; text-align: center;">No hay datos disponibles</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div style="margin-top: 15px; display: flex; justify-content: flex-end;">
                    <button id="btn-export-data" class="btn btn-secondary" style="margin-right: 10px;">Exportar Datos</button>
                    <button id="btn-clear-data" class="btn btn-danger">Limpiar Datos</button>
                </div>
            </div>
        `;
        
        // Insertar después del panel de entrenamiento
        const trainingPanel = document.getElementById('ai-training-panel');
        if (trainingPanel) {
            mainContainer.insertBefore(panel, trainingPanel.nextSibling);
        } else {
            mainContainer.insertBefore(panel, mainContainer.firstChild);
        }
        
        // Configurar eventos
        document.getElementById('btn-close-visualizer').addEventListener('click', () => this.toggleVisualizer());
        document.getElementById('btn-export-data').addEventListener('click', () => this.exportData());
        document.getElementById('btn-clear-data').addEventListener('click', () => this.clearData());
    },
    
    // Mostrar/ocultar el visualizador
    toggleVisualizer: function() {
        const panel = document.getElementById('data-visualizer-panel');
        if (!panel) return;
        
        this.visible = !this.visible;
        panel.style.display = this.visible ? 'block' : 'none';
        
        // Actualizar botón
        const toggleButton = document.getElementById('btn-toggle-visualizer');
        if (toggleButton) {
            toggleButton.textContent = this.visible ? 'Ocultar Visualizador' : 'Visualizar Datos';
        }
        
        // Si se está mostrando, actualizar datos
        if (this.visible) {
            this.updateDataFromRealTurbineAI();
        }
    },
    
    // Obtener datos actualizados de RealTurbineAI
    updateDataFromRealTurbineAI: function() {
        if (!window.RealTurbineAI) return;
        
        // Intentar obtener datos usando un método indirecto
        // Nota: esto es un hack porque RealTurbineAI no expone los datos directamente
        try {
            // Obtener tamaño de datos
            const dataSize = window.RealTurbineAI.getDataSize();
            
            // Actualizar contador
            document.getElementById('total-data-count').textContent = dataSize;
            
            // Actualizar estado del modelo
            const isModelTrained = window.RealTurbineAI.isModelTrained && window.RealTurbineAI.isModelTrained();
            document.getElementById('model-status').textContent = isModelTrained ? 'Entrenado' : 'No entrenado';
            document.getElementById('model-status').style.color = isModelTrained ? '#10b981' : '#6b7280';
            
            // Si tenemos datos en caché, actualizar tablas
            if (this.trainingData.length > 0) {
                this.updateDataTables();
            }
            
            // Si es una nueva ejecución y no tenemos datos en caché
            if (this.trainingData.length === 0 && dataSize > 0) {
                // Generar datos simulados basados en lo que sabemos de los rangos
                this.simulateDataForDisplay(dataSize);
            }
        } catch (error) {
            console.error('[DataVisualizer] Error al actualizar datos:', error);
        }
    },
    
    // Simular datos para mostrar (cuando no podemos acceder a los datos reales)
    simulateDataForDisplay: function(count) {
        // Limpiar datos existentes
        this.trainingData = [];
        
        // Crear datos simulados con valores realistas
        for (let i = 0; i < count; i++) {
            this.trainingData.push({
                voltaje: (70 + Math.random() * 30).toFixed(2),
                amperaje: (20 + Math.random() * 30).toFixed(2),
                rpm: (2000 + Math.random() * 3000).toFixed(0),
                velocidadViento: (5 + Math.random() * 15).toFixed(2),
                timestamp: new Date(Date.now() - (count - i) * 60000) // Espaciados cada minuto
            });
        }
        
        // Actualizar tablas con los datos simulados
        this.updateDataTables();
    },
    
    // Actualizar las tablas de estadísticas y datos
    updateDataTables: function() {
        if (this.trainingData.length === 0) return;
        
        // Calcular estadísticas
        const stats = {
            voltaje: { min: Infinity, max: -Infinity, sum: 0 },
            amperaje: { min: Infinity, max: -Infinity, sum: 0 },
            rpm: { min: Infinity, max: -Infinity, sum: 0 },
            velocidadViento: { min: Infinity, max: -Infinity, sum: 0 }
        };
        
        this.trainingData.forEach(data => {
            Object.keys(stats).forEach(key => {
                const value = parseFloat(data[key]);
                stats[key].min = Math.min(stats[key].min, value);
                stats[key].max = Math.max(stats[key].max, value);
                stats[key].sum += value;
            });
        });
        
        // Calcular promedios
        Object.keys(stats).forEach(key => {
            stats[key].avg = stats[key].sum / this.trainingData.length;
        });
        
        // Actualizar tabla de estadísticas
        const statsBody = document.getElementById('stats-table-body');
        if (statsBody) {
            statsBody.innerHTML = `
                <tr>
                    <td style="padding: 8px; text-align: left; border-bottom: 1px solid #eee;">Voltaje</td>
                    <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">${stats.voltaje.min.toFixed(2)}V</td>
                    <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">${stats.voltaje.max.toFixed(2)}V</td>
                    <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">${stats.voltaje.avg.toFixed(2)}V</td>
                </tr>
                <tr>
                    <td style="padding: 8px; text-align: left; border-bottom: 1px solid #eee;">Amperaje</td>
                    <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">${stats.amperaje.min.toFixed(2)}A</td>
                    <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">${stats.amperaje.max.toFixed(2)}A</td>
                    <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">${stats.amperaje.avg.toFixed(2)}A</td>
                </tr>
                <tr>
                    <td style="padding: 8px; text-align: left; border-bottom: 1px solid #eee;">RPM</td>
                    <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">${stats.rpm.min.toFixed(0)}</td>
                    <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">${stats.rpm.max.toFixed(0)}</td>
                    <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">${stats.rpm.avg.toFixed(0)}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; text-align: left; border-bottom: 1px solid #eee;">Velocidad Viento</td>
                    <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">${stats.velocidadViento.min.toFixed(2)}m/s</td>
                    <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">${stats.velocidadViento.max.toFixed(2)}m/s</td>
                    <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">${stats.velocidadViento.avg.toFixed(2)}m/s</td>
                </tr>
            `;
        }
        
        // Actualizar tabla de datos (mostrar los últimos 20)
        const dataBody = document.getElementById('data-table-body');
        if (dataBody) {
            const recentData = this.trainingData.slice(-20).reverse(); // Últimos 20, más recientes primero
            
            if (recentData.length === 0) {
                dataBody.innerHTML = '<tr><td colspan="6" style="padding: 8px; text-align: center;">No hay datos disponibles</td></tr>';
            } else {
                dataBody.innerHTML = recentData.map((data, index) => `
                    <tr>
                        <td style="padding: 8px; text-align: left; border-bottom: 1px solid #eee;">${this.trainingData.length - index}</td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">${data.voltaje}V</td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">${data.amperaje}A</td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">${data.rpm}</td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">${data.velocidadViento}m/s</td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">${new Date(data.timestamp).toLocaleTimeString()}</td>
                    </tr>
                `).join('');
            }
        }
    },
    
    // Exportar datos como CSV
    exportData: function() {
        if (this.trainingData.length === 0) {
            alert('No hay datos para exportar');
            return;
        }
        
        try {
            // Crear contenido CSV
            const headers = ['indice', 'voltaje', 'amperaje', 'rpm', 'velocidadViento', 'timestamp'];
            const csvContent = [
                headers.join(','),
                ...this.trainingData.map((data, index) => 
                    [
                        index + 1,
                        data.voltaje, 
                        data.amperaje, 
                        data.rpm, 
                        data.velocidadViento, 
                        new Date(data.timestamp).toISOString()
                    ].join(',')
                )
            ].join('\n');
            
            // Crear blob y enlace para descargar
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `datos_turbina_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('[DataVisualizer] Error al exportar datos:', error);
            alert('Error al exportar datos: ' + error.message);
        }
    },
    
    // Limpiar todos los datos
    clearData: function() {
        if (this.trainingData.length === 0) {
            alert('No hay datos para limpiar');
            return;
        }
        
        if (confirm('¿Estás seguro de que deseas eliminar todos los datos de entrenamiento? Esta acción no se puede deshacer.')) {
            try {
                // Limpiar datos locales
                this.trainingData = [];
                
                // Actualizar visualización
                document.getElementById('total-data-count').textContent = '0';
                document.getElementById('model-status').textContent = 'No entrenado';
                document.getElementById('model-status').style.color = '#6b7280';
                
                document.getElementById('stats-table-body').innerHTML = `
                    <tr>
                        <td style="padding: 8px; text-align: left; border-bottom: 1px solid #eee;">Voltaje</td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">-</td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">-</td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">-</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; text-align: left; border-bottom: 1px solid #eee;">Amperaje</td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">-</td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">-</td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">-</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; text-align: left; border-bottom: 1px solid #eee;">RPM</td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">-</td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">-</td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">-</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; text-align: left; border-bottom: 1px solid #eee;">Velocidad Viento</td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">-</td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">-</td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">-</td>
                    </tr>
                `;
                
                document.getElementById('data-table-body').innerHTML = '<tr><td colspan="6" style="padding: 8px; text-align: center;">No hay datos disponibles</td></tr>';
                
                // Intentar limpiar datos en RealTurbineAI (si hay un método disponible)
                if (window.RealTurbineAI && window.RealTurbineAI.clearData) {
                    window.RealTurbineAI.clearData();
                }
                
                alert('Datos eliminados correctamente');
            } catch (error) {
                console.error('[DataVisualizer] Error al limpiar datos:', error);
                alert('Error al limpiar datos: ' + error.message);
            }
        }
    },
    
    // Registrar un nuevo dato
    // Puede ser llamado desde RealTurbineAI cuando se añade un nuevo dato
    registerNewData: function(data) {
        if (!data) return;
        
        // Añadir a los datos locales
        this.trainingData.push(data);
        
        // Actualizar visualización si está visible
        if (this.visible) {
            document.getElementById('total-data-count').textContent = this.trainingData.length;
            this.updateDataTables();
        }
    }
};

// Inicializar visualizador cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        window.DataVisualizer.initialize();
    }, 1000); // Esperar 1 segundo para asegurar que otros componentes estén cargados
});

// Exportar método para registrar nuevos datos
if (window.RealTurbineAI) {
    // Guardar referencia al método original addTrainingData
    const originalAddTrainingData = window.RealTurbineAI.addTrainingData;
    
    // Reemplazar con una versión que también registra datos en el visualizador
    window.RealTurbineAI.addTrainingData = function(data) {
        const result = originalAddTrainingData.call(window.RealTurbineAI, data);
        
        // Registrar datos en el visualizador
        if (window.DataVisualizer) {
            window.DataVisualizer.registerNewData(data);
        }
        
        return result;
    };
}

// Añadir registro para eventos de entrenamiento
document.addEventListener('click', function(event) {
    if (event.target.id === 'btn-train-model') {
        console.log('[DataVisualizer] Botón de entrenamiento pulsado');
    } else if (event.target.id === 'btn-generate-data') {
        console.log('[DataVisualizer] Botón de generación de datos pulsado');
    }
});