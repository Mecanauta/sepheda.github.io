/**
 * Script de diagnóstico para verificar la carga de todos los componentes
 * Coloca este script al inicio de la página para detectar problemas
 */

// Crear un objeto global para diagnóstico
window.AISystemDiagnostic = {
    scriptStatuses: {
        tensorflow: false,
        turbineAI: false,
        realTurbineAI: false,
        integration: false
    },
    
    errors: [],
    
    // Registrar un error
    logError: function(source, error) {
        console.error(`[DIAGNÓSTICO ERROR] [${source}]`, error);
        this.errors.push({
            source: source,
            timestamp: new Date(),
            error: error
        });
        this.updateDiagnosticUI();
    },
    
    // Marcar un script como cargado
    markScriptLoaded: function(scriptName) {
        console.log(`[DIAGNÓSTICO] Script cargado: ${scriptName}`);
        this.scriptStatuses[scriptName] = true;
        this.updateDiagnosticUI();
    },
    
    // Verificar disponibilidad de objetos globales
    checkGlobalObjects: function() {
        console.log('[DIAGNÓSTICO] Verificando objetos globales disponibles...');
        
        const diagnosticResults = {
            tensorflowAvailable: typeof tf !== 'undefined',
            turbineAIAvailable: typeof window.TurbineAI !== 'undefined',
            realTurbineAIAvailable: typeof window.RealTurbineAI !== 'undefined',
            integrationAvailable: typeof window.RealAIIntegration !== 'undefined'
        };
        
        console.table(diagnosticResults);
        return diagnosticResults;
    },
    
    // Actualizar interfaz de diagnóstico
    updateDiagnosticUI: function() {
        const diagElement = document.getElementById('ai-system-diagnostic');
        
        if (!diagElement) return;
        
        // Verificar estados actuales
        const objects = this.checkGlobalObjects();
        
        // Actualizar contenido
        diagElement.innerHTML = `
            <div style="padding: 15px; background-color: #f8fafc; border-radius: 8px; margin-bottom: 20px; font-family: system-ui, sans-serif;">
                <h3 style="margin-top: 0; color: #0f172a;">Diagnóstico del Sistema de IA</h3>
                
                <div style="margin-bottom: 10px;">
                    <h4 style="margin-bottom: 5px; color: #334155;">Estado de Componentes:</h4>
                    <ul style="list-style: none; padding-left: 5px; margin-top: 5px;">
                        <li style="display: flex; align-items: center; margin-bottom: 5px;">
                            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 8px; background-color: ${objects.tensorflowAvailable ? '#10b981' : '#ef4444'};"></span>
                            <span>TensorFlow.js: ${objects.tensorflowAvailable ? 'Disponible' : 'No disponible'}</span>
                        </li>
                        <li style="display: flex; align-items: center; margin-bottom: 5px;">
                            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 8px; background-color: ${objects.turbineAIAvailable ? '#10b981' : '#ef4444'};"></span>
                            <span>TurbineAI (legacy): ${objects.turbineAIAvailable ? 'Disponible' : 'No disponible'}</span>
                        </li>
                        <li style="display: flex; align-items: center; margin-bottom: 5px;">
                            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 8px; background-color: ${objects.realTurbineAIAvailable ? '#10b981' : '#ef4444'};"></span>
                            <span>RealTurbineAI (entrenamiento): ${objects.realTurbineAIAvailable ? 'Disponible' : 'No disponible'}</span>
                        </li>
                        <li style="display: flex; align-items: center; margin-bottom: 5px;">
                            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 8px; background-color: ${objects.integrationAvailable ? '#10b981' : '#ef4444'};"></span>
                            <span>Integración de IA: ${objects.integrationAvailable ? 'Disponible' : 'No disponible'}</span>
                        </li>
                    </ul>
                </div>
                
                ${this.errors.length > 0 ? `
                <div>
                    <h4 style="margin-bottom: 5px; color: #b91c1c;">Errores Detectados (${this.errors.length}):</h4>
                    <ul style="padding-left: 20px; margin-top: 5px;">
                        ${this.errors.map(error => `
                            <li style="margin-bottom: 3px;">
                                <strong>${error.source}:</strong> ${typeof error.error === 'string' ? error.error : error.error.message || 'Error desconocido'}
                            </li>
                        `).join('')}
                    </ul>
                </div>
                ` : ''}
                
                <div style="margin-top: 10px;">
                    <button id="btn-force-reinit" style="padding: 6px 12px; background-color: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Forzar Reinicialización
                    </button>
                    <button id="btn-check-paths" style="padding: 6px 12px; margin-left: 10px; background-color: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Verificar Rutas
                    </button>
                </div>
            </div>
        `;
        
        // Configurar eventos para botones
        const reinitBtn = document.getElementById('btn-force-reinit');
        if (reinitBtn) {
            reinitBtn.addEventListener('click', this.forceReinitialization);
        }
        
        const checkPathsBtn = document.getElementById('btn-check-paths');
        if (checkPathsBtn) {
            checkPathsBtn.addEventListener('click', this.checkScriptPaths);
        }
    },
    
    // Forzar reinicialización de sistemas
    forceReinitialization: function() {
        console.log('[DIAGNÓSTICO] Forzando reinicialización de sistemas de IA...');
        
        // Intentar cargar RealTurbineAI manualmente
        if (!window.RealTurbineAI) {
            try {
                const script = document.createElement('script');
                script.src = 'js/real-ai-model.js';
                script.onload = function() {
                    console.log('[DIAGNÓSTICO] Script real-ai-model.js cargado manualmente');
                    if (window.RealTurbineAI) {
                        window.RealTurbineAI.initialize().then(result => {
                            console.log('[DIAGNÓSTICO] RealTurbineAI inicializado manualmente:', result);
                            window.AISystemDiagnostic.updateDiagnosticUI();
                        }).catch(error => {
                            window.AISystemDiagnostic.logError('RealTurbineAI-Init', error);
                        });
                    } else {
                        window.AISystemDiagnostic.logError('RealTurbineAI-Load', 'Script cargado pero objeto RealTurbineAI no disponible');
                    }
                };
                script.onerror = function(error) {
                    window.AISystemDiagnostic.logError('RealTurbineAI-Load', error || 'Error al cargar script');
                };
                document.head.appendChild(script);
            } catch (error) {
                window.AISystemDiagnostic.logError('Script-Load', error);
            }
        }
        
        // Intentar reinicializar TurbineAI si está disponible
        if (window.TurbineAI) {
            try {
                window.TurbineAI.initialize();
                console.log('[DIAGNÓSTICO] TurbineAI reinicializado');
            } catch (error) {
                window.AISystemDiagnostic.logError('TurbineAI-Reinit', error);
            }
        }
        
        // Actualizar la interfaz de diagnóstico
        setTimeout(() => {
            window.AISystemDiagnostic.updateDiagnosticUI();
        }, 1000);
    },
    
    // Verificar rutas de scripts
    checkScriptPaths: function() {
        console.log('[DIAGNÓSTICO] Verificando rutas de scripts...');
        
        const scripts = [
            { path: 'js/ai-turbine-analysis.js', name: 'TurbineAI' },
            { path: 'js/real-ai-model.js', name: 'RealTurbineAI' },
            { path: 'js/real-ai-integration.js', name: 'Integración' }
        ];
        
        scripts.forEach(script => {
            const xhr = new XMLHttpRequest();
            xhr.open('HEAD', script.path, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        console.log(`[DIAGNÓSTICO] Script ${script.name} disponible en: ${script.path}`);
                    } else {
                        window.AISystemDiagnostic.logError('Path-Check', `Script ${script.name} no encontrado en: ${script.path} (${xhr.status})`);
                    }
                }
            };
            xhr.send();
        });
    }
};

