/**
 * SepheIA - Asistente Inteligente para Turbinas
 * 
 * Este script maneja la funcionalidad de la página independiente de SepheIA
 * y coordina la integración entre el sistema legacy (TurbineAI) y 
 * el sistema nuevo (RealTurbineAI)
 */

// Variables de estado
let turbineAIReady = false;
let realTurbineAIReady = false;
let sepheiaInitialized = false;

// Verificar si los sistemas de IA están disponibles inmediatamente
console.log('Script sepheia.js cargado. TurbineAI disponible:', !!window.TurbineAI);
console.log('Script sepheia.js cargado. RealTurbineAI disponible:', !!window.RealTurbineAI);

// Manejar el evento personalizado de TurbineAI
window.addEventListener('turbineAIReady', function(e) {
    console.log('Evento turbineAIReady recibido');
    turbineAIReady = true;
    checkSystemsAndInitialize();
});

// Manejar el evento personalizado de RealTurbineAI
window.addEventListener('realTurbineAIReady', function(e) {
    console.log('Evento realTurbineAIReady recibido');
    realTurbineAIReady = true;
    checkSystemsAndInitialize();
});

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded en sepheia.js');
    
    // Verificar si los sistemas ya están disponibles
    if (window.TurbineAI) {
        console.log('TurbineAI ya disponible en DOMContentLoaded');
        turbineAIReady = true;
    }
    
    if (window.RealTurbineAI) {
        console.log('RealTurbineAI ya disponible en DOMContentLoaded');
        realTurbineAIReady = true;
    }
    
    // Verificar si podemos inicializar
    checkSystemsAndInitialize();
    
    // Si después de 3 segundos no se han cargado, intentar inicializar con lo que haya
    setTimeout(() => {
        if (!sepheiaInitialized) {
            console.log('Tiempo de espera agotado, inicializando con sistemas disponibles');
            checkSystemsAndInitialize(true);
        }
    }, 3000);
});

function checkSystemsAndInitialize(force = false) {
    // Evitar inicialización múltiple
    if (sepheiaInitialized) return;
    
    console.log(`Verificando sistemas: TurbineAI=${turbineAIReady}, RealTurbineAI=${realTurbineAIReady}`);
    
    // Inicializar si ambos sistemas están listos o si se fuerza la inicialización
    if ((turbineAIReady && realTurbineAIReady) || force) {
        console.log('Comenzando inicialización de SepheIA');
        checkAuthAndInitialize();
    }
}

function checkAuthAndInitialize() {
    // Marcar como inicializado para evitar múltiples inicializaciones
    sepheiaInitialized = true;
    
    // Verificar autenticación
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged(async (user) => {
            if (!user) {
                window.location.href = 'loggin.html';
                return;
            }
            
            try {
                // Verificar el rol del usuario
                const userDoc = await firebase.firestore().collection('usuarios').doc(user.uid).get();
                
                if (!userDoc.exists) {
                    throw new Error("No se encontró información de usuario");
                }
                
                const userData = userDoc.data();
                
                // Verificar que sea un cliente
                if (userData.rol !== 'cliente') {
                    alert('No tienes permiso para acceder a esta página');
                    window.location.href = 'loggin.html';
                    return;
                }
                
                // Actualizar nombre de usuario
                const userNameElement = document.querySelector('.user-name');
                if (userNameElement) {
                    userNameElement.textContent = userData.nombre || 'Cliente';
                }
                
                // Inicializar SepheIA
                initializeSepheIA(user.uid);
                
            } catch (error) {
                console.error("Error al verificar usuario:", error);
                alert("Error al cargar datos de usuario");
                window.location.href = 'loggin.html';
            }
        });
        
        // Manejar cierre de sesión
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                try {
                    await firebase.auth().signOut();
                    window.location.href = 'loggin.html';
                } catch (error) {
                    console.error("Error al cerrar sesión:", error);
                    alert("Error al cerrar sesión");
                }
            });
        }
    } else {
        // Si Firebase no está disponible, inicializar SepheIA con modo demo
        console.log('Firebase no disponible, inicializando en modo demo');
        initializeSepheIA('demo-user');
    }
}

function initializeSepheIA(userId) {
    console.log('Iniciando SepheIA...');
    console.log('TurbineAI disponible:', !!window.TurbineAI);
    console.log('RealTurbineAI disponible:', !!window.RealTurbineAI);
    
    try {
        // Primero inicializamos RealTurbineAI si está disponible
        if (window.RealTurbineAI) {
            console.log('Inicializando RealTurbineAI...');
            window.RealTurbineAI.initialize()
                .then(result => {
                    console.log('RealTurbineAI inicializado:', result);
                })
                .catch(error => {
                    console.error('Error al inicializar RealTurbineAI:', error);
                });
        }
        
        // Luego inicializamos TurbineAI como fallback
        if (window.TurbineAI) {
            console.log('Inicializando TurbineAI...');
            window.TurbineAI.initialize();
            console.log('TurbineAI inicializado correctamente');
        } else if (!window.RealTurbineAI) {
            // Si ninguno de los dos sistemas está disponible, mostrar error
            throw new Error('Ningún sistema de IA disponible');
        }
        
        // Renderizar la interfaz
        renderAIAssistant();
        
        // Cargar datos de turbinas del cliente
        cargarDatosTurbinas(userId);
        
        // Iniciar actualizaciones periódicas
        setupPeriodicUpdates();
        
    } catch (error) {
        console.error('Error al inicializar SepheIA:', error);
        showAIError('Error al inicializar SepheIA: ' + error.message);
    }
}

