/**
 * Integración entre el modelo real de IA (TensorFlow.js) y el sistema existente de SepheIA
 */

// Bandera para verificar si el sistema antiguo está disponible
let legacyAIAvailable = false;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando integración de IA');
    
    // Verificar si el sistema legado está disponible
    legacyAIAvailable = typeof window.TurbineAI !== 'undefined';
    console.log('Sistema legado disponible:', legacyAIAvailable);
    
    setTimeout(function() {
        const realAIAvailable = typeof window.RealTurbineAI !== 'undefined';
        console.log('RealTurbineAI Disponible:', realAIAvailable);
        
        if (!realAIAvailable) {
            console.error('RealTurbineAI No disponible, identificando problemas');
            const script = document.createElement('script');
            script.src = 'js/real-ai-model.js';
            script.onload = function() {
                console.log('Script cargado manualmente, inicializando');
                if (typeof window.RealTurbineAI !== 'undefined') {
                    window.RealTurbineAI.initialize().then(result => {
                        console.log('Inicialización exitosa:', result);
                        setupDataCollection();
                    }).catch(error => { // Corregido "cath" a "catch"
                        console.error('Error de inicialización manual:', error);
                    });
                }
            };
            document.head.appendChild(script);
            return;
        }
        
        window.RealTurbineAI.initialize().then(result => {
            console.log('Resultado de inicialización:', result);
            setupDataCollection();
        }).catch(error => { // Corregido "cath" a "catch"
            console.error('Error de inicialización:', error);
        });
    }, 1000);
});

// Configurar la recopilación de datos de telemetría
function setupDataCollection() {
    console.log('Configurando recopilación de datos para entrenamiento de IA...');
    
    // Guardar la función original de generación de datos de telemetría
    const originalGenerarDatosSensores = window.generarDatosSensores;
    
    // Reemplazar con nuestra versión que alimenta datos al modelo de IA
    window.generarDatosSensores = function() {
        // Llamar a la implementación original
        const datos = originalGenerarDatosSensores ? originalGenerarDatosSensores() : {
            voltaje: (Math.random() * 100).toFixed(2),
            amperaje: (Math.random() * 50).toFixed(2),
            rpm: (Math.random() * 5000).toFixed(0),
            velocidadViento: (Math.random() * 25).toFixed(2),
            hora: new Date().toLocaleString()
        };
        
        // Alimentar datos al sistema de IA real
        try {
            if (window.RealTurbineAI) {
                window.RealTurbineAI.addTrainingData(datos);
                
                // Intentar entrenar el modelo después de cada 20 nuevos puntos de datos
                if (window.RealTurbineAI.getDataSize() % 20 === 0) {
                    trainModelIfReady();
                }
                
                // Actualizar el panel de entrenamiento si existe
                updateTrainingPanel();
            }
        } catch (error) {
            console.error('Error al enviar datos a RealTurbineAI:', error);
        }
        
        return datos;
    };
    
    // Si actualizarTelemetria existe, guardar la función original
    if (typeof window.actualizarTelemetria === 'function') {
        const originalUpdateTelemetria = window.actualizarTelemetria;
        
        // Reemplazar con nuestra versión
        window.actualizarTelemetria = async function() {
            // Llamar a la implementación original
            originalUpdateTelemetria();
            
            // Obtener los valores actuales y generar insights
            const datos = {
                voltaje: document.getElementById('voltaje-value') ? document.getElementById('voltaje-value').textContent.replace(/[^\d.]/g, '') : 0,
                amperaje: document.getElementById('amperaje-value') ? document.getElementById('amperaje-value').textContent.replace(/[^\d.]/g, '') : 0,
                rpm: document.getElementById('rpm-value') ? document.getElementById('rpm-value').textContent.replace(/[^\d.]/g, '') : 0,
                velocidadViento: document.getElementById('viento-value') ? document.getElementById('viento-value').textContent.replace(/[^\d.]/g, '') : 0,
                timestamp: new Date()
            };
            
            // Generar insights y actualizar la interfaz
            try {
                if (window.RealTurbineAI) {
                    const insights = await window.RealTurbineAI.generateInsights(datos);
                    updateAIInterface(datos, insights);
                }
            } catch (error) {
                console.error('Error al generar insights:', error);
            }
        };
    }
    
    console.log('Recopilación de datos configurada correctamente');
    
    // Si TurbineAI está disponible, reemplazar el sistema de preguntas y respuestas
    if (legacyAIAvailable && window.TurbineAI) {
        // Guardar referencia a la función original
        const originalAnswerQuestion = window.TurbineAI.answerQuestion;
        
        // Reemplazar con nuestra versión
        window.TurbineAI.answerQuestion = function(question) {
            try {
                // Usar el modelo real de IA si está disponible
                if (window.RealTurbineAI) {
                    return window.RealTurbineAI.answerQuestion(question);
                } else {
                    throw new Error("RealTurbineAI no disponible");
                }
            } catch (error) {
                console.error('Error al usar RealTurbineAI para responder pregunta:', error);
                // Caer en la implementación original como fallback
                return originalAnswerQuestion(question);
            }
        };
        
        console.log('Sistema de preguntas y respuestas reemplazado correctamente');
    }
}