// Auto-iniciar la interfaz después de la carga completa
document.addEventListener('DOMContentLoaded', function() {
    console.log('[DIAGNÓSTICO] DOMContentLoaded - Creando interfaz de diagnóstico');
    
    // Crear elemento de diagnóstico
    const diagContainer = document.createElement('div');
    diagContainer.id = 'ai-system-diagnostic';
    
    // Insertar al inicio del contenedor principal
    const mainContainer = document.querySelector('.sepheia-container');
    if (mainContainer) {
        mainContainer.insertBefore(diagContainer, mainContainer.firstChild);
        window.AISystemDiagnostic.updateDiagnosticUI();
    }
    
    // Configurar verificaciones de TensorFlow
    if (typeof tf !== 'undefined') {
        window.AISystemDiagnostic.markScriptLoaded('tensorflow');
    } else {
        window.AISystemDiagnostic.logError('TensorFlow', 'No disponible al cargar la página');
    }
});

// Verificar carga de scripts periódicamente
setInterval(function() {
    const objects = window.AISystemDiagnostic.checkGlobalObjects();
    
    if (objects.turbineAIAvailable && !window.AISystemDiagnostic.scriptStatuses.turbineAI) {
        window.AISystemDiagnostic.markScriptLoaded('turbineAI');
    }
    
    if (objects.realTurbineAIAvailable && !window.AISystemDiagnostic.scriptStatuses.realTurbineAI) {
        window.AISystemDiagnostic.markScriptLoaded('realTurbineAI');
    }
    
    if (objects.integrationAvailable && !window.AISystemDiagnostic.scriptStatuses.integration) {
        window.AISystemDiagnostic.markScriptLoaded('integration');
    }
}, 1000);

console.log('[DIAGNÓSTICO] Script de diagnóstico inicializado');