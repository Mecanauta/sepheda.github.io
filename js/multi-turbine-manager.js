/**
 * Sistema de Gestión de Múltiples Turbinas
 * 
 * Este módulo gestiona múltiples turbinas, genera datos simulados para cada una
 * y permite que la IA se entrene con datos de todas las turbinas.
 */

window.MultiTurbineManager = (function() {
    // Configuración de turbinas de prueba
    const TURBINE_MODELS = {
        'LIAM-F1': {
            idealEfficiency: 0.85,
            powerCurve: [
                { windSpeed: 2, power: 0.1 },
                { windSpeed: 5, power: 0.5 },
                { windSpeed: 8, power: 1.0 },
                { windSpeed: 12, power: 1.5 },
                { windSpeed: 15, power: 1.5 },
            ],
            voltageRange: [65, 95],
            amperageRange: [15, 45],
            rpmMultiplier: 300
        },
        'LIAM-F2': {
            idealEfficiency: 0.88,
            powerCurve: [
                { windSpeed: 2, power: 0.15 },
                { windSpeed: 5, power: 0.6 },
                { windSpeed: 8, power: 1.2 },
                { windSpeed: 12, power: 1.8 },
                { windSpeed: 15, power: 1.8 },
            ],
            voltageRange: [70, 100],
            amperageRange: [18, 50],
            rpmMultiplier: 320
        },
        'WindTech-500': {
            idealEfficiency: 0.83,
            powerCurve: [
                { windSpeed: 2, power: 0.08 },
                { windSpeed: 5, power: 0.4 },
                { windSpeed: 8, power: 0.8 },
                { windSpeed: 12, power: 1.2 },
                { windSpeed: 15, power: 1.2 },
            ],
            voltageRange: [60, 85],
            amperageRange: [12, 40],
            rpmMultiplier: 280
        },
        'EcoWind-Pro': {
            idealEfficiency: 0.90,
            powerCurve: [
                { windSpeed: 2, power: 0.2 },
                { windSpeed: 5, power: 0.7 },
                { windSpeed: 8, power: 1.4 },
                { windSpeed: 12, power: 2.0 },
                { windSpeed: 15, power: 2.0 },
            ],
            voltageRange: [75, 105],
            amperageRange: [20, 55],
            rpmMultiplier: 340
        }
    };
    
    // Lista de turbinas de prueba
    let testTurbines = [];
    let currentTurbineId = null;
    let dataCollectionActive = false;
    let allTurbineData = {}; // Almacena datos de todas las turbinas
    
    // Inicializar el sistema
    function initialize() {
        console.log('[MultiTurbineManager] Inicializando sistema de múltiples turbinas...');
        
        // Crear turbinas de prueba
        createTestTurbines();
        
        // Configurar interfaz de usuario
        setupTurbineSelector();
        
        // Iniciar recolección de datos automática
        startDataCollection();
        
        return {
            status: 'success',
            message: `Sistema inicializado con ${testTurbines.length} turbinas de prueba`,
            turbines: testTurbines.length
        };
    }
    
    // Crear turbinas de prueba
    function createTestTurbines() {
        const locations = [
            { name: 'Parque Eólico Norte', lat: 4.7110, lng: -74.0721 },
            { name: 'Parque Eólico Sur', lat: 4.5709, lng: -74.2973 },
            { name: 'Parque Eólico Este', lat: 4.8376, lng: -73.9832 },
            { name: 'Parque Eólico Oeste', lat: 4.6097, lng: -74.3643 }
        ];
        
        const models = Object.keys(TURBINE_MODELS);
        
        // Crear turbinas con diferentes modelos y ubicaciones
        models.forEach((model, index) => {
            const turbine = {
                id: `turbine-${index + 1}`,
                model: model,
                location: locations[index],
                installDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 2), // Hasta 2 años atrás
                status: Math.random() > 0.1 ? 'active' : 'maintenance', // 90% activas
                serialNumber: `SN-${model}-${(1000 + index).toString().padStart(4, '0')}`,
                lastMaintenance: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Último mantenimiento en los últimos 90 días
                specifications: TURBINE_MODELS[model],
                // Añadir variación individual a cada turbina (desgaste, optimización, etc.)
                individualFactors: {
                    wearFactor: 0.85 + Math.random() * 0.3, // Entre 85% y 115% de rendimiento
                    maintenanceQuality: 0.9 + Math.random() * 0.2, // Calidad del mantenimiento
                    environmentalFactor: 0.9 + Math.random() * 0.2 // Condiciones ambientales locales
                }
            };
            
            testTurbines.push(turbine);
            allTurbineData[turbine.id] = []; // Inicializar array de datos para cada turbina
        });
        
        // Seleccionar la primera turbina como actual
        if (testTurbines.length > 0) {
            currentTurbineId = testTurbines[0].id;
        }
        
        console.log(`[MultiTurbineManager] Creadas ${testTurbines.length} turbinas de prueba`);
    }
    
    // Configurar selector de turbinas en la interfaz
    function setupTurbineSelector() {
        // Buscar el contenedor del asistente de IA
        const aiContainer = document.getElementById('ai-assistant-container');
        if (!aiContainer) return;
        
        // Crear selector si no existe
        if (!document.getElementById('turbine-selector')) {
            const selectorHTML = `
                <div id="turbine-selector" class="turbine-selector" style="margin-bottom: 20px; padding: 15px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <h3 style="margin: 0 0 10px 0; font-size: 1.1rem; color: #2d3748;">Seleccionar Turbina</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                        ${testTurbines.map(turbine => `
                            <button 
                                id="turbine-btn-${turbine.id}" 
                                class="turbine-btn ${turbine.id === currentTurbineId ? 'active' : ''}"
                                data-turbine-id="${turbine.id}"
                                style="padding: 8px 12px; border: 1px solid #cbd5e0; border-radius: 6px; background-color: ${turbine.id === currentTurbineId ? '#3182ce' : 'white'}; color: ${turbine.id === currentTurbineId ? 'white' : '#2d3748'}; cursor: pointer; transition: all 0.2s; font-size: 0.9rem;"
                                onmouseover="this.style.backgroundColor='${turbine.id === currentTurbineId ? '#2c5282' : '#f7fafc'}'"
                                onmouseout="this.style.backgroundColor='${turbine.id === currentTurbineId ? '#3182ce' : 'white'}'"
                            >
                                ${turbine.model}<br>
                                <small style="opacity: 0.8;">${turbine.location.name}</small>
                            </button>
                        `).join('')}
                    </div>
                    <div id="turbine-info" style="margin-top: 15px; padding: 10px; background-color: white; border-radius: 4px; border-left: 4px solid #3182ce;">
                        <!-- La información de la turbina seleccionada se mostrará aquí -->
                    </div>
                </div>
            `;
            
            // Insertar antes del contenido del asistente
            aiContainer.insertAdjacentHTML('afterbegin', selectorHTML);
            
            // Configurar eventos de los botones
            testTurbines.forEach(turbine => {
                const btn = document.getElementById(`turbine-btn-${turbine.id}`);
                if (btn) {
                    btn.addEventListener('click', () => selectTurbine(turbine.id));
                }
            });
            
            // Mostrar información de la turbina actual
            updateTurbineInfo();
        }
    }
    
    // Seleccionar una turbina específica
    function selectTurbine(turbineId) {
        const oldTurbineBtn = document.querySelector('.turbine-btn.active');
        if (oldTurbineBtn) {
            oldTurbineBtn.classList.remove('active');
            oldTurbineBtn.style.backgroundColor = 'white';
            oldTurbineBtn.style.color = '#2d3748';
        }
        
        currentTurbineId = turbineId;
        
        const newTurbineBtn = document.getElementById(`turbine-btn-${turbineId}`);
        if (newTurbineBtn) {
            newTurbineBtn.classList.add('active');
            newTurbineBtn.style.backgroundColor = '#3182ce';
            newTurbineBtn.style.color = 'white';
        }
        
        updateTurbineInfo();
        
        // Notificar a otros sistemas del cambio
        console.log(`[MultiTurbineManager] Turbina cambiada a: ${turbineId}`);
        
        // Disparar evento personalizado
        const event = new CustomEvent('turbineChanged', { 
            detail: { 
                turbineId: turbineId,
                turbine: getCurrentTurbine()
            } 
        });
        window.dispatchEvent(event);
    }
    
    // Actualizar información de la turbina seleccionada
    function updateTurbineInfo() {
        const infoDiv = document.getElementById('turbine-info');
        if (!infoDiv) return;
        
        const turbine = getCurrentTurbine();
        if (!turbine) return;
        
        const dataCount = allTurbineData[turbine.id] ? allTurbineData[turbine.id].length : 0;
        const statusColor = turbine.status === 'active' ? '#48bb78' : '#ed8936';
        
        infoDiv.innerHTML = `
            <h4 style="margin: 0 0 10px 0; color: #2d3748;">${turbine.model} - ${turbine.serialNumber}</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; font-size: 0.9rem;">
                <div><strong>Ubicación:</strong> ${turbine.location.name}</div>
                <div><strong>Estado:</strong> <span style="color: ${statusColor};">${turbine.status === 'active' ? 'Activa' : 'Mantenimiento'}</span></div>
                <div><strong>Datos recopilados:</strong> ${dataCount} puntos</div>
                <div><strong>Instalación:</strong> ${turbine.installDate.toLocaleDateString('es-ES')}</div>
                <div><strong>Último mantenimiento:</strong> ${turbine.lastMaintenance.toLocaleDateString('es-ES')}</div>
                <div><strong>Eficiencia ideal:</strong> ${(turbine.specifications.idealEfficiency * 100).toFixed(1)}%</div>
            </div>
        `;
    }
    
    // Obtener la turbina actualmente seleccionada
    function getCurrentTurbine() {
        return testTurbines.find(t => t.id === currentTurbineId);
    }
    
    // Iniciar recolección de datos automática
    function startDataCollection() {
        dataCollectionActive = true;
        
        // Generar datos para todas las turbinas cada 5 segundos
        setInterval(() => {
            if (dataCollectionActive) {
                testTurbines.forEach(turbine => {
                    if (turbine.status === 'active') {
                        const data = generateTurbineData(turbine);
                        addDataPoint(turbine.id, data);
                    }
                });
                
                // Actualizar contadores en la interfaz
                updateDataCounters();
            }
        }, 5000);
        
        console.log('[MultiTurbineManager] Recolección de datos automática iniciada');
    }
    
    // Generar datos realistas para una turbina específica
    function generateTurbineData(turbine) {
        const specs = turbine.specifications;
        const factors = turbine.individualFactors;
        
        // Generar velocidad del viento con variaciones realistas
        let windSpeed = 3 + Math.random() * 12; // Entre 3 y 15 m/s
        
        // Añadir patrones diarios (más viento durante el día)
        const hour = new Date().getHours();
        const dailyFactor = 0.8 + 0.4 * Math.sin((hour - 6) * Math.PI / 12);
        windSpeed *= Math.max(0.5, dailyFactor);
        
        // Calcular RPM basado en especificaciones de la turbina
        let idealRpm = windSpeed * specs.rpmMultiplier;
        let actualRpm = idealRpm * factors.wearFactor * (0.95 + Math.random() * 0.1);
        
        // Calcular voltaje y amperaje basado en la curva de potencia
        let targetPower = 0;
        for (let i = 0; i < specs.powerCurve.length; i++) {
            const point = specs.powerCurve[i];
            if (windSpeed <= point.windSpeed) {
                if (i === 0) {
                    targetPower = point.power;
                } else {
                    // Interpolación lineal
                    const prevPoint = specs.powerCurve[i-1];
                    const ratio = (windSpeed - prevPoint.windSpeed) / (point.windSpeed - prevPoint.windSpeed);
                    targetPower = prevPoint.power + (point.power - prevPoint.power) * ratio;
                }
                break;
            }
            if (i === specs.powerCurve.length - 1) {
                targetPower = point.power;
            }
        }
        
        // Aplicar factores individuales de la turbina
        targetPower *= factors.wearFactor * factors.maintenanceQuality * factors.environmentalFactor;
        
        // Calcular voltaje y amperaje con variación realista
        const voltageBase = specs.voltageRange[0] + 
            (specs.voltageRange[1] - specs.voltageRange[0]) * (targetPower / Math.max(...specs.powerCurve.map(p => p.power)));
        const voltage = voltageBase * (0.95 + Math.random() * 0.1);
        
        const amperageBase = targetPower * 1000 / voltage; // P = V * I
        const amperage = Math.max(specs.amperageRange[0], 
            Math.min(specs.amperageRange[1], amperageBase * (0.95 + Math.random() * 0.1)));
        
        // Ocasionalmente simular anomalías
        const data = {
            turbineId: turbine.id,
            timestamp: new Date(),
            voltaje: voltage.toFixed(2),
            amperaje: amperage.toFixed(2),
            rpm: actualRpm.toFixed(0),
            velocidadViento: windSpeed.toFixed(2),
            model: turbine.model,
            location: turbine.location.name
        };
        
        // 2% de probabilidad de anomalía
        if (Math.random() < 0.02) {
            const anomalyType = Math.floor(Math.random() * 3);
            switch (anomalyType) {
                case 0: // Caída de voltaje
                    data.voltaje = (parseFloat(data.voltaje) * 0.7).toFixed(2);
                    data.anomaly = 'voltage_drop';
                    break;
                case 1: // RPM irregular
                    data.rpm = (parseFloat(data.rpm) * (0.6 + Math.random() * 0.8)).toFixed(0);
                    data.anomaly = 'rpm_irregular';
                    break;
                case 2: // Amperaje bajo
                    data.amperaje = (parseFloat(data.amperaje) * 0.5).toFixed(2);
                    data.anomaly = 'amperage_low';
                    break;
            }
        }
        
        return data;
    }
    
    // Añadir punto de datos a una turbina específica
    function addDataPoint(turbineId, data) {
        if (!allTurbineData[turbineId]) {
            allTurbineData[turbineId] = [];
        }
        
        allTurbineData[turbineId].push(data);
        
        // Mantener solo los últimos 1000 puntos por turbina
        if (allTurbineData[turbineId].length > 1000) {
            allTurbineData[turbineId].shift();
        }
        
        // Si es la turbina actual, alimentar al sistema de IA
        if (turbineId === currentTurbineId) {
            if (window.RealTurbineAI) {
                window.RealTurbineAI.addTrainingData(data);
            }
            
            // Actualizar telemetría en tiempo real
            updateRealtimeTelemetry(data);
        }
    }
    
    // Actualizar telemetría en tiempo real para la interfaz
    function updateRealtimeTelemetry(data) {
        // Actualizar valores en el dashboard
        const voltajeEl = document.getElementById("voltaje-value");
        const amperajeEl = document.getElementById("amperaje-value");
        const rpmEl = document.getElementById("rpm-value");
        const vientoEl = document.getElementById("viento-value");
        
        if (voltajeEl) voltajeEl.textContent = data.voltaje + " V";
        if (amperajeEl) amperajeEl.textContent = data.amperaje + " A";
        if (rpmEl) rpmEl.textContent = data.rpm + " RPM";
        if (vientoEl) vientoEl.textContent = data.velocidadViento + " m/s";
        
        // Actualizar historial si existe
        const tabla = document.getElementById("telemetria-table-body");
        if (tabla) {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${data.voltaje} V</td>
                <td>${data.amperaje} A</td>
                <td>${data.rpm} RPM</td>
                <td>${data.velocidadViento} m/s</td>
                <td>${data.timestamp.toLocaleString()}</td>
            `;
            tabla.insertBefore(fila, tabla.firstChild);
            
            // Mantener solo las últimas 10 filas
            if (tabla.children.length > 10) {
                tabla.removeChild(tabla.lastChild);
            }
        }
    }
    
    // Actualizar contadores de datos
    function updateDataCounters() {
        const totalData = Object.values(allTurbineData).reduce((sum, data) => sum + data.length, 0);
        
        // Actualizar en el panel de entrenamiento
        const statusElement = document.getElementById('ai-training-status');
        if (statusElement) {
            const currentTurbineData = allTurbineData[currentTurbineId] ? allTurbineData[currentTurbineId].length : 0;
            statusElement.textContent = `Datos de turbina actual: ${currentTurbineData} | Total de todas las turbinas: ${totalData}`;
        }
        
        // Actualizar barra de progreso
        const progressBar = document.getElementById('ai-training-progress');
        if (progressBar) {
            const currentTurbineData = allTurbineData[currentTurbineId] ? allTurbineData[currentTurbineId].length : 0;
            const progress = Math.min(100, (currentTurbineData / 30) * 100);
            progressBar.style.width = progress + '%';
        }
    }
    
    // Entrenar IA con datos de todas las turbinas
    function trainAIWithAllTurbines() {
        if (!window.RealTurbineAI) {
            return {
                status: 'error',
                message: 'Sistema de IA no disponible'
            };
        }
        
        console.log('[MultiTurbineManager] Entrenando IA con datos de todas las turbinas...');
        
        // Recopilar todos los datos
        let allData = [];
        Object.entries(allTurbineData).forEach(([turbineId, data]) => {
            allData = allData.concat(data);
        });
        
        // Mezclar los datos aleatoriamente para mejor entrenamiento
        allData = allData.sort(() => Math.random() - 0.5);
        
        console.log(`[MultiTurbineManager] Total de datos para entrenamiento: ${allData.length}`);
        
        // Entrenar el modelo
        return window.RealTurbineAI.trainModel();
    }
    
    // Generar datos masivos para todas las turbinas
    function generateBulkData(pointsPerTurbine = 50) {
        console.log(`[MultiTurbineManager] Generando ${pointsPerTurbine} puntos de datos para cada turbina...`);
        
        testTurbines.forEach(turbine => {
            if (turbine.status === 'active') {
                for (let i = 0; i < pointsPerTurbine; i++) {
                    const data = generateTurbineData(turbine);
                    // Generar timestamp histórico (último mes)
                    data.timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
                    addDataPoint(turbine.id, data);
                }
            }
        });
        
        updateDataCounters();
        
        return {
            status: 'success',
            message: `Generados ${pointsPerTurbine} puntos de datos para cada turbina activa`,
            totalPoints: pointsPerTurbine * testTurbines.filter(t => t.status === 'active').length
        };
    }
    
    // Obtener estadísticas de todas las turbinas
    function getAllTurbineStats() {
        const stats = {};
        
        testTurbines.forEach(turbine => {
            const data = allTurbineData[turbine.id] || [];
            const lastData = data[data.length - 1];
            
            stats[turbine.id] = {
                model: turbine.model,
                location: turbine.location.name,
                status: turbine.status,
                dataPoints: data.length,
                currentReading: lastData ? {
                    voltaje: lastData.voltaje,
                    amperaje: lastData.amperaje,
                    rpm: lastData.rpm,
                    velocidadViento: lastData.velocidadViento,
                    timestamp: lastData.timestamp
                } : null
            };
        });
        
        return stats;
    }
    
    // API pública
    return {
        initialize,
        getCurrentTurbine,
        selectTurbine,
        getTurbines: () => testTurbines,
        getAllData: () => allTurbineData,
        getCurrentTurbineData: () => allTurbineData[currentTurbineId] || [],
        generateBulkData,
        trainAIWithAllTurbines,
        getAllTurbineStats,
        addDataPoint,
        generateTurbineData,
        startDataCollection: () => { dataCollectionActive = true; },
        stopDataCollection: () => { dataCollectionActive = false; },
        isDataCollectionActive: () => dataCollectionActive
    };
})();

// Auto-inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Esperar un poco para asegurar que otros sistemas estén cargados
    setTimeout(() => {
        if (window.MultiTurbineManager) {
            window.MultiTurbineManager.initialize();
        }
    }, 1500);
});

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MultiTurbineManager;
}