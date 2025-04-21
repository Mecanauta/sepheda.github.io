/**
 * Integración del Asistente IA con el panel de cliente existente
 * 
 * Este script conecta el sistema de telemetría existente con el módulo
 * de análisis de IA para turbinas eólicas.
 */

/**
 * Integración del Asistente IA con el panel de cliente existente
 * 
 * Este script conecta el sistema de telemetría existente con el módulo
 * de análisis de IA para turbinas eólicas.
 */
// Escuchar el evento personalizado que indica que TurbineAI está listo
window.addEventListener('turbineAIReady', function(e) {
    console.log('Evento turbineAIReady recibido');
    
    // Verificar que estamos en la página de cliente
    if (!document.getElementById('ai-assistant-container')) {
        console.log('No se encontró el contenedor del asistente IA');
        return;
    }
    
    // Inicializar el sistema de IA
    initializeAI();
    connectToTelemetry();
    setupPeriodicUpdates();
});
// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded ejecutado');
    
    // Verificar que estamos en la página de cliente
    if (!document.getElementById('ai-assistant-container')) {
        console.log('No se encontró el contenedor del asistente IA');
        return;
    }
    
    console.log('Contenedor del asistente IA encontrado');
    
    // Verificar si TurbineAI ya está disponible
    if (window.TurbineAI) {
        console.log('TurbineAI ya está disponible, inicializando...');
        initializeAI();
        connectToTelemetry();
        setupPeriodicUpdates();
    } else {
        // Si no está disponible, esperar a que el script de TurbineAI se cargue
        console.log('TurbineAI no está disponible, esperando...');
        
        // Crear un intervalo para verificar periódicamente si TurbineAI está disponible
        let attempts = 0;
        const maxAttempts = 10;
        const checkInterval = setInterval(function() {
            attempts++;
            console.log(`Intento ${attempts} de ${maxAttempts}...`);
            
            if (window.TurbineAI) {
                console.log('TurbineAI finalmente disponible, inicializando...');
                clearInterval(checkInterval);
                initializeAI();
                connectToTelemetry();
                setupPeriodicUpdates();
            } else if (attempts >= maxAttempts) {
                console.error('TurbineAI no se cargó después de múltiples intentos');
                clearInterval(checkInterval);
                showAIError('Error al inicializar el asistente de IA. Por favor, recargue la página.');
            }
        }, 500); // Verificar cada 500ms
    }
});

/**
 * Carga las dependencias necesarias para el funcionamiento del asistente de IA
 */