async function cargarDatosTurbinas(userId) {
    try {
        // Usar datos simulados como predeterminado
        const datosSimulados = {
            voltaje: 75,
            amperaje: 30,
            rpm: 3000,
            velocidadViento: 8,
            timestamp: new Date()
        };
        
        // Si Firebase está disponible, intentar cargar datos reales
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const clienteDoc = await firebase.firestore().collection('clientes').doc(userId).get();
            
            if (!clienteDoc.exists) {
                console.log("No se encontró información del cliente, usando datos simulados");
                procesarDatos(datosSimulados);
                return;
            }
            
            const clienteData = clienteDoc.data();
            
            if (clienteData.turbinas && clienteData.turbinas.length > 0) {
                const turbina = await firebase.firestore().collection('turbinas').doc(clienteData.turbinas[0]).get();
                
                if (turbina.exists) {
                    const turbinaData = turbina.data();
                    const datos = {
                        voltaje: turbinaData.voltaje_actual || datosSimulados.voltaje,
                        amperaje: turbinaData.amperaje_actual || datosSimulados.amperaje,
                        rpm: turbinaData.rpm_actual || datosSimulados.rpm,
                        velocidadViento: turbinaData.velocidad_viento_actual || datosSimulados.velocidadViento,
                        timestamp: new Date()
                    };
                    
                    procesarDatos(datos);
                    return;
                }
            }
        }
        
        // Si no hay datos reales, usar datos simulados
        procesarDatos(datosSimulados);
        
    } catch (error) {
        console.error("Error al cargar datos de turbinas:", error);
        procesarDatos(datosSimulados);
    }
}

function procesarDatos(datos) {
    console.log('Procesando datos:', datos);
    
    // Intentar alimentar datos a RealTurbineAI
    if (window.RealTurbineAI) {
        try {
            window.RealTurbineAI.addTrainingData(datos);
            console.log('Datos añadidos a RealTurbineAI');
            
            // Actualizar panel de entrenamiento si está disponible
            if (window.RealAIIntegration) {
                window.RealAIIntegration.updateTrainingPanel();
            }
            
            // Generar insights si hay suficientes datos
            if (window.RealTurbineAI.getDataSize() > 5) {
                window.RealTurbineAI.generateInsights(datos)
                    .then(insights => {
                        console.log('Insights generados:', insights);
                        if (window.RealAIIntegration) {
                            window.RealAIIntegration.updateAIInterface(datos, insights);
                        }
                    })
                    .catch(error => {
                        console.error('Error al generar insights:', error);
                    });
            }
        } catch (error) {
            console.error('Error al añadir datos a RealTurbineAI:', error);
        }
    }
    
    // También procesar con TurbineAI como fallback
    if (window.TurbineAI) {
        try {
            const analysis = window.TurbineAI.analyzeTelemetry(datos);
            updateAIAssistantWithAnalysis(analysis);
        } catch (error) {
            console.error('Error al analizar datos con TurbineAI:', error);
        }
    }
}

function setupPeriodicUpdates() {
    // Actualizar cada 30 segundos
    setInterval(async () => {
        const user = typeof firebase !== 'undefined' && firebase.auth ? 
            firebase.auth().currentUser : 'demo-user';
            
        if (user) {
            const userId = typeof user === 'string' ? user : user.uid;
            await cargarDatosTurbinas(userId);
        }
    }, 30000);
}