// Actualizar el panel de entrenamiento si existe
function updateTrainingPanel() {
    if (!window.RealTurbineAI) return;
    
    const dataSize = window.RealTurbineAI.getDataSize();
    const statusElement = document.getElementById('ai-training-status');
    const progressBar = document.getElementById('ai-training-progress');
    
    if (statusElement) {
        statusElement.textContent = `Datos recopilados: ${dataSize}/30`;
    }
    
    if (progressBar) {
        const progress = Math.min(100, (dataSize / 30) * 100);
        progressBar.style.width = progress + '%';
    }
}

// Entrenar el modelo cuando hay suficientes datos
async function trainModelIfReady() {
    if (!window.RealTurbineAI) return;
    
    const dataSize = window.RealTurbineAI.getDataSize();
    console.log(`Verificando si se puede entrenar el modelo (${dataSize} datos recopilados)...`);
    
    // Si hay suficientes datos, intentar entrenar
    if (dataSize >= 30) { // Al menos 30 puntos de datos para intentar entrenar
        try {
            console.log('Iniciando entrenamiento del modelo...');
            
            // Mostrar mensaje de entrenamiento en la interfaz
            updateTrainingStatus('Entrenando modelo de IA con datos recopilados...');
            
            // Entrenar el modelo
            const result = await window.RealTurbineAI.trainModel();
            
            console.log('Resultado del entrenamiento:', result);
            
            if (result.status === 'success') {
                updateTrainingStatus('¡Modelo entrenado correctamente! Pérdida final: ' + result.finalLoss.toFixed(4));
                console.log('Modelo entrenado correctamente');
            } else {
                updateTrainingStatus('Error en el entrenamiento: ' + result.message);
                console.error('Error en el entrenamiento:', result.message);
            }
        } catch (error) {
            updateTrainingStatus('Error al entrenar el modelo: ' + error.message);
            console.error('Error al entrenar el modelo:', error);
        }
    } else {
        console.log('Aún no hay suficientes datos para entrenar el modelo');
        updateTrainingStatus(`Recopilando datos para entrenamiento (${dataSize}/30)...`);
    }
}

// Actualizar el estado de entrenamiento en la interfaz
function updateTrainingStatus(message) {
    const statusElement = document.getElementById('ai-training-status');
    
    if (statusElement) {
        statusElement.textContent = message;
    } else {
        // Si no existe, crear un elemento para mostrar el estado
        const aiContainer = document.getElementById('ai-assistant-container');
        if (aiContainer) {
            const statusDiv = document.createElement('div');
            statusDiv.id = 'ai-training-status';
            statusDiv.style.padding = '10px';
            statusDiv.style.backgroundColor = '#f0f9ff';
            statusDiv.style.borderRadius = '4px';
            statusDiv.style.marginBottom = '10px';
            statusDiv.style.fontSize = '0.9rem';
            statusDiv.style.color = '#0369a1';
            statusDiv.textContent = message;
            
            // Insertar al principio del contenedor
            aiContainer.insertBefore(statusDiv, aiContainer.firstChild);
        }
    }
}

// Actualizar la interfaz con insights de la IA
function updateAIInterface(datos, insights) {
    // Si está disponible la función original, usarla como fallback
    if (legacyAIAvailable && typeof window.updateAIAssistantWithAnalysis === 'function') {
        try {
            // Crear un objeto de análisis compatible con el sistema antiguo
            const legacyAnalysis = {
                status: 'success',
                telemetry: datos,
                healthScore: Math.floor(85 + Math.random() * 10), // Simulado
                efficiency: {
                    current: Math.floor(80 + Math.random() * 15), // Simulado
                    trend: '+' + (Math.random() * 5).toFixed(1) + '% respecto a la semana anterior',
                    status: 'optimal'
                },
                maintenanceRecommendation: {
                    daysUntil: Math.floor(20 + Math.random() * 10),
                    priority: 'normal',
                    components: ['Mantenimiento general']
                },
                insights: insights.map(insight => ({
                    id: insight.id,
                    type: insight.type,
                    message: insight.message,
                    timestamp: insight.timestamp,
                    priority: insight.priority
                }))
            };
            
            window.updateAIAssistantWithAnalysis(legacyAnalysis);
        } catch (error) {
            console.error('Error al actualizar interfaz con sistema antiguo:', error);
        }
    } else {
        // Si no está disponible, actualizar directamente los elementos de la interfaz
        
        try {
            // Actualizar eficiencia
            const efficiencyValue = document.getElementById('ai-efficiency-value');
            if (efficiencyValue) {
                const efficiency = Math.floor(80 + Math.random() * 15); // Simulado
                efficiencyValue.textContent = efficiency + '%';
                efficiencyValue.className = 'ai-metric-value optimal';
            }
            
            // Actualizar insights
            const insightsContainer = document.getElementById('ai-insights-container');
            if (insightsContainer && insights && insights.length > 0) {
                let insightsHTML = '';
                
                insights.forEach(insight => {
                    insightsHTML += `
                        <div class="ai-insight-item">
                            <div class="ai-insight-indicator ${insight.priority}"></div>
                            <div class="ai-insight-content">
                                <p class="ai-insight-message">${insight.message}</p>
                                <p class="ai-insight-meta">
                                    ${new Date(insight.timestamp).toLocaleTimeString()} · ${insight.type}
                                </p>
                            </div>
                        </div>
                    `;
                });
                
                insightsContainer.innerHTML = insightsHTML;
            }
        } catch (error) {
            console.error('Error al actualizar interfaz directamente:', error);
        }
    }
}

// Exportar funciones para uso global
window.RealAIIntegration = {
    trainModelIfReady,
    updateTrainingStatus,
    updateTrainingPanel
};