function loadDependencies() {
    return new Promise((resolve, reject) => {
        try {
            // Cargar el módulo de análisis de IA
            const script = document.createElement('script');
            script.src = 'js/ai-turbine-analysis.js';
            script.onload = () => {
                // Cargar los estilos del asistente
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'css/ai-assistant.css';
                link.onload = resolve;
                document.head.appendChild(link);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Inicializa el sistema de IA
 */
function initializeAI() {
    console.log('Función initializeAI llamada');
    
    if (!window.TurbineAI) {
        console.error('Módulo TurbineAI no encontrado');
        showAIError('Error al inicializar el asistente de IA');
        return;
    }
    
    console.log('TurbineAI encontrado, intentando inicializar');
    
    try {
        // Inicializar el sistema de IA con datos históricos (si están disponibles)
        const result = window.TurbineAI.initialize();
        console.log('Sistema de IA inicializado:', result);
        
        // Renderizar la interfaz inicial
        console.log('Llamando a renderAIAssistant');
        renderAIAssistant();
        
    } catch (error) {
        console.error('Error al inicializar el sistema de IA:', error);
        showAIError('Error al inicializar el asistente de IA');
    }
}

/**
 * Conecta el asistente con el sistema de telemetría existente
 */
function connectToTelemetry() {
    try {
        // Guardar la función original de actualización para preservar la funcionalidad existente
        const originalUpdateTelemetria = window.actualizarTelemetria;
        
        // Reemplazar con nuestra versión que además alimenta al sistema de IA
        window.actualizarTelemetria = function() {
            // Llamar a la implementación original primero
            if (typeof originalUpdateTelemetria === 'function') {
                originalUpdateTelemetria();
            }
            
            // Obtener los valores actuales de los sensores
            const datos = getTelemetryValues();
            
            // Alimentar los datos al sistema de IA
            if (window.TurbineAI) {
                try {
                    const analysis = window.TurbineAI.analyzeTelemetry(datos);
                    
                    // Actualizar la interfaz con los nuevos análisis
                    updateAIAssistantWithAnalysis(analysis);
                    
                } catch (error) {
                    console.error('Error al analizar datos de telemetría:', error);
                }
            }
        };
        
        console.log('Integración con telemetría configurada correctamente');
    } catch (error) {
        console.error('Error al conectar con el sistema de telemetría:', error);
    }
}

/**
 * Obtiene los valores actuales de telemetría desde la interfaz
 * @returns {Object} Datos de telemetría
 */
function getTelemetryValues() {
    const voltaje = document.getElementById('voltaje-value').textContent.replace(/[^\d.]/g, '');
    const amperaje = document.getElementById('amperaje-value').textContent.replace(/[^\d.]/g, '');
    const rpm = document.getElementById('rpm-value').textContent.replace(/[^\d.]/g, '');
    const velocidadViento = document.getElementById('viento-value').textContent.replace(/[^\d.]/g, '');
    
    return {
        voltaje: parseFloat(voltaje) || 0,
        amperaje: parseFloat(amperaje) || 0,
        rpm: parseFloat(rpm) || 0,
        velocidadViento: parseFloat(velocidadViento) || 0,
        timestamp: new Date()
    };
}

/**
 * Configura actualizaciones periódicas para el asistente de IA
 */
function setupPeriodicUpdates() {
    // Actualizar análisis cada 30 segundos (incluso si no hay nuevos datos de telemetría)
    setInterval(() => {
        if (window.TurbineAI) {
            const datos = getTelemetryValues();
            try {
                const analysis = window.TurbineAI.analyzeTelemetry(datos);
                updateAIAssistantWithAnalysis(analysis);
            } catch (error) {
                console.error('Error en actualización periódica de IA:', error);
            }
        }
    }, 30000); // 30 segundos
}

/**
 * Renderiza la interfaz inicial del asistente de IA
 */
function renderAIAssistant() {
    const container = document.getElementById('ai-assistant-container');
    if (!container) return;
    
    // Verificar si ya tenemos el HTML del asistente (evitar duplicados)
    if (document.getElementById('ai-assistant-root')) return;
    
    // Crear el HTML base del asistente
    const html = `
    <div id="ai-assistant-root" class="ai-assistant">
        <!-- Tarjetas de métricas -->
        <div class="ai-metrics-grid">
            <div class="ai-metric-card">
                <div class="ai-metric-label">Eficiencia Actual</div>
                <div id="ai-efficiency-value" class="ai-metric-value optimal">87%</div>
                <div id="ai-efficiency-trend" class="ai-metric-trend">+2.1% respecto a la semana anterior</div>
            </div>
            
            <div class="ai-metric-card">
                <div class="ai-metric-label">Próximo Mantenimiento</div>
                <div id="ai-maintenance-value" class="ai-metric-value normal">28 días</div>
                <div id="ai-maintenance-status" class="ai-metric-trend">Programado</div>
            </div>
            
            <div class="ai-metric-card">
                <div class="ai-metric-label">Estado de Salud</div>
                <div id="ai-health-value" class="ai-metric-value optimal">95/100</div>
                <div id="ai-health-trend" class="ai-metric-trend">Estable</div>
            </div>
        </div>
        
        <!-- Sección de Insights -->
        <div class="ai-insights">
            <h3 class="ai-insights-title">Insights de IA</h3>
            <div id="ai-insights-container" class="ai-insights-container">
                <p class="text-center text-gray-500 p-4">Cargando insights...</p>
            </div>
        </div>
        
        <!-- Asistente conversacional -->
        <div class="ai-chat">
            <h3 class="ai-chat-title">Consulta con el Asistente</h3>
            <div class="ai-chat-container">
                <div id="ai-chat-messages">
                    <!-- Los mensajes se añadirán aquí -->
                </div>
                
                <form id="ai-chat-form" class="ai-chat-form">
                    <input 
                        type="text" 
                        id="ai-chat-input" 
                        class="ai-chat-input" 
                        placeholder="Pregunta sobre tu turbina..."
                    >
                    <button type="submit" id="ai-chat-submit" class="ai-chat-submit">
                        Preguntar
                    </button>
                </form>
            </div>
            <div class="ai-chat-suggestions">
                Sugerencias: "¿Cuál es la eficiencia actual?", "¿Cuándo es el próximo mantenimiento?", "¿Hay algún problema detectado?"
            </div>
        </div>
    </div>
    `;
    
    // Insertar el HTML en el contenedor
    console.log('Insertando HTML en el contenedor');
    container.innerHTML = html;
    
    // Configurar el formulario de chat
    console.log('Configurando formulario de chat');
    setupChatForm();
    
    // Realizar el análisis inicial
    const datos = getTelemetryValues();
    if (window.TurbineAI) {
        try {
            console.log('Realizando análisis inicial con datos:', datos);
            const analysis = window.TurbineAI.analyzeTelemetry(datos);
            updateAIAssistantWithAnalysis(analysis);
        } catch (error) {
            console.error('Error en análisis inicial:', error);
        }
    }
}   

/**
 * Configura el formulario de chat para interactuar con la IA
 */
function setupChatForm() {
    const form = document.getElementById('ai-chat-form');
    const input = document.getElementById('ai-chat-input');
    const submit = document.getElementById('ai-chat-submit');
    const messages = document.getElementById('ai-chat-messages');
    
    if (!form || !input || !submit || !messages) return;
    
    // Añadir mensaje de bienvenida
    addMessage('¡Hola! Soy tu asistente IA para análisis de turbinas. ¿En qué puedo ayudarte hoy?', 'assistant');
    
    // Manejar envío del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const question = input.value.trim();
        if (!question) return;
        
        // Deshabilitar el formulario mientras procesa
        input.disabled = true;
        submit.disabled = true;
        
        // Mostrar la pregunta del usuario
        addMessage(question, 'user');
        
        // Limpiar el input
        input.value = '';
        
        // Obtener respuesta de la IA
        if (window.TurbineAI) {
            try {
                const answer = window.TurbineAI.answerQuestion(question);
                
                // Simular pequeña demora para que parezca que está "pensando"
                setTimeout(() => {
                    // Mostrar la respuesta
                    addMessage(answer, 'assistant');
                    
                    // Reactivar el formulario
                    input.disabled = false;
                    submit.disabled = false;
                    input.focus();
                }, 800);
                
            } catch (error) {
                console.error('Error al procesar pregunta:', error);
                addMessage('Lo siento, ocurrió un error al procesar tu pregunta. Por favor, intenta de nuevo.', 'assistant');
                
                input.disabled = false;
                submit.disabled = false;
                input.focus();
            }
        } else {
            addMessage('Lo siento, el sistema de IA no está disponible en este momento.', 'assistant');
            
            input.disabled = false;
            submit.disabled = false;
            input.focus();
        }
    });
}

/**
 * Añade un mensaje al chat
 * @param {string} text Texto del mensaje
 * @param {string} sender 'user' o 'assistant'
 */
function addMessage(text, sender) {
    const messages = document.getElementById('ai-chat-messages');
    if (!messages) return;
    
    const messageHTML = `
        <div class="ai-chat-message ${sender === 'user' ? 'justify-end' : ''}">
            ${sender === 'assistant' ? `
                <div class="ai-chat-avatar">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                </div>
            ` : ''}
            <div class="ai-chat-bubble ${sender === 'user' ? 'bg-blue-50' : ''}">
                <p class="ai-chat-text">${text}</p>
            </div>
        </div>
    `;
    
    // Añadir el mensaje al contenedor
    messages.innerHTML += messageHTML;
    
    // Scroll al final
    messages.scrollTop = messages.scrollHeight;
}

/**
 * Actualiza la interfaz del asistente con los nuevos análisis
 * @param {Object} analysis Resultado del análisis de IA
 */
function updateAIAssistantWithAnalysis(analysis) {
    if (!analysis || analysis.status !== 'success') {
        return;
    }
    
    // Actualizar eficiencia
    const efficiencyValue = document.getElementById('ai-efficiency-value');
    const efficiencyTrend = document.getElementById('ai-efficiency-trend');
    
    if (efficiencyValue && analysis.efficiency) {
        efficiencyValue.textContent = `${Math.round(analysis.efficiency.current)}%`;
        
        // Aplicar clase según estado
        efficiencyValue.className = 'ai-metric-value';
        if (analysis.efficiency.status === 'optimal') {
            efficiencyValue.classList.add('optimal');
        } else if (analysis.efficiency.status === 'normal') {
            efficiencyValue.classList.add('normal');
        } else {
            efficiencyValue.classList.add('warning');
        }
    }
    
    if (efficiencyTrend && analysis.efficiency) {
        efficiencyTrend.textContent = analysis.efficiency.trend;
    }
    
    // Actualizar mantenimiento
    const maintenanceValue = document.getElementById('ai-maintenance-value');
    const maintenanceStatus = document.getElementById('ai-maintenance-status');
    
    if (maintenanceValue && analysis.maintenanceRecommendation) {
        maintenanceValue.textContent = `${analysis.maintenanceRecommendation.daysUntil} días`;
        
        // Aplicar clase según urgencia
        maintenanceValue.className = 'ai-metric-value';
        if (analysis.maintenanceRecommendation.daysUntil < 7) {
            maintenanceValue.classList.add('warning');
        } else if (analysis.maintenanceRecommendation.daysUntil < 15) {
            maintenanceValue.classList.add('normal');
        } else {
            maintenanceValue.classList.add('optimal');
        }
    }
    
    if (maintenanceStatus && analysis.maintenanceRecommendation) {
        maintenanceStatus.textContent = 
            analysis.maintenanceRecommendation.priority === 'high' 
                ? 'Prioritario' 
                : 'Programado';
    }
    
    // Actualizar salud
    const healthValue = document.getElementById('ai-health-value');
    const healthTrend = document.getElementById('ai-health-trend');
    
    if (healthValue && analysis.healthScore) {
        healthValue.textContent = `${analysis.healthScore}/100`;
        
        // Aplicar clase según puntuación
        healthValue.className = 'ai-metric-value';
        if (analysis.healthScore > 90) {
            healthValue.classList.add('optimal');
        } else if (analysis.healthScore > 75) {
            healthValue.classList.add('normal');
        } else if (analysis.healthScore > 60) {
            healthValue.classList.add('warning');
        } else {
            healthValue.classList.add('critical');
        }
    }
    
    // Actualizar insights
    const insightsContainer = document.getElementById('ai-insights-container');
    
    if (insightsContainer && analysis.insights && analysis.insights.length > 0) {
        let insightsHTML = '';
        
        analysis.insights.forEach(insight => {
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
    } else if (insightsContainer) {
        insightsContainer.innerHTML = '<p class="text-center text-gray-500 p-4">No hay insights disponibles actualmente.</p>';
    }
}

/**
 * Muestra un mensaje de error en el contenedor del asistente
 * @param {string} message Mensaje de error
 */
function showAIError(message) {
    const container = document.getElementById('ai-assistant-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="ai-error">
            <svg class="ai-error-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p class="ai-error-message">${message}</p>
            <button id="ai-retry-btn" class="ai-retry-btn">Reintentar</button>
        </div>
    `;
    
    // Configurar botón para reintentar
    const retryBtn = document.getElementById('ai-retry-btn');
    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            initializeAI();
        });
    }
}

// Función para generar un informe completo de la turbina (podría conectarse a un botón de la interfaz)
function generateTurbineReport() {
    if (!window.TurbineAI) {
        alert('El sistema de IA no está disponible actualmente.');
        return;
    }
    
    try {
        const report = window.TurbineAI.generateReport();
        console.log('Reporte generado:', report);
        
        // Aquí podrías abrir un modal o redireccionar a una página de informe
        // Por ahora, solo mostraremos un mensaje
        alert('Informe generado correctamente. Consulta la consola para más detalles.');
        
    } catch (error) {
        console.error('Error al generar informe:', error);
        alert('Error al generar el informe de la turbina.');
    }
}

// Exportar funciones públicas
window.aiTurbineAssistant = {
    generateReport: generateTurbineReport
};