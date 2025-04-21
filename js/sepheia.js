/**
 * SepheIA - Asistente Inteligente para Turbinas
 * 
 * Este script maneja la funcionalidad de la página independiente de SepheIA
 */

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
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
            document.querySelector('.user-name').textContent = userData.nombre || 'Cliente';
            
            // Esperar a que TurbineAI esté disponible
            await waitForTurbineAI();
            
            // Inicializar SepheIA
            initializeSepheIA(user.uid);
            
        } catch (error) {
            console.error("Error al verificar usuario:", error);
            alert("Error al cargar datos de usuario");
            window.location.href = 'loggin.html';
        }
    });
    
    // Manejar cierre de sesión
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        try {
            await firebase.auth().signOut();
            window.location.href = 'loggin.html';
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            alert("Error al cerrar sesión");
        }
    });
});

async function waitForTurbineAI() {
    return new Promise((resolve, reject) => {
        // Si TurbineAI ya está disponible, resolver inmediatamente
        if (window.TurbineAI) {
            resolve();
            return;
        }
        
        // Crear un intervalo para verificar periódicamente
        let attempts = 0;
        const maxAttempts = 20;
        const checkInterval = setInterval(() => {
            attempts++;
            
            if (window.TurbineAI) {
                clearInterval(checkInterval);
                resolve();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                reject(new Error('TurbineAI no se pudo cargar'));
            }
        }, 500);
    });
}

async function initializeSepheIA(userId) {
    try {
        if (!window.TurbineAI) {
            throw new Error('Módulo TurbineAI no encontrado');
        }
        
        // Inicializar el sistema de IA
        window.TurbineAI.initialize();
        
        // Renderizar la interfaz
        renderAIAssistant();
        
        // Cargar datos de turbinas del cliente
        await cargarDatosTurbinas(userId);
        
        // Iniciar actualizaciones periódicas
        setupPeriodicUpdates();
        
    } catch (error) {
        console.error('Error al inicializar SepheIA:', error);
        showAIError('Error al inicializar SepheIA');
    }
}

async function cargarDatosTurbinas(userId) {
    try {
        const clienteDoc = await firebase.firestore().collection('clientes').doc(userId).get();
        
        if (!clienteDoc.exists) {
            console.log("No se encontró información del cliente");
            // Usar datos simulados en lugar de fallar
            const datos = {
                voltaje: 75,
                amperaje: 30,
                rpm: 3000,
                velocidadViento: 8,
                timestamp: new Date()
            };
            
            const analysis = window.TurbineAI.analyzeTelemetry(datos);
            updateAIAssistantWithAnalysis(analysis);
            return;
        }
        
        const clienteData = clienteDoc.data();
        
        if (clienteData.turbinas && clienteData.turbinas.length > 0) {
            const turbina = await firebase.firestore().collection('turbinas').doc(clienteData.turbinas[0]).get();
            
            if (turbina.exists) {
                const turbinaData = turbina.data();
                const datos = {
                    voltaje: turbinaData.voltaje_actual || 75,
                    amperaje: turbinaData.amperaje_actual || 30,
                    rpm: turbinaData.rpm_actual || 3000,
                    velocidadViento: turbinaData.velocidad_viento_actual || 8,
                    timestamp: new Date()
                };
                
                const analysis = window.TurbineAI.analyzeTelemetry(datos);
                updateAIAssistantWithAnalysis(analysis);
            }
        } else {
            // Usar datos simulados
            const datos = {
                voltaje: 75,
                amperaje: 30,
                rpm: 3000,
                velocidadViento: 8,
                timestamp: new Date()
            };
            
            const analysis = window.TurbineAI.analyzeTelemetry(datos);
            updateAIAssistantWithAnalysis(analysis);
        }
    } catch (error) {
        console.error("Error al cargar datos de turbinas:", error);
        // Usar datos simulados como fallback
        const datos = {
            voltaje: 75,
            amperaje: 30,
            rpm: 3000,
            velocidadViento: 8,
            timestamp: new Date()
        };
        
        const analysis = window.TurbineAI.analyzeTelemetry(datos);
        updateAIAssistantWithAnalysis(analysis);
    }
}

function setupPeriodicUpdates() {
    // Actualizar cada 30 segundos
    setInterval(async () => {
        const user = firebase.auth().currentUser;
        if (user && window.TurbineAI) {
            await cargarDatosTurbinas(user.uid);
        }
    }, 30000);
}

function renderAIAssistant() {
    const container = document.getElementById('ai-assistant-container');
    if (!container) return;
    
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
    
    if (!form || !input || !submit || !messages) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const question = input.value.trim();
        if (!question) return;
        
        input.disabled = true;
        submit.disabled = true;
        
        addMessage(question, 'user');
        input.value = '';
        
        if (window.TurbineAI) {
            try {
                const answer = window.TurbineAI.answerQuestion(question);
                
                setTimeout(() => {
                    addMessage(answer, 'assistant');
                    
                    input.disabled = false;
                    submit.disabled = false;
                    input.focus();
                }, 800);
                
            } catch (error) {
                console.error('Error al procesar pregunta:', error);
                addMessage('Lo siento, ocurrió un error. Por favor, intenta de nuevo.', 'assistant');
                
                input.disabled = false;
                submit.disabled = false;
                input.focus();
            }
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