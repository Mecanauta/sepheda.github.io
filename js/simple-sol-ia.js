/**
 * Implementación simplificada de IA para demostración
 * Esta versión funciona sin dependencias externas pero simula aprendizaje
 */

// Crear objeto global
window.SimpleAI = (function() {
    // Datos almacenados para "aprendizaje"
    let storedData = [];
    let trainingProgress = 0;
    let isModelTrained = false;
    
    // Normalizar datos entre 0-1 (simulando procesamiento de ML)
    function normalizeData(value, min, max) {
        return (value - min) / (max - min);
    }
    
    // Inicializar sistema
    function initialize() {
        console.log('SimpleAI inicializado correctamente');
        updateStatus('Sistema inicializado correctamente. Listo para recopilar datos.');
        return {
            status: 'success',
            message: 'Sistema inicializado correctamente'
        };
    }
    
    // Añadir datos para "entrenamiento"
    function addData(data) {
        // Asegurarse de que los datos estén en formato correcto
        const processedData = {
            timestamp: new Date(),
            voltaje: parseFloat(data.voltaje),
            amperaje: parseFloat(data.amperaje),
            rpm: parseFloat(data.rpm),
            velocidadViento: parseFloat(data.velocidadViento)
        };
        
        // Añadir a la colección
        storedData.push(processedData);
        console.log(`Datos añadidos. Total: ${storedData.length}`);
        
        // Actualizar interfaz
        updateDataCount(storedData.length);
        
        return {
            status: 'success',
            count: storedData.length
        };
    }
    
    // Entrenar el "modelo"
    function trainModel() {
        if (storedData.length < 10) {
            updateStatus('Se necesitan al menos 10 puntos de datos para entrenar el modelo.');
            return {
                status: 'error',
                message: 'Datos insuficientes para entrenamiento'
            };
        }
        
        // Simular entrenamiento con progreso
        updateStatus('Entrenando modelo...');
        trainingProgress = 0;
        
        // Usar intervalos para simular progreso de entrenamiento
        const trainingInterval = setInterval(() => {
            trainingProgress += 10;
            updateTrainingProgress(trainingProgress);
            
            // Cuando llegue a 100%, completar "entrenamiento"
            if (trainingProgress >= 100) {
                clearInterval(trainingInterval);
                isModelTrained = true;
                updateStatus('¡Entrenamiento completado! El modelo ahora puede generar predicciones e insights.');
                
                return {
                    status: 'success',
                    message: 'Modelo entrenado correctamente'
                };
            }
        }, 500);
        
        return {
            status: 'training',
            message: 'Entrenamiento iniciado'
        };
    }
    
    // Analizar datos con el "modelo entrenado"
    function analyzeData(currentData) {
        // Añadir los datos a la colección
        addData(currentData);
        
        // Calcular estadísticas básicas
        const stats = calculateStats();
        
        // Crear análisis basado en los datos
        const analysisDuration = isModelTrained ? 
            'basado en análisis de modelo entrenado con ' + storedData.length + ' puntos de datos' : 
            'basado en análisis estadístico simple';
            
        // Calcular eficiencia (simulando un modelo)
        const efficiency = calculateEfficiency(currentData, stats);
        
        // Estado de salud basado en desviaciones
        const healthScore = calculateHealthScore(currentData, stats);
        
        // Días para mantenimiento basados en patrones
        const maintenanceDays = calculateMaintenanceDays(currentData, stats);
        
        // Insights generados
        const insights = generateInsights(currentData, stats);
        
        // Actualizar la interfaz con los resultados
        updateAnalysisResults(efficiency, healthScore, maintenanceDays, insights);
        
        return {
            status: 'success',
            efficiency: {
                current: efficiency,
                trend: getTrend(efficiency),
                status: efficiency > 85 ? 'optimal' : efficiency > 70 ? 'normal' : 'warning'
            },
            healthScore: healthScore,
            maintenanceRecommendation: {
                daysUntil: maintenanceDays,
                priority: maintenanceDays < 10 ? 'high' : 'normal',
                components: ['Mantenimiento general']
            },
            insights: insights,
            aiAnalysis: `Análisis completo de la turbina ${analysisDuration}. La eficiencia actual es ${efficiency}% con un estado de salud de ${healthScore}/100. Se recomienda el próximo mantenimiento en ${maintenanceDays} días.`
        };
    }
    
    // Calcular estadísticas de los datos almacenados
    function calculateStats() {
        // Inicializar objeto para estadísticas
        const stats = {
            voltaje: { min: Infinity, max: -Infinity, avg: 0, stdDev: 0 },
            amperaje: { min: Infinity, max: -Infinity, avg: 0, stdDev: 0 },
            rpm: { min: Infinity, max: -Infinity, avg: 0, stdDev: 0 },
            velocidadViento: { min: Infinity, max: -Infinity, avg: 0, stdDev: 0 }
        };
        
        // Si no hay datos, retornar valores por defecto
        if (storedData.length === 0) {
            Object.keys(stats).forEach(key => {
                stats[key].min = 0;
                stats[key].max = 100;
                stats[key].avg = 50;
                stats[key].stdDev = 10;
            });
            return stats;
        }
        
        // Calcular mínimos, máximos y promedios
        storedData.forEach(data => {
            Object.keys(stats).forEach(key => {
                stats[key].min = Math.min(stats[key].min, data[key]);
                stats[key].max = Math.max(stats[key].max, data[key]);
                stats[key].avg += data[key];
            });
        });
        
        // Completar promedios
        Object.keys(stats).forEach(key => {
            stats[key].avg /= storedData.length;
        });
        
        // Calcular desviaciones estándar
        storedData.forEach(data => {
            Object.keys(stats).forEach(key => {
                stats[key].stdDev += Math.pow(data[key] - stats[key].avg, 2);
            });
        });
        
        Object.keys(stats).forEach(key => {
            stats[key].stdDev = Math.sqrt(stats[key].stdDev / storedData.length);
        });
        
        return stats;
    }
    
    // Calcular eficiencia simulando un modelo ML
    function calculateEfficiency(data, stats) {
        // Si el modelo está entrenado, usar una fórmula más compleja
        if (isModelTrained && storedData.length > 10) {
            // Normalizar los valores
            const normVoltaje = normalizeData(data.voltaje, stats.voltaje.min, stats.voltaje.max);
            const normAmperaje = normalizeData(data.amperaje, stats.amperaje.min, stats.amperaje.max);
            const normRpm = normalizeData(data.rpm, stats.rpm.min, stats.rpm.max);
            const normViento = normalizeData(data.velocidadViento, stats.velocidadViento.min, stats.velocidadViento.max);
            
            // Simular cálculo de una red neuronal
            const hiddenLayer1 = normVoltaje * 0.3 + normAmperaje * 0.25 + normRpm * 0.2 + normViento * 0.25;
            const hiddenLayer2 = Math.tanh(hiddenLayer1 * 1.5 - 0.5);
            const output = (hiddenLayer2 + 1) * 50; // Escalar a un rango 0-100
            
            return Math.min(95, Math.max(50, output));
        } else {
            // Fórmula simple sin modelo entrenado
            const baseline = 70;
            const voltajeFactor = Math.min(1, data.voltaje / 85) * 10;
            const amperajeFactor = Math.min(1, data.amperaje / 35) * 10;
            const windFactor = Math.min(1, data.velocidadViento / 10) * 5;
            
            return Math.min(95, baseline + voltajeFactor + amperajeFactor + windFactor);
        }
    }
    
    // Calcular puntuación de salud
    function calculateHealthScore(data, stats) {
        // Base score
        let score = 85;
        
        // Si el modelo está entrenado, usar análisis más detallado
        if (isModelTrained) {
            // Verificar desviaciones de valores óptimos
            const voltajeDeviation = Math.abs(data.voltaje - 80) / 10;
            const amperajeDeviation = Math.abs(data.amperaje - 30) / 5;
            const rpmDeviation = Math.abs(data.rpm - (data.velocidadViento * 300)) / 500;
            
            // Ajustar puntuación según desviaciones
            score -= voltajeDeviation * 5;
            score -= amperajeDeviation * 5;
            score -= rpmDeviation * 10;
            
            // Añadir factor basado en historial
            const historyFactor = Math.min(10, storedData.length / 5);
            score += historyFactor;
        } else {
            // Cálculo simple sin modelo entrenado
            if (data.voltaje < 70 || data.voltaje > 90) score -= 5;
            if (data.amperaje < 20 || data.amperaje > 45) score -= 5;
            if (data.rpm < data.velocidadViento * 250) score -= 5;
        }
        
        // Limitar rango
        return Math.min(100, Math.max(50, Math.round(score)));
    }
    
    // Calcular días hasta el próximo mantenimiento
    function calculateMaintenanceDays(data, stats) {
        // Días base
        let days = 30;
        
        // Si el modelo está entrenado, usar un cálculo más sofisticado
        if (isModelTrained) {
            // Factor de salud
            const healthScore = calculateHealthScore(data, stats);
            const healthFactor = (healthScore - 50) / 50; // 0-1
            
            // Factor de uso (basado en RPM)
            const usageFactor = normalizeData(data.rpm, stats.rpm.min, stats.rpm.max);
            
            // Fórmula ponderada
            days = Math.round(45 * healthFactor - 15 * usageFactor + 15);
        } else {
            // Ajuste simple
            if (data.voltaje < 70 || data.voltaje > 90) days -= 5;
            if (data.amperaje < 20 || data.amperaje > 45) days -= 5;
        }
        
        // Limitar rango
        return Math.max(7, Math.min(60, days));
    }
    
    // Generar insights basados en los datos
    function generateInsights(data, stats) {
        const insights = [];
        
        // Insight de eficiencia
        const efficiency = calculateEfficiency(data, stats);
        insights.push({
            id: Date.now() + '-efficiency',
            type: 'efficiency',
            message: `La turbina está operando al ${efficiency.toFixed(1)}% de eficiencia ${isModelTrained ? 'según análisis del modelo' : 'según estimación básica'}.`,
            timestamp: new Date(),
            priority: efficiency > 85 ? 'info' : efficiency > 70 ? 'normal' : 'high'
        });
        
        // Insight basado en velocidad del viento
        if (data.velocidadViento < 3) {
            insights.push({
                id: Date.now() + '-low-wind',
                type: 'wind',
                message: 'Velocidad del viento baja. Rendimiento reducido es normal en estas condiciones.',
                timestamp: new Date(),
                priority: 'info'
            });
        } else if (data.velocidadViento > 15) {
            insights.push({
                id: Date.now() + '-high-wind',
                type: 'wind',
                message: 'Velocidad del viento cercana al límite superior. El sistema de protección podría activarse.',
                timestamp: new Date(),
                priority: 'normal'
            });
        }
        
        // Si el modelo está entrenado, añadir insights más sofisticados
        if (isModelTrained) {
            // Analizar voltaje
            if (Math.abs(data.voltaje - stats.voltaje.avg) > 1.5 * stats.voltaje.stdDev) {
                insights.push({
                    id: Date.now() + '-voltage-anomaly',
                    type: 'anomaly',
                    message: `Anomalía detectada en voltaje (${data.voltaje}V). Desviación de ${((data.voltaje - stats.voltaje.avg) / stats.voltaje.stdDev).toFixed(1)} unidades estándar.`,
                    timestamp: new Date(),
                    priority: 'high'
                });
            }
            
            // Analizar correlación RPM/viento
            const idealRpm = data.velocidadViento * 300;
            const rpmDeviation = Math.abs(data.rpm - idealRpm) / idealRpm * 100;
            
            if (rpmDeviation > 15) {
                insights.push({
                    id: Date.now() + '-rpm-wind-correlation',
                    type: 'correlation',
                    message: `Correlación anormal entre RPM y velocidad del viento. Desviación del ${rpmDeviation.toFixed(1)}% respecto al valor ideal.`,
                    timestamp: new Date(),
                    priority: rpmDeviation > 25 ? 'high' : 'normal'
                });
            }
            
            // Insight de predicción (simulado)
            if (Math.random() > 0.5) {
                insights.push({
                    id: Date.now() + '-prediction',
                    type: 'prediction',
                    message: `Basado en patrones analizados en ${storedData.length} puntos de datos, se prevé un ${Math.random() > 0.5 ? 'aumento' : 'descenso'} de eficiencia del ${(Math.random() * 5).toFixed(1)}% en las próximas horas.`,
                    timestamp: new Date(),
                    priority: 'normal'
                });
            }
        }
        
        // Insight de mantenimiento
        const maintenanceDays = calculateMaintenanceDays(data, stats);
        insights.push({
            id: Date.now() + '-maintenance',
            type: 'maintenance',
            message: `Próximo mantenimiento recomendado en ${maintenanceDays} días ${isModelTrained ? 'según análisis predictivo' : 'según programa regular'}.`,
            timestamp: new Date(),
            priority: maintenanceDays < 10 ? 'high' : 'normal'
        });
        
        return insights;
    }
    
    // Obtener tendencia
    function getTrend(value) {
        // Simular una tendencia
        const trends = [
            '+2.1% respecto a la semana anterior',
            '+1.5% respecto a la semana anterior',
            '+0.7% respecto a la semana anterior',
            'Sin cambios significativos',
            '-0.8% respecto a la semana anterior',
            '-1.2% respecto a la semana anterior'
        ];
        
        return trends[Math.floor(Math.random() * trends.length)];
    }
    
    // Responder a preguntas usando los datos acumulados
    function answerQuestion(question) {
        return new Promise((resolve) => {
            // Versión simple: buscar palabras clave y generar respuestas
            question = question.toLowerCase();
            
            // Obtener datos recientes y estadísticas
            const currentData = storedData.length > 0 ? storedData[storedData.length - 1] : {
                voltaje: 80,
                amperaje: 30,
                rpm: 3000,
                velocidadViento: 10
            };
            
            const stats = calculateStats();
            const efficiency = calculateEfficiency(currentData, stats);
            const healthScore = calculateHealthScore(currentData, stats);
            const maintenanceDays = calculateMaintenanceDays(currentData, stats);
            
            // Base de conocimiento ampliada
            let answer = "";
            
            // Mostrar que estamos usando un modelo "entrenado" si corresponde
            const modelPrefix = isModelTrained ? 
                `Basado en el análisis de ${storedData.length} puntos de datos históricos, ` : 
                `Basado en mi análisis inicial, `;
            
            // Respuestas según palabras clave
            if (question.includes('eficiencia') || question.includes('rendimiento')) {
                answer = `${modelPrefix}la eficiencia actual de la turbina es del ${efficiency.toFixed(1)}%. `;
                
                if (isModelTrained) {
                    answer += `Este valor se ha calculado teniendo en cuenta la correlación entre la velocidad del viento (${currentData.velocidadViento} m/s) y las RPM generadas (${currentData.rpm}).`;
                } else {
                    answer += `Este es un cálculo básico basado en los parámetros actuales de operación.`;
                }
            } 
            else if (question.includes('mantenimiento') || question.includes('próximo')) {
                answer = `${modelPrefix}el próximo mantenimiento está recomendado en ${maintenanceDays} días. `;
                
                if (isModelTrained) {
                    const components = [];
                    if (Math.abs(currentData.voltaje - stats.voltaje.avg) > stats.voltaje.stdDev) components.push("sistema eléctrico");
                    if (Math.abs(currentData.rpm - (currentData.velocidadViento * 300)) > 300) components.push("rodamientos");
                    if (components.length > 0) {
                        answer += `Se recomienda revisar especialmente: ${components.join(", ")}.`;
                    } else {
                        answer += `Se trata de un mantenimiento preventivo regular.`;
                    }
                } else {
                    answer += `Esta recomendación se basa en el programa de mantenimiento estándar.`;
                }
            }
            else if (question.includes('problema') || question.includes('anomalía')) {
                const anomalies = [];
                
                if (isModelTrained) {
                    // Detectar anomalías estadísticas
                    if (Math.abs(currentData.voltaje - stats.voltaje.avg) > 1.5 * stats.voltaje.stdDev) {
                        anomalies.push(`voltaje anormal (${currentData.voltaje}V, desviación de ${((currentData.voltaje - stats.voltaje.avg) / stats.voltaje.stdDev).toFixed(1)} unidades estándar)`);
                    }
                    
                    const idealRpm = currentData.velocidadViento * 300;
                    const rpmDeviation = Math.abs(currentData.rpm - idealRpm) / idealRpm * 100;
                    if (rpmDeviation > 15) {
                        anomalies.push(`correlación anormal entre RPM y velocidad del viento (desviación del ${rpmDeviation.toFixed(1)}%)`);
                    }
                    
                    if (Math.abs(currentData.amperaje - stats.amperaje.avg) > 1.5 * stats.amperaje.stdDev) {
                        anomalies.push(`amperaje anormal (${currentData.amperaje}A, desviación de ${((currentData.amperaje - stats.amperaje.avg) / stats.amperaje.stdDev).toFixed(1)} unidades estándar)`);
                    }
                } else {
                    // Detección simple sin modelo entrenado
                    if (currentData.voltaje < 70 || currentData.voltaje > 90) {
                        anomalies.push(`voltaje fuera del rango óptimo (${currentData.voltaje}V)`);
                    }
                    if (currentData.amperaje < 20 || currentData.amperaje > 45) {
                        anomalies.push(`amperaje fuera del rango óptimo (${currentData.amperaje}A)`);
                    }
                    if (currentData.rpm < currentData.velocidadViento * 250) {
                        anomalies.push(`RPM bajas para la velocidad del viento actual`);
                    }
                }
                
                if (anomalies.length > 0) {
                    answer = `${modelPrefix}he detectado las siguientes anomalías: ${anomalies.join("; ")}.`;
                } else {
                    answer = `${modelPrefix}no he detectado anomalías significativas en el funcionamiento actual. La puntuación de salud general es ${healthScore}/100.`;
                }
            }
            else if (question.includes('producción') || question.includes('energía') || question.includes('genera')) {
                const produccion = (currentData.voltaje * currentData.amperaje / 1000).toFixed(2);
                answer = `${modelPrefix}la producción energética actual es de aproximadamente ${produccion} kW. `;
                
                if (isModelTrained) {
                    const avgProduction = (stats.voltaje.avg * stats.amperaje.avg / 1000).toFixed(2);
                    answer += `Esto es ${parseFloat(produccion) > parseFloat(avgProduction) ? 'superior' : 'inferior'} al promedio histórico de ${avgProduction} kW observado en los datos analizados.`;
                } else {
                    answer += `Esta estimación se basa en los valores actuales de voltaje y amperaje.`;
                }
            }
            else if (question.includes('viento') || question.includes('clima')) {
                answer = `${modelPrefix}la velocidad actual del viento es de ${currentData.velocidadViento} m/s, que está `;
                
                if (currentData.velocidadViento < 3) {
                    answer += `por debajo del rango óptimo para esta turbina. Esto explica la producción reducida actual.`;
                } else if (currentData.velocidadViento > 15) {
                    answer += `cerca del límite superior recomendado para esta turbina. El sistema de protección podría activarse si aumenta más.`;
                } else {
                    answer += `dentro del rango óptimo para esta turbina, lo que permite una generación eficiente.`;
                }
            }
            else if (question.includes('comparar') || question.includes('otras turbinas')) {
                answer = `${modelPrefix}esta turbina está operando `;
                
                if (efficiency > 85) {
                    answer += `por encima del promedio de turbinas similares. Su eficiencia del ${efficiency.toFixed(1)}% es aproximadamente un 15% superior a la media del sector.`;
                } else if (efficiency > 75) {
                    answer += `dentro del rango promedio para turbinas similares. Su eficiencia del ${efficiency.toFixed(1)}% está en línea con lo esperado para este modelo.`;
                } else {
                    answer += `ligeramente por debajo del promedio para turbinas similares. Su eficiencia actual del ${efficiency.toFixed(1)}% podría mejorarse con ajustes o mantenimiento.`;
                }
            }
            else if (question.includes('predicción') || question.includes('futuro')) {
                answer = `${modelPrefix}`;
                
                if (isModelTrained) {
                    // Simular una predicción basada en datos
                    const trends = [
                        `preveo que la eficiencia ${Math.random() > 0.5 ? 'aumentará' : 'disminuirá'} aproximadamente un ${(Math.random() * 5).toFixed(1)}% en las próximas horas`,
                        `anticipo que la producción energética ${Math.random() > 0.5 ? 'mejorará' : 'se reducirá'} en un ${(Math.random() * 7).toFixed(1)}% si las condiciones de viento se mantienen`,
                        `existe una probabilidad del ${Math.floor(60 + Math.random() * 30)}% de que la turbina mantenga su rendimiento actual durante las próximas 24 horas`
                    ];
                    
                    answer += trends[Math.floor(Math.random() * trends.length)] + `. Esta predicción se basa en el análisis de patrones en los ${storedData.length} puntos de datos históricos recopilados.`;
                } else {
                    answer += `necesito recopilar más datos y entrenar el modelo para poder ofrecer predicciones precisas sobre el rendimiento futuro de la turbina.`;
                }
            }
            else {
                // Respuesta general
                answer = `${modelPrefix}puedo proporcionarte información sobre la turbina basada en ${isModelTrained ? 'el análisis de los datos históricos recopilados' : 'los datos básicos disponibles'}. Puedes preguntarme sobre eficiencia, mantenimiento, problemas detectados, producción energética o condiciones de viento.`;
            }
            
            // Simular un pequeño retardo para que parezca que está "pensando"
            setTimeout(() => {
                resolve(answer);
            }, 500);
        });
    }
    
    // Actualizar UI (estas funciones deben definirse en la página HTML)
    function updateStatus(message) {
        const statusElement = document.getElementById('ai-training-status');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }
    
    function updateDataCount(count) {
        // Actualizar contador de datos
        const countElement = document.querySelector('.data-count');
        if (countElement) {
            countElement.textContent = count;
        }
        
        // Actualizar barra de progreso
        const progressBar = document.getElementById('ai-training-progress');
        if (progressBar) {
            const progress = Math.min(100, (count / 30) * 100);
            progressBar.style.width = progress + '%';
        }
    }
    
    function updateTrainingProgress(progress) {
        const progressBar = document.getElementById('ai-training-progress');
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
    }
    
    function updateAnalysisResults(efficiency, healthScore, maintenanceDays, insights) {
        // Esta función puede implementarse en la página HTML si es necesario
        console.log('Resultados de análisis actualizados:', {efficiency, healthScore, maintenanceDays, insights});
    }
    
    // Interfaz pública
    return {
        initialize: initialize,
        addData: addData,
        trainModel: trainModel,
        analyzeData: analyzeData,
        answerQuestion: answerQuestion,
        getDataCount: () => storedData.length,
        isModelTrained: () => isModelTrained
    };
})();

// Inicializar cuando la página esté lista
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando SimpleAI...');
    window.SimpleAI.initialize();
});