function renderAIAssistant() {
    const container = document.getElementById('ai-assistant-container');
    if (!container) return;
    
    // Verificar si ya tenemos el HTML del asistente (evitar duplicados)
    if (document.getElementById('ai-assistant-root')) {
        console.log('Asistente ya renderizado, actualizando...');
        return;
    }
    
    console.log('Renderizando asistente...');
    
    const html = `
    <div id="ai-assistant-root" class="ai-assistant">
        <!-- Bienvenida personalizada -->
        <div class="ai-welcome-message">
            <h2>¡Bienvenido a SepheIA!</h2>
            <p>Tu asistente inteligente para el análisis y optimización de turbinas eólicas.</p>
        </div>
        
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
            <h3 class="ai-insights-title">Insights de SepheIA</h3>
            <div id="ai-insights-container" class="ai-insights-container">
                <p class="text-center text-gray-500 p-4">Analizando datos...</p>
            </div>
        </div>
        
        <!-- Asistente conversacional -->
        <div class="ai-chat">
            <h3 class="ai-chat-title">Consulta con SepheIA</h3>
            <div class="ai-chat-container">
                <div id="ai-chat-messages">
                    <div class="ai-chat-message">
                        <div class="ai-chat-avatar">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                        </div>
                        <div class="ai-chat-bubble">
                            <p class="ai-chat-text">¡Hola! Soy SepheIA, tu asistente inteligente para análisis de turbinas. ¿En qué puedo ayudarte hoy?</p>
                        </div>
                    </div>
                </div>
                
                <form id="ai-chat-form" class="ai-chat-form">
                    <input 
                        type="text" 
                        id="ai-chat-input" 
                        class="ai-chat-input" 
                        placeholder="Pregunta a SepheIA sobre tus turbinas..."
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
    
    container.innerHTML = html;
    setupChatForm();
}

function setupChatForm() {
    const form = document.getElementById('ai-chat-form');
    const input = document.getElementById('ai-chat-input');
    const submit = document.getElementById('ai-chat-submit');
    const messages = document.getElementById('ai-chat-messages');
    
    if (!form || !input || !submit || !messages) {
        console.error('No se pudieron encontrar elementos del formulario de chat');
        return;
    }
    
    console.log('Configurando formulario de chat...');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const question = input.value.trim();
        if (!question) return;
        
        input.disabled = true;
        submit.disabled = true;
        
        addMessage(question, 'user');
        input.value = '';
        
        // Determinar qué sistema usar para responder
        let answerSystem = null;
        let systemName = '';
        
        if (window.RealTurbineAI && window.RealTurbineAI.isModelTrained && window.RealTurbineAI.isModelTrained()) {
            answerSystem = window.RealTurbineAI;
            systemName = 'RealTurbineAI';
        } else if (window.TurbineAI) {
            answerSystem = window.TurbineAI;
            systemName = 'TurbineAI';
        }
        
        if (answerSystem) {
            try {
                console.log(`Respondiendo usando ${systemName}...`);
                const answer = answerSystem.answerQuestion(question);
                
                // Si es una promesa (RealTurbineAI podría ser asíncrono)
                if (answer instanceof Promise) {
                    answer.then(result => {
                        showAnswer(result);
                    }).catch(error => {
                        console.error(`Error al procesar pregunta con ${systemName}:`, error);
                        showAnswer(`Lo siento, ocurrió un error. Por favor, intenta de nuevo.`);
                    });
                } else {
                    // Si es una respuesta directa
                    setTimeout(() => {
                        showAnswer(answer);
                    }, 800);
                }
            } catch (error) {
                console.error(`Error al procesar pregunta con ${systemName}:`, error);
                showAnswer('Lo siento, ocurrió un error. Por favor, intenta de nuevo.');
            }
        } else {
            showAnswer('Lo siento, el sistema de IA no está disponible en este momento.');
        }
        
        function showAnswer(text) {
            addMessage(text, 'assistant');
            input.disabled = false;
            submit.disabled = false;
            input.focus();
        }
    });
}

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
    
    messages.innerHTML += messageHTML;
    messages.scrollTop = messages.scrollHeight;
}

function updateAIAssistantWithAnalysis(analysis) {
    if (!analysis || analysis.status !== 'success') return;
    
    console.log('Actualizando interfaz con análisis:', analysis);
    
    // Actualizar eficiencia
    const efficiencyValue = document.getElementById('ai-efficiency-value');
    const efficiencyTrend = document.getElementById('ai-efficiency-trend');
    
    if (efficiencyValue && analysis.efficiency) {
        efficiencyValue.textContent = `${Math.round(analysis.efficiency.current)}%`;
        efficiencyValue.className = 'ai-metric-value ' + analysis.efficiency.status;
    }
    
    if (efficiencyTrend && analysis.efficiency) {
        efficiencyTrend.textContent = analysis.efficiency.trend;
    }
    
    // Actualizar mantenimiento
    const maintenanceValue = document.getElementById('ai-maintenance-value');
    const maintenanceStatus = document.getElementById('ai-maintenance-status');
    
    if (maintenanceValue && analysis.maintenanceRecommendation) {
        maintenanceValue.textContent = `${analysis.maintenanceRecommendation.daysUntil} días`;
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
            analysis.maintenanceRecommendation.priority === 'high' ? 'Prioritario' : 'Programado';
    }
    
    // Actualizar salud
    const healthValue = document.getElementById('ai-health-value');
    const healthTrend = document.getElementById('ai-health-trend');
    
    if (healthValue && analysis.healthScore) {
        healthValue.textContent = `${analysis.healthScore}/100`;
        healthValue.className = 'ai-metric-value';
        
        if (analysis.healthScore > 90) {
            healthValue.classList.add('optimal');
        } else if (analysis.healthScore > 75) {
            healthValue.classList.add('normal');
        } else {
            healthValue.classList.add('warning');
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
    }
}

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
            <button id="ai-retry-btn" class="ai-retry-btn" onclick="location.reload()">Reintentar</button>
        </div>
    `;
}

// Exportar funciones para acceso global
window.SepheIA = {
    initialize: initializeSepheIA,
    renderAIAssistant,
    updateAIAssistantWithAnalysis,
    showAIError
};