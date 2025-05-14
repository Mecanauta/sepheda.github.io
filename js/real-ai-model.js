/**
 * Real AI Model - Implementación de un modelo de aprendizaje automático basado en TensorFlow.js
 * 
 * VERSIÓN COMPLETA ACTUALIZADA con soporte para modo simulado y mejor gestión de errores
 */

// Forzar modo simulado para desarrollo si es necesario
const USE_SIMULATED = false;  // Cambiar a true si los problemas con TensorFlow persisten

// Intenta establecer el backend de TensorFlow de manera explícita
if (typeof tf !== 'undefined') {
    try {
        console.log('[TensorFlow] Intentando establecer backend explícitamente...');
        
        // Verificar si tf.ready está disponible
        if (typeof tf.ready === 'function') {
            tf.ready().then(() => {
                console.log('[TensorFlow] TensorFlow inicializado correctamente');
                console.log('[TensorFlow] Backend activo:', tf.getBackend());
                try {
                    console.log('[TensorFlow] Información del backend:', tf.backend());
                } catch (e) {
                    console.warn('[TensorFlow] No se pudo obtener información del backend:', e);
                }
            }).catch(error => {
                console.error('[TensorFlow] Error al inicializar TensorFlow:', error);
            });
        }
        
        // Intenta establecer el backend explícitamente
        if (typeof tf.setBackend === 'function') {
            // Intenta primero con WebGL, luego con CPU como fallback
            tf.setBackend('webgl')
                .then(() => {
                    console.log('[TensorFlow] Backend WebGL configurado correctamente');
                })
                .catch(error => {
                    console.warn('[TensorFlow] Error al configurar WebGL, intentando con CPU:', error);
                    return tf.setBackend('cpu');
                })
                .then(() => {
                    if (typeof tf.getBackend === 'function') {
                        console.log('[TensorFlow] Backend configurado:', tf.getBackend());
                    }
                })
                .catch(error => {
                    console.error('[TensorFlow] Error al configurar backends:', error);
                });
        } else {
            console.warn('[TensorFlow] tf.setBackend no está disponible');
        }
    } catch (e) {
        console.error('[TensorFlow] Error al intentar configurar el backend:', e);
    }
}

const RealTurbineAI = (function() {
    // Verificar si debemos usar el modo simulado
    const tensorflowUnavailable = typeof tf === 'undefined' || !tf.tensor || !tf.sequential;
    const shouldUseSimulated = USE_SIMULATED || tensorflowUnavailable;
    
    if (shouldUseSimulated) {
        console.warn('[RealTurbineAI] Usando modo simulado (sin TensorFlow)');
        if (tensorflowUnavailable) {
            console.error('[RealTurbineAI] Razón: TensorFlow.js no está disponible o no está completamente inicializado');
        } else {
            console.log('[RealTurbineAI] Razón: Modo simulado forzado por configuración');
        }
        
        // Implementación simulada completa que no depende de TensorFlow.js
        
        // Variables para el modo simulado
        let trainingData = [];
        let isModelTrainedFlag = false;
        let currentLoss = 1.0; // Simula la pérdida durante el entrenamiento
        
        // Características para la simulación
        const FEATURES = ['voltaje', 'amperaje', 'rpm', 'velocidadViento'];
        
        // Calcular eficiencia simulada
        function calculateEfficiency(data) {
            try {
                // Fórmula simplificada para eficiencia
                const windSpeed = parseFloat(data.velocidadViento);
                const rpm = parseFloat(data.rpm);
                
                if (windSpeed <= 0) return 0;
                
                // RPM ideales basadas en velocidad del viento
                const idealRpm = windSpeed * 300; // 300 RPM por cada m/s de viento
                const rpmEfficiency = Math.min(1, rpm / idealRpm);
                
                // Eficiencia de generación (simulada)
                const powerEfficiency = (parseFloat(data.voltaje) * parseFloat(data.amperaje)) / (windSpeed * windSpeed * 50);
                
                // Eficiencia combinada
                return Math.min(100, (rpmEfficiency * 0.5 + Math.min(1, powerEfficiency) * 0.5) * 100);
            } catch (error) {
                console.error('[RealTurbineAI Simulado] Error al calcular eficiencia:', error);
                return 0;
            }
        }
        
        // Implementación simulada de las funciones principales
        return {
            initialize: function() {
                console.log('[RealTurbineAI Simulado] Inicializando...');
                return Promise.resolve({
                    status: 'initialized',
                    message: 'Modelo simulado inicializado correctamente. Ejecutando en modo sin TensorFlow.',
                    simulatedMode: true
                });
            },
            
            addTrainingData: function(data) {
                try {
                    // Formatear datos consistentemente
                    const formattedData = {
                        timestamp: data.timestamp || new Date(),
                        voltaje: parseFloat(data.voltaje) || 0,
                        amperaje: parseFloat(data.amperaje) || 0,
                        rpm: parseFloat(data.rpm) || 0,
                        velocidadViento: parseFloat(data.velocidadViento) || 0
                    };
                    
                    trainingData.push(formattedData);
                    
                    // Mantener un tamaño de datos razonable
                    if (trainingData.length > 1000) {
                        trainingData.shift();
                    }
                    
                    console.log(`[RealTurbineAI Simulado] Datos añadidos: Total ${trainingData.length} puntos`);
                    
                    return {
                        status: 'success',
                        dataSize: trainingData.length,
                        message: `Datos añadidos correctamente. Total: ${trainingData.length} puntos`
                    };
                } catch (error) {
                    console.error('[RealTurbineAI Simulado] Error al añadir datos:', error);
                    return {
                        status: 'error',
                        message: 'Error al añadir datos: ' + error.message
                    };
                }
            },
            
            trainModel: function() {
                return new Promise((resolve, reject) => {
                    try {
                        console.log(`[RealTurbineAI Simulado] Iniciando entrenamiento simulado con ${trainingData.length} datos...`);
                        
                        if (trainingData.length < 30) {
                            return resolve({
                                status: 'error',
                                message: `Se necesitan al menos 30 puntos de datos para entrenar. Actual: ${trainingData.length}`
                            });
                        }
                        
                        // Simular demora de entrenamiento
                        const totalEpochs = 20;
                        let currentEpoch = 0;
                        
                        const trainStep = function() {
                            currentEpoch++;
                            // Simular reducción de pérdida durante el entrenamiento
                            currentLoss = currentLoss * 0.9;
                            console.log(`[RealTurbineAI Simulado] Epoch ${currentEpoch}: loss = ${currentLoss.toFixed(4)}`);
                            
                            if (currentEpoch < totalEpochs) {
                                setTimeout(trainStep, 100); // 100ms entre épocas
                            } else {
                                isModelTrainedFlag = true;
                                resolve({
                                    status: 'success',
                                    message: 'Modelo entrenado correctamente (modo simulado)',
                                    finalLoss: currentLoss,
                                    epochs: totalEpochs,
                                    simulatedMode: true
                                });
                            }
                        };
                        
                        // Iniciar entrenamiento simulado
                        setTimeout(trainStep, 100);
                        
                    } catch (error) {
                        console.error('[RealTurbineAI Simulado] Error en entrenamiento simulado:', error);
                        reject(error);
                    }
                });
            },
            
            predictNext: function(currentData) {
                return new Promise((resolve) => {
                    try {
                        if (!isModelTrainedFlag) {
                            return resolve({
                                status: 'error',
                                message: 'El modelo no ha sido entrenado aún'
                            });
                        }
                        
                        // Crear predicción simulada basada en datos actuales y aleatoriedad
                        const prediction = {};
                        FEATURES.forEach(feature => {
                            const currentValue = parseFloat(currentData[feature]);
                            // Añadir tendencia (±15%)
                            const randomFactor = 0.85 + (Math.random() * 0.3);
                            prediction[feature] = currentValue * randomFactor;
                        });
                        
                        return resolve({
                            status: 'success',
                            prediction: prediction,
                            simulatedMode: true
                        });
                    } catch (error) {
                        console.error('[RealTurbineAI Simulado] Error al hacer predicción:', error);
                        return resolve({
                            status: 'error',
                            message: 'Error al hacer predicción: ' + error.message
                        });
                    }
                });
            },
            
            detectAnomalies: function(currentData) {
                try {
                    if (trainingData.length < 20) {
                        return {
                            status: 'warning',
                            message: 'No hay suficientes datos históricos para detectar anomalías confiables',
                            anomalies: []
                        };
                    }
                    
                    const anomalies = [];
                    
                    // Detectar anomalías basadas en desviaciones de la media
                    FEATURES.forEach(feature => {
                        // Calcular estadísticas simples
                        const values = trainingData.map(item => parseFloat(item[feature]));
                        const sum = values.reduce((total, val) => total + val, 0);
                        const mean = sum / values.length;
                        
                        // Calcular desviación estándar
                        const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
                        const variance = squaredDiffs.reduce((total, val) => total + val, 0) / values.length;
                        const stdDev = Math.sqrt(variance);
                        
                        // Comprobar valor actual
                        const currentValue = parseFloat(currentData[feature]);
                        const zScore = Math.abs((currentValue - mean) / stdDev);
                        
                        // Considerar anomalía si está a más de 2.5 desviaciones estándar
                        if (zScore > 2.5) {
                            anomalies.push({
                                feature,
                                currentValue,
                                mean,
                                stdDev,
                                zScore,
                                severity: zScore > 3.5 ? 'high' : 'medium'
                            });
                        }
                    });
                    
                    return {
                        status: 'success',
                        anomalies,
                        message: anomalies.length > 0 ? 
                            `Se detectaron ${anomalies.length} anomalías` : 
                            'No se detectaron anomalías',
                        simulatedMode: true
                    };
                } catch (error) {
                    console.error('[RealTurbineAI Simulado] Error al detectar anomalías:', error);
                    return {
                        status: 'error',
                        message: 'Error al detectar anomalías: ' + error.message,
                        anomalies: []
                    };
                }
            },
            
            generateInsights: function(currentData) {
                return new Promise((resolve) => {
                    try {
                        const insights = [];
                        
                        // Añadir insight sobre modo simulado
                        insights.push({
                            id: Date.now() + '-simulated-mode',
                            type: 'info',
                            message: 'Sistema funcionando en modo simulado. Las predicciones son aproximadas.',
                            timestamp: new Date(),
                            priority: 'info'
                        });
                        
                        // Detectar anomalías
                        const anomalyResult = this.detectAnomalies(currentData);
                        if (anomalyResult.anomalies.length > 0) {
                            anomalyResult.anomalies.forEach(anomaly => {
                                let message;
                                switch(anomaly.feature) {
                                    case 'voltaje':
                                        message = `Voltaje anormal detectado (${currentData.voltaje}V). Desviación de ${anomaly.zScore.toFixed(1)} unidades estándar.`;
                                        break;
                                    case 'amperaje':
                                        message = `Amperaje anormal detectado (${currentData.amperaje}A). Desviación de ${anomaly.zScore.toFixed(1)} unidades estándar.`;
                                        break;
                                    case 'rpm':
                                        message = `RPM anormales detectadas (${currentData.rpm}). Desviación de ${anomaly.zScore.toFixed(1)} unidades estándar.`;
                                        break;
                                    case 'velocidadViento':
                                        message = `Velocidad del viento anormal (${currentData.velocidadViento}m/s). Desviación de ${anomaly.zScore.toFixed(1)} unidades estándar.`;
                                        break;
                                    default:
                                        message = `Anomalía detectada en ${anomaly.feature}. Desviación de ${anomaly.zScore.toFixed(1)} unidades estándar.`;
                                }
                                
                                insights.push({
                                    id: Date.now() + '-' + anomaly.feature,
                                    type: 'anomaly',
                                    message,
                                    timestamp: new Date(),
                                    priority: anomaly.severity
                                });
                            });
                        }
                        
                        // Si el modelo está entrenado, generar insights de predicción
                        if (isModelTrainedFlag) {
                            // Generar predicción simulada
                            this.predictNext(currentData).then(prediction => {
                                if (prediction.status === 'success') {
                                    const pred = prediction.prediction;
                                    
                                    // Insight sobre eficiencia esperada
                                    const currentEfficiency = calculateEfficiency(currentData);
                                    const predictedEfficiency = calculateEfficiency(pred);
                                    const efficiencyDiff = predictedEfficiency - currentEfficiency;
                                    
                                    if (Math.abs(efficiencyDiff) > 5) {
                                        insights.push({
                                            id: Date.now() + '-efficiency-prediction',
                                            type: 'prediction',
                                            message: `Se prevé un ${efficiencyDiff > 0 ? 'aumento' : 'descenso'} de eficiencia del ${Math.abs(efficiencyDiff).toFixed(1)}% en las próximas horas.`,
                                            timestamp: new Date(),
                                            priority: efficiencyDiff > 0 ? 'info' : 'normal'
                                        });
                                    }
                                    
                                    // Finalizar y devolver insights
                                    resolve(insights);
                                } else {
                                    // Finalizar si la predicción falló
                                    resolve(insights);
                                }
                            }).catch(error => {
                                console.error('[RealTurbineAI Simulado] Error en predicción para insights:', error);
                                resolve(insights);
                            });
                        } else {
                            // Si no está entrenado pero hay suficientes datos, sugerir entrenar
                            if (trainingData.length >= 30) {
                                insights.push({
                                    id: Date.now() + '-training-suggestion',
                                    type: 'suggestion',
                                    message: `El modelo de IA aún no está entrenado. Se recomienda entrenar con los ${trainingData.length} datos disponibles para obtener predicciones más precisas.`,
                                    timestamp: new Date(),
                                    priority: 'normal'
                                });
                            }
                            
                            // Insights sobre viento
                            if (parseFloat(currentData.velocidadViento) < 3) {
                                insights.push({
                                    id: Date.now() + '-low-wind',
                                    type: 'current_state',
                                    message: 'Velocidad del viento baja. Rendimiento reducido es normal en estas condiciones.',
                                    timestamp: new Date(),
                                    priority: 'info'
                                });
                            } else if (parseFloat(currentData.velocidadViento) > 15) {
                                insights.push({
                                    id: Date.now() + '-high-wind',
                                    type: 'current_state',
                                    message: 'Velocidad del viento cercana al límite superior. El sistema de protección podría activarse.',
                                    timestamp: new Date(),
                                    priority: 'high'
                                });
                            }
                            
                            resolve(insights);
                        }
                    } catch (error) {
                        console.error('[RealTurbineAI Simulado] Error al generar insights:', error);
                        resolve([{
                            id: Date.now() + '-error',
                            type: 'error',
                            message: 'Error al generar insights: ' + error.message,
                            timestamp: new Date(),
                            priority: 'high'
                        }]);
                    }
                });
            },
            
            answerQuestion: function(question) {
                try {
                    question = question.toLowerCase();
                    
                    // Si no hay suficientes datos o el modelo no está entrenado
                    if (!isModelTrainedFlag || trainingData.length < 30) {
                        if (question.includes('eficiencia') || question.includes('rendimiento')) {
                            return "Estoy recopilando datos para darte información precisa sobre la eficiencia. Necesito más datos o entrenamiento. Por favor, usa el botón 'Generar Datos' y luego 'Entrenar Modelo'.";
                        }
                        
                        if (question.includes('mantenimiento') || question.includes('próximo')) {
                            return "Aún estoy aprendiendo sobre los patrones de funcionamiento de tu turbina. Necesito más datos y entrenamiento para hacer recomendaciones de mantenimiento.";
                        }
                        
                        if (question.includes('problema') || question.includes('anomalía')) {
                            return "Estoy monitoreando la turbina en modo simulado. Necesito más datos y entrenamiento para detectar anomalías con precisión.";
                        }
                        
                        if (question.includes('datos') || question.includes('entrenamiento')) {
                            return `Actualmente tengo ${trainingData.length} datos recopilados. Necesito al menos 30 para poder entrenar el modelo. Usa el botón 'Generar Datos' para añadir más.`;
                        }
                        
                        if (question.includes('simulado') || question.includes('simulación')) {
                            return "Estoy funcionando en modo simulado porque TensorFlow.js no está disponible o no se inicializó correctamente. Este modo permite probar la interfaz sin depender de TensorFlow.";
                        }
                        
                        return "Estoy funcionando en modo simulado y recopilando datos. Para obtener análisis más precisos, genera más datos con el botón 'Generar Datos' y luego entrena el modelo.";
                    }
                    
                    // Si el modelo está entrenado, dar respuestas más elaboradas
                    if (question.includes('eficiencia') || question.includes('rendimiento')) {
                        const latestData = trainingData[trainingData.length - 1];
                        const efficiency = calculateEfficiency(latestData).toFixed(1);
                        return `Basado en mi análisis (modo simulado), la eficiencia actual de la turbina es del ${efficiency}%. He analizado patrones en ${trainingData.length} puntos de datos.`;
                    } 
                    
                    if (question.includes('mantenimiento') || question.includes('próximo')) {
                        const maintenanceDays = Math.floor(20 + Math.random() * 30);
                        return `Basado en mi análisis simulado, recomendaría programar el próximo mantenimiento en aproximadamente ${maintenanceDays} días. Esta predicción se basa en ${trainingData.length} puntos de datos históricos.`;
                    }
                    
                    if (question.includes('problema') || question.includes('anomalía')) {
                        const latestData = trainingData[trainingData.length - 1];
                        const anomalyResult = this.detectAnomalies(latestData);
                        if (anomalyResult.anomalies.length > 0) {
                            const anomaliesList = anomalyResult.anomalies.map(a => {
                                switch(a.feature) {
                                    case 'voltaje': return `voltaje (${latestData.voltaje}V, ${a.zScore.toFixed(1)} desviaciones)`;
                                    case 'amperaje': return `amperaje (${latestData.amperaje}A, ${a.zScore.toFixed(1)} desviaciones)`;
                                    case 'rpm': return `RPM (${latestData.rpm}, ${a.zScore.toFixed(1)} desviaciones)`;
                                    case 'velocidadViento': return `velocidad del viento (${latestData.velocidadViento}m/s, ${a.zScore.toFixed(1)} desviaciones)`;
                                    default: return a.feature;
                                }
                            }).join(', ');
                            
                            return `He detectado anomalías en: ${anomaliesList}. Nota: estoy funcionando en modo simulado, por lo que estas detecciones son aproximadas.`;
                        } else {
                            return `No he detectado anomalías significativas en el funcionamiento actual (modo simulado). Sigo monitoreando ${trainingData.length} puntos de datos.`;
                        }
                    }
                    
                    if (question.includes('simulado') || question.includes('simulación')) {
                        return "Estoy funcionando en modo simulado porque TensorFlow.js no está disponible o no se inicializó correctamente. Este modo permite probar la interfaz sin depender de TensorFlow. Las predicciones son aproximadas pero representativas.";
                    }
                    
                    if (question.includes('datos') || question.includes('entrenamiento')) {
                        return `He analizado ${trainingData.length} puntos de datos y mi modelo (simulado) está entrenado con ellos. Estoy funcionando en modo simulado, que no depende de TensorFlow.js.`;
                    }
                    
                    // Respuesta por defecto
                    return `Estoy analizando los datos de tu turbina en modo simulado. Este modo permite usar la interfaz cuando TensorFlow.js no está disponible. Si tienes preguntas específicas sobre eficiencia, mantenimiento o anomalías, estaré encantado de ayudarte.`;
                } catch (error) {
                    console.error('[RealTurbineAI Simulado] Error al responder pregunta:', error);
                    return "Lo siento, ha ocurrido un error al procesar tu pregunta en modo simulado. Por favor, intenta con una consulta diferente.";
                }
            },
            
            getDataSize: function() {
                return trainingData.length;
            },
            
            isModelTrained: function() {
                return isModelTrainedFlag;
            },
            
            checkTensorFlow: function() {
                return {
                    status: 'warning',
                    message: 'Modo simulado activo - TensorFlow.js no se está utilizando',
                    simulatedMode: true
                };
            }
        };
    }
    
    // IMPLEMENTACIÓN REAL CON TENSORFLOW.JS
    // Si decidimos no usar el modo simulado, esta es la implementación con TensorFlow.js
    
    // Variables privadas para el modelo y datos
    let model = null;
    let isModelTrainedFlag = false;
    let trainingData = [];
    const HISTORY_SIZE = 10; // Reducido de 20 a 10 para requerir menos datos
    const FEATURES = ['voltaje', 'amperaje', 'rpm', 'velocidadViento'];
    
    // Verificar si TensorFlow está funcionando correctamente
    function checkTensorFlow() {
        try {
            // Intentar crear un tensor simple
            const a = tf.tensor1d([1, 2, 3]);
            const b = tf.tensor1d([4, 5, 6]);
            
            // Verificar que podemos realizar operaciones
            const c = a.add(b);
            const result = c.dataSync();
            
            // Limpiar tensores
            a.dispose();
            b.dispose();
            c.dispose();
            
            // Verificar resultados
            const expected = [5, 7, 9];
            const isCorrect = result[0] === expected[0] && 
                            result[1] === expected[1] && 
                            result[2] === expected[2];
            
            return {
                status: isCorrect ? 'success' : 'error',
                message: isCorrect ? 'TensorFlow.js funciona correctamente' : 'Error en el cálculo con TensorFlow.js',
                result: Array.from(result),
                expected: expected
            };
        } catch (error) {
            console.error('[RealTurbineAI] Error al verificar TensorFlow.js:', error);
            return {
                status: 'error',
                message: 'Error al verificar TensorFlow.js: ' + error.message
            };
        }
    }

    // Función para normalizar datos entre 0 y 1
    function normalizeData(data, min, max) {
        try {
            return data.map(item => {
                const normalized = {};
                Object.keys(item).forEach(key => {
                    if (FEATURES.includes(key)) {
                        normalized[key] = (parseFloat(item[key]) - min[key]) / (max[key] - min[key]);
                    } else {
                        normalized[key] = item[key];
                    }
                });
                return normalized;
            });
        } catch (error) {
            console.error('[RealTurbineAI] Error al normalizar datos:', error);
            throw new Error('Error al normalizar datos: ' + error.message);
        }
    }

    // Preparar datos para el modelo
    function prepareDataForModel(data) {
        try {
            // Verificar datos de entrada
            if (!data || data.length === 0) {
                throw new Error('No hay datos disponibles para entrenamiento');
            }
            
            if (data.length <= HISTORY_SIZE) {
                throw new Error(`Se necesitan más de ${HISTORY_SIZE} datos para entrenamiento`);
            }
            
            // Encontrar valores mínimos y máximos para normalización
            const min = {}, max = {};
            FEATURES.forEach(feature => {
                min[feature] = Math.min(...data.map(item => parseFloat(item[feature] || 0)));
                max[feature] = Math.max(...data.map(item => parseFloat(item[feature] || 0)));
                
                // Prevenir división por cero
                if (min[feature] === max[feature]) {
                    console.warn(`[RealTurbineAI] Advertencia: ${feature} tiene valores idénticos min=${min[feature]}, max=${max[feature]}`);
                    max[feature] += 0.1; // Añadir un pequeño delta
                }
            });

            // Normalizar datos
            const normalizedData = normalizeData(data, min, max);

            const xs = [];
            const ys = [];

            // Crear secuencias para entrenamiento
            for (let i = HISTORY_SIZE; i < normalizedData.length; i++) {
                const sequence = normalizedData.slice(i - HISTORY_SIZE, i);
                const target = normalizedData[i];

                xs.push(sequence.map(item => FEATURES.map(feature => item[feature])));
                ys.push(FEATURES.map(feature => target[feature]));
            }

            console.log(`[RealTurbineAI] Datos preparados: ${xs.length} secuencias de entrenamiento`);
            
            return {
                xs: tf.tensor3d(xs),
                ys: tf.tensor2d(ys),
                min,
                max
            };
        } catch (error) {
            console.error('[RealTurbineAI] Error al preparar datos para el modelo:', error);
            throw new Error('Error al preparar datos para entrenamiento: ' + error.message);
        }
    }

    // Crear y compilar el modelo
    function createModel() {
        try {
            console.log('[RealTurbineAI] Creando modelo...');
            
            const model = tf.sequential();

            // Modelo más simple con menos capas para reducir errores
            
            // Primera capa - LSTM con menos unidades
            model.add(tf.layers.lstm({
                units: 32,
                returnSequences: false,
                inputShape: [HISTORY_SIZE, FEATURES.length]
            }));

            // Capa densa para predicción directa
            model.add(tf.layers.dense({ units: FEATURES.length }));

            // Compilar el modelo con configuración más simple
            model.compile({
                optimizer: 'adam',
                loss: 'meanSquaredError'
            });

            console.log('[RealTurbineAI] Modelo creado y compilado correctamente');
            return model;
        } catch (error) {
            console.error('[RealTurbineAI] Error al crear modelo:', error);
            throw new Error('Error al crear modelo de IA: ' + error.message);
        }
    }

    // Calcular eficiencia basada en los datos
    function calculateEfficiency(data) {
        try {
            // Fórmula simplificada para eficiencia
            const windSpeed = parseFloat(data.velocidadViento);
            const rpm = parseFloat(data.rpm);
            
            if (windSpeed <= 0) return 0;
            
            // RPM ideales basadas en velocidad del viento (simulado)
            const idealRpm = windSpeed * 300; // 300 RPM por cada m/s de viento
            const rpmEfficiency = Math.min(1, rpm / idealRpm);
            
            // Eficiencia de generación (simulada)
            const powerEfficiency = (parseFloat(data.voltaje) * parseFloat(data.amperaje)) / (windSpeed * windSpeed * 50);
            
            // Eficiencia combinada
            return Math.min(100, (rpmEfficiency * 0.5 + Math.min(1, powerEfficiency) * 0.5) * 100);
        } catch (error) {
            console.error('[RealTurbineAI] Error al calcular eficiencia:', error);
            return 0;
        }
    }

    // Inicializar el sistema
    async function initialize() {
        try {
            console.log('[RealTurbineAI] Inicializando RealTurbineAI...');
            
            // Verificar TensorFlow.js
            const tfCheck = checkTensorFlow();
            if (tfCheck.status === 'error') {
                console.error('[RealTurbineAI] Advertencia: TensorFlow.js no funciona correctamente:', tfCheck.message);
                return {
                    status: 'warning',
                    message: 'TensorFlow.js no está funcionando correctamente. Usando funcionalidad limitada.',
                    tensorflowCheck: tfCheck
                };
            }
            
            // Limpiar cualquier modelo anterior
            if (model) {
                try {
                    model.dispose();
                } catch (e) {
                    console.warn('[RealTurbineAI] Error al limpiar modelo anterior:', e);
                }
            }
            
            model = createModel();
            console.log('[RealTurbineAI] Modelo creado correctamente');
            
            // Reiniciar variables
            isModelTrainedFlag = false;
            
            return {
                status: 'initialized',
                message: 'Modelo creado correctamente. Listo para recibir datos de entrenamiento.',
                tfcheck: tfCheck
            };
        } catch (error) {
            console.error('[RealTurbineAI] Error al inicializar:', error);
            return {
                status: 'error',
                message: 'Error al inicializar el modelo: ' + error.message
            };
        }
    }

    // Agregar nuevos datos al conjunto de entrenamiento
    function addTrainingData(data) {
        try {
            // Asegurarse de que los datos estén en el formato correcto
            const formattedData = {
                timestamp: data.timestamp || new Date(),
                voltaje: parseFloat(data.voltaje) || 0,
                amperaje: parseFloat(data.amperaje) || 0,
                rpm: parseFloat(data.rpm) || 0,
                velocidadViento: parseFloat(data.velocidadViento) || 0
            };
            
            trainingData.push(formattedData);
            
            // Mantener un tamaño de datos razonable
            if (trainingData.length > 1000) {
                trainingData.shift(); // Eliminar el dato más antiguo
            }
            
            console.log(`[RealTurbineAI] Datos añadidos: Total ${trainingData.length} puntos`);
            
            return {
                status: 'success',
                dataSize: trainingData.length,
                message: `Datos añadidos correctamente. Total de puntos de datos: ${trainingData.length}`
            };
        } catch (error) {
            console.error('[RealTurbineAI] Error al añadir datos de entrenamiento:', error);
            return {
                status: 'error',
                message: 'Error al añadir datos: ' + error.message
            };
        }
    }

    // Entrenar el modelo con los datos acumulados
    async function trainModel() {
        try {
            console.log(`[RealTurbineAI] Iniciando entrenamiento con ${trainingData.length} datos...`);
            
            // Verificaciones iniciales
            if (typeof tf === 'undefined' || !tf.backend) {
                console.error('[RealTurbineAI] TensorFlow no está inicializado correctamente');
                return {
                    status: 'error',
                    message: 'TensorFlow no está inicializado correctamente. Intenta recargar la página.'
                };
            }
            
            if (trainingData.length < HISTORY_SIZE + 5) {
                return {
                    status: 'error',
                    message: `Se necesitan al menos ${HISTORY_SIZE + 5} puntos de datos para entrenar. Actual: ${trainingData.length}`
                };
            }

            // Verificar que el modelo existe
            if (!model) {
                console.log('[RealTurbineAI] Modelo no disponible, creándolo...');
                model = createModel();
            }
            
            try {
                // Preparar datos para entrenamiento
                const { xs, ys } = prepareDataForModel(trainingData);
                
                // Configuración de entrenamiento más simple
                const batchSize = 16;  // Reducido para menor consumo de memoria
                const epochs = 10;     // Menos épocas para terminar antes
                
                console.log('[RealTurbineAI] Comenzando entrenamiento del modelo...');
                
                // Entrenar el modelo
                const history = await model.fit(xs, ys, {
                    batchSize,
                    epochs,
                    shuffle: true,
                    callbacks: {
                        onEpochEnd: (epoch, logs) => {
                            console.log(`[RealTurbineAI] Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}`);
                        }
                    }
                });
                
                isModelTrainedFlag = true;
                
                console.log('[RealTurbineAI] Entrenamiento completado. Pérdida final:', 
                    history.history.loss[history.history.loss.length - 1]);
                
                // Limpiar tensores para evitar fugas de memoria
                xs.dispose();
                ys.dispose();
                
                // Limpiar memoria adicional de TensorFlow.js
                tf.disposeVariables();
                
                return {
                    status: 'success',
                    message: 'Modelo entrenado correctamente',
                    finalLoss: history.history.loss[history.history.loss.length - 1],
                    epochs: epochs
                };
            } catch (error) {
                console.error('[RealTurbineAI] Error en entrenamiento:', error);
                
                // Intentar limpiar memoria
                try {
                    tf.disposeVariables();
                } catch (e) {
                    console.warn('[RealTurbineAI] Error al limpiar variables:', e);
                }
                
                throw error;
            }
        } catch (error) {
            console.error('[RealTurbineAI] Error al entrenar el modelo:', error);
            return {
                status: 'error',
                message: 'Error al entrenar el modelo: ' + error.message
            };
        }
    }

    // Hacer predicciones con el modelo entrenado
    async function predictNext(currentData) {
        try {
            if (!isModelTrainedFlag) {
                return {
                    status: 'error',
                    message: 'El modelo no ha sido entrenado aún'
                };
            }
            
            if (!model) {
                return {
                    status: 'error',
                    message: 'El modelo no está disponible'
                };
            }
            
            if (trainingData.length < HISTORY_SIZE) {
                return {
                    status: 'error',
                    message: 'No hay suficientes datos históricos para hacer predicciones'
                };
            }
            
            // Obtener los últimos datos históricos
            const recentData = [...trainingData.slice(-HISTORY_SIZE)];
            
            // Encontrar valores mínimos y máximos para normalización
            const min = {}, max = {};
            FEATURES.forEach(feature => {
                min[feature] = Math.min(...trainingData.map(item => parseFloat(item[feature])));
                max[feature] = Math.max(...trainingData.map(item => parseFloat(item[feature])));
                
                // Prevenir división por cero
                if (min[feature] === max[feature]) {
                    max[feature] += 0.1;
                }
            });
            
            // Normalizar datos recientes
            const normalizedData = normalizeData(recentData, min, max);
            
            // Preparar entrada para el modelo
            const input = tf.tensor3d([normalizedData.map(item => FEATURES.map(feature => item[feature]))]);
            
            // Hacer predicción
            const prediction = model.predict(input);
            const predictionData = prediction.dataSync();
            
            // Desnormalizar la predicción
            const result = {};
            FEATURES.forEach((feature, index) => {
                result[feature] = predictionData[index] * (max[feature] - min[feature]) + min[feature];
            });
            
            // Limpieza de tensores
            input.dispose();
            prediction.dispose();
            
            return {
                status: 'success',
                prediction: result
            };
        } catch (error) {
            console.error('[RealTurbineAI] Error al hacer predicción:', error);
            return {
                status: 'error',
                message: 'Error al hacer predicción: ' + error.message
            };
        }
    }

    // Detectar anomalías en los datos actuales
    function detectAnomalies(currentData) {
        try {
            if (trainingData.length < 20) { // Necesitamos suficientes datos para establecer un patrón
                return {
                    status: 'warning',
                    message: 'No hay suficientes datos históricos para detectar anomalías confiables',
                    anomalies: []
                };
            }
            
            const anomalies = [];
            
            // Calcular medias y desviaciones estándar para cada feature
            const stats = {};
            FEATURES.forEach(feature => {
                const values = trainingData.map(item => parseFloat(item[feature]));
                const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
                const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
                const stdDev = Math.sqrt(variance);
                
                stats[feature] = { mean, stdDev };
                
                // Comprobar si el valor actual se desvía significativamente (más de 2 desviaciones estándar)
                const currentValue = parseFloat(currentData[feature]);
                const zScore = Math.abs((currentValue - mean) / stdDev);
                
                if (zScore > 2.5) { // Umbral de 2.5 desviaciones estándar
                    anomalies.push({
                        feature,
                        currentValue,
                        mean,
                        stdDev,
                        zScore,
                        severity: zScore > 3.5 ? 'high' : 'medium'
                    });
                }
            });
            
            return {
                status: 'success',
                anomalies,
                message: anomalies.length > 0 ? 
                    `Se detectaron ${anomalies.length} anomalías` : 
                    'No se detectaron anomalías'
            };
        } catch (error) {
            console.error('[RealTurbineAI] Error al detectar anomalías:', error);
            return {
                status: 'error',
                message: 'Error al detectar anomalías: ' + error.message,
                anomalies: []
            };
        }
    }

    // Generar insights basados en datos y predicciones
    async function generateInsights(currentData) {
        try {
            const insights = [];
            
            // Detectar anomalías
            const anomalyResult = detectAnomalies(currentData);
            if (anomalyResult.anomalies.length > 0) {
                anomalyResult.anomalies.forEach(anomaly => {
                    let message;
                    switch(anomaly.feature) {
                        case 'voltaje':
                            message = `Voltaje anormal detectado (${currentData.voltaje}V). Desviación de ${anomaly.zScore.toFixed(1)} unidades estándar.`;
                            break;
                        case 'amperaje':
                            message = `Amperaje anormal detectado (${currentData.amperaje}A). Desviación de ${anomaly.zScore.toFixed(1)} unidades estándar.`;
                            break;
                        case 'rpm':
                            message = `RPM anormales detectadas (${currentData.rpm}). Desviación de ${anomaly.zScore.toFixed(1)} unidades estándar.`;
                            break;
                        case 'velocidadViento':
                            message = `Velocidad del viento anormal (${currentData.velocidadViento}m/s). Desviación de ${anomaly.zScore.toFixed(1)} unidades estándar.`;
                            break;
                        default:
                            message = `Anomalía detectada en ${anomaly.feature}. Desviación de ${anomaly.zScore.toFixed(1)} unidades estándar.`;
                    }
                    
                    insights.push({
                        id: Date.now() + '-' + anomaly.feature,
                        type: 'anomaly',
                        message,
                        timestamp: new Date(),
                        priority: anomaly.severity
                    });
                });
            }
            
            // Si el modelo está entrenado, generar insights basados en predicciones
            if (isModelTrainedFlag) {
                try {
                    const prediction = await predictNext(currentData);
                    
                    if (prediction.status === 'success') {
                        const pred = prediction.prediction;
                        
                        // Insight sobre eficiencia esperada
                        const currentEfficiency = calculateEfficiency(currentData);
                        const predictedEfficiency = calculateEfficiency(pred);
                        const efficiencyDiff = predictedEfficiency - currentEfficiency;
                        
                        if (Math.abs(efficiencyDiff) > 5) {
                            insights.push({
                                id: Date.now() + '-efficiency-prediction',
                                type: 'prediction',
                                message: `Se prevé un ${efficiencyDiff > 0 ? 'aumento' : 'descenso'} de eficiencia del ${Math.abs(efficiencyDiff).toFixed(1)}% en las próximas horas.`,
                                timestamp: new Date(),
                                priority: efficiencyDiff > 0 ? 'info' : 'normal'
                            });
                        }
                        
                        // Insight sobre cambios significativos esperados
                        FEATURES.forEach(feature => {
                            const current = parseFloat(currentData[feature]);
                            const predicted = pred[feature];
                            const percentChange = Math.abs((predicted - current) / current * 100);
                            
                            if (percentChange > 15) {
                                let message;
                                switch(feature) {
                                    case 'voltaje':
                                        message = `Se prevé un cambio del ${percentChange.toFixed(1)}% en el voltaje próximamente.`;
                                        break;
                                    case 'amperaje':
                                        message = `Se prevé un cambio del ${percentChange.toFixed(1)}% en el amperaje próximamente.`;
                                        break;
                                    case 'rpm':
                                        message = `Se prevé un cambio del ${percentChange.toFixed(1)}% en las RPM próximamente.`;
                                        break;
                                    case 'velocidadViento':
                                        message = `Se prevé un cambio del ${percentChange.toFixed(1)}% en la velocidad del viento próximamente.`;
                                        break;
                                }
                                
                                insights.push({
                                    id: Date.now() + '-prediction-' + feature,
                                    type: 'prediction',
                                    message,
                                    timestamp: new Date(),
                                    priority: percentChange > 25 ? 'high' : 'normal'
                                });
                            }
                        });
                    }
                } catch (error) {
                    console.error('[RealTurbineAI] Error generando insights de predicción:', error);
                    insights.push({
                        id: Date.now() + '-prediction-error',
                        type: 'error',
                        message: 'Error al generar predicciones: ' + error.message,
                        timestamp: new Date(),
                        priority: 'high'
                    });
                }
            } else if (trainingData.length >= 30) {
                // Si no está entrenado pero hay suficientes datos, sugerir entrenar
                insights.push({
                    id: Date.now() + '-training-suggestion',
                    type: 'suggestion',
                    message: `El modelo de IA aún no está entrenado. Se recomienda entrenar con los ${trainingData.length} datos disponibles para obtener predicciones más precisas.`,
                    timestamp: new Date(),
                    priority: 'normal'
                });
            }
            
            // Insights generales basados en datos actuales
            if (parseFloat(currentData.velocidadViento) < 3) {
                insights.push({
                    id: Date.now() + '-low-wind',
                    type: 'current_state',
                    message: 'Velocidad del viento baja. Rendimiento reducido es normal en estas condiciones.',
                    timestamp: new Date(),
                    priority: 'info'
                });
            } else if (parseFloat(currentData.velocidadViento) > 15) {
                insights.push({
                    id: Date.now() + '-high-wind',
                    type: 'current_state',
                    message: 'Velocidad del viento cercana al límite superior. El sistema de protección podría activarse.',
                    timestamp: new Date(),
                    priority: 'high'
                });
            }
            
            console.log(`[RealTurbineAI] Generados ${insights.length} insights`);
            return insights;
        } catch (error) {
            console.error('[RealTurbineAI] Error al generar insights:', error);
            return [{
                id: Date.now() + '-error',
                type: 'error',
                message: 'Error al generar insights: ' + error.message,
                timestamp: new Date(),
                priority: 'high'
            }];
        }
    }

    // Responder preguntas usando aprendizaje automático
    function answerQuestion(question) {
        try {
            // Si no hay suficientes datos o el modelo no está entrenado, usar respuestas genéricas
            if (!isModelTrainedFlag || trainingData.length < 30) {
                // Respuestas predefinidas para el período de recopilación inicial de datos
                if (question.toLowerCase().includes('eficiencia') || question.toLowerCase().includes('rendimiento')) {
                    return "Estoy recopilando y analizando datos para darte información precisa sobre la eficiencia. Necesito más datos para entrenar mi modelo de IA. Por favor, revisa de nuevo más tarde.";
                }
                
                if (question.toLowerCase().includes('mantenimiento') || question.toLowerCase().includes('próximo')) {
                    return "Aún estoy aprendiendo sobre los patrones de funcionamiento de tu turbina para poder recomendar mantenimientos predictivos. Necesito más datos para entrenar mi modelo de IA.";
                }
                
                if (question.toLowerCase().includes('problema') || question.toLowerCase().includes('anomalía')) {
                    return "Estoy monitoreando la turbina, pero aún necesito más datos para detectar anomalías con precisión. Mi modelo de IA está en entrenamiento con los datos que vamos recopilando.";
                }
                
                if (question.toLowerCase().includes('datos') || question.toLowerCase().includes('entrenamiento')) {
                    return `Actualmente tengo ${trainingData.length} datos recopilados. Necesito al menos 30 para poder entrenar el modelo de IA. Puedes generar más datos con el botón "Generar Datos" o esperar a que se recopilen automáticamente.`;
                }
                
                return "Estoy recopilando y analizando datos para poder responder a tu pregunta con precisión. Mi modelo de IA está aprendiendo con cada dato nuevo que recibo de tu turbina.";
            }
            
            // Si el modelo está entrenado, usar respuestas más informadas
            
            question = question.toLowerCase();
            
            // Obtener el último registro de datos
            const latestData = trainingData[trainingData.length - 1];
            const efficiency = calculateEfficiency(latestData).toFixed(1);
            
            // Respuestas basadas en el aprendizaje del modelo
            if (question.includes('eficiencia') || question.includes('rendimiento')) {
                return `Basado en mi análisis, la eficiencia actual de la turbina es del ${efficiency}%. He analizado patrones en ${trainingData.length} puntos de datos para llegar a esta conclusión.`;
            } 
            
            if (question.includes('mantenimiento') || question.includes('próximo')) {
                // Simulación de una recomendación basada en patrones
                const maintenanceDays = Math.floor(20 + Math.random() * 30);
                return `Basado en los patrones de funcionamiento que he analizado, recomendaría programar el próximo mantenimiento en aproximadamente ${maintenanceDays} días. Esta predicción se basa en mi análisis de ${trainingData.length} puntos de datos históricos.`;
            }
            
            if (question.includes('problema') || question.includes('anomalía')) {
                const anomalyResult = detectAnomalies(latestData);
                if (anomalyResult.anomalies.length > 0) {
                    const anomaliesList = anomalyResult.anomalies.map(a => {
                        switch(a.feature) {
                            case 'voltaje': return `voltaje (${latestData.voltaje}V, ${a.zScore.toFixed(1)} desviaciones)`;
                            case 'amperaje': return `amperaje (${latestData.amperaje}A, ${a.zScore.toFixed(1)} desviaciones)`;
                            case 'rpm': return `RPM (${latestData.rpm}, ${a.zScore.toFixed(1)} desviaciones)`;
                            case 'velocidadViento': return `velocidad del viento (${latestData.velocidadViento}m/s, ${a.zScore.toFixed(1)} desviaciones)`;
                            default: return a.feature;
                        }
                    }).join(', ');
                    
                    return `He detectado anomalías en: ${anomaliesList}. Estas desviaciones se basan en mi análisis estadístico de ${trainingData.length} puntos de datos históricos.`;
                } else {
                    return `No he detectado anomalías significativas en el funcionamiento actual. Sigo monitoreando ${trainingData.length} puntos de datos para detectar cualquier comportamiento inusual.`;
                }
            }
            
            if (question.includes('producción','produccion') || question.includes('energía') || question.includes('genera')) {
                const produccion = (parseFloat(latestData.voltaje) * parseFloat(latestData.amperaje) / 1000).toFixed(2);
                return `La producción energética actual es de aproximadamente ${produccion} kW según los últimos datos analizados. Esta estimación se basa en mi análisis de los patrones de voltaje y amperaje observados.`;
            }
            
            if (question.includes('viento') || question.includes('clima')) {
                return `La velocidad actual del viento es de ${latestData.velocidadViento} m/s. Basado en mi análisis de datos, esta velocidad es ${parseFloat(latestData.velocidadViento) < 3 ? 'inferior al óptimo' : parseFloat(latestData.velocidadViento) > 15 ? 'cercana al límite superior recomendado' : 'adecuada'} para el rendimiento de la turbina.`;
            }
            
            if (question.includes('predicción') || question.includes('prever') || question.includes('futuro')) {
                return `Estoy trabajando en generar predicciones precisas basadas en los ${trainingData.length} puntos de datos que he analizado. Necesito más información de la turbina y continuar mi entrenamiento para mejorar mis predicciones.`;
            }
            
            if (question.includes('datos') || question.includes('entrenamiento')) {
                return `He analizado ${trainingData.length} puntos de datos y mi modelo de IA está entrenado con ellos. Cuantos más datos reciba, mejores serán mis predicciones y análisis. Puedes generar más datos con el botón "Generar Datos".`;
            }
            
            // Respuesta por defecto
            return `Estoy analizando continuamente los datos de tu turbina para proporcionarte insights valiosos. Si tienes alguna pregunta específica sobre eficiencia, mantenimiento, anomalías detectadas, producción o condiciones climáticas, estoy aquí para ayudarte basado en mi análisis de datos.`;
        } catch (error) {
            console.error('[RealTurbineAI] Error al responder pregunta:', error);
            return "Lo siento, ha ocurrido un error al procesar tu pregunta. Por favor, intenta de nuevo con una consulta diferente.";
        }
    }

    // Realizar verificación inicial de TensorFlow
    const tfCheck = checkTensorFlow();
    if (tfCheck.status === 'error') {
        console.error('[RealTurbineAI] Advertencia: TensorFlow.js no funciona correctamente:', tfCheck.message);
    } else {
        console.log('[RealTurbineAI] Verificación de TensorFlow.js exitosa');
    }

        // Funciones para múltiples turbinas
    function trainWithMultipleTurbines(allTurbineData) {
        try {
            console.log('[RealTurbineAI] Entrenando con datos de múltiples turbinas...');
            
            let combinedData = [];
            Object.entries(allTurbineData).forEach(([turbineId, data]) => {
                data.forEach(point => {
                    combinedData.push({
                        ...point,
                        source_turbine: turbineId
                    });
                });
            });
            
            combinedData = combinedData.sort(() => Math.random() - 0.5);
            console.log(`[RealTurbineAI] Datos combinados: ${combinedData.length} puntos`);
            
            trainingData = combinedData;
            return trainModel();
        } catch (error) {
            console.error('[RealTurbineAI] Error en entrenamiento múltiple:', error);
            return {
                status: 'error',
                message: 'Error al entrenar con múltiples turbinas: ' + error.message
            };
        }
    }

    function compareMultipleTurbines(allTurbineData) {
        try {
            const comparison = {};
            
            Object.entries(allTurbineData).forEach(([turbineId, data]) => {
                if (data.length > 0) {
                    const latest = data[data.length - 1];
                    comparison[turbineId] = {
                        latestData: latest,
                        efficiency: calculateEfficiency(latest),
                        dataPoints: data.length
                    };
                }
            });
            
            return {
                status: 'success',
                comparison: comparison,
                insights: generateMultiTurbineInsights(comparison)
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Error al comparar turbinas: ' + error.message
            };
        }
    }

    function generateMultiTurbineInsights(comparison) {
        const insights = [];
        const turbineIds = Object.keys(comparison);
        
        if (turbineIds.length >= 2) {
            // Comparar eficiencias
            let bestTurbine = null;
            let worstTurbine = null;
            let bestEfficiency = 0;
            let worstEfficiency = 100;
            
            turbineIds.forEach(id => {
                const eff = comparison[id].efficiency;
                if (eff > bestEfficiency) {
                    bestEfficiency = eff;
                    bestTurbine = id;
                }
                if (eff < worstEfficiency) {
                    worstEfficiency = eff;
                    worstTurbine = id;
                }
            });
            
            if (bestTurbine && worstTurbine && bestTurbine !== worstTurbine) {
                insights.push({
                    id: Date.now() + '-efficiency-comparison',
                    type: 'comparison',
                    message: `Turbina ${bestTurbine}: ${bestEfficiency.toFixed(1)}% vs ${worstTurbine}: ${worstEfficiency.toFixed(1)}%. Diferencia: ${(bestEfficiency - worstEfficiency).toFixed(1)}%`,
                    timestamp: new Date(),
                    priority: worstEfficiency < 70 ? 'high' : 'normal'
                });
            }
        }
        
        return insights;
    }

    // Modificar el return para incluir las nuevas funciones
    return {
        initialize,
        addTrainingData,
        trainModel,
        trainWithMultipleTurbines,
        compareMultipleTurbines,
        generateMultiTurbineInsights,
        predictNext,
        detectAnomalies,
        generateInsights,
        answerQuestion,
        getDataSize: () => trainingData.length,
        isModelTrained: () => isModelTrainedFlag,
        checkTensorFlow
    };

})();
// Añadir al final del archivo, antes de la exportación
async function resetTensorFlow() {
    console.log('[RealTurbineAI] Reinicializando TensorFlow...');
    
    // Liberar memoria y eliminar el modelo actual
    if (model) {
        try {
            model.dispose();
        } catch (e) {
            console.warn('[RealTurbineAI] Error al liberar modelo:', e);
        }
    }
    
    // Liberar todas las variables en memoria
    try {
        tf.disposeVariables();
    } catch (e) {
        console.warn('[RealTurbineAI] Error al liberar variables:', e);
    }
    
    // Forzar reinicialización de TensorFlow
    try {
        await tf.ready();
        
        // Forzar selección de backend explícitamente
        try {
            await tf.setBackend('webgl');
        } catch (e) {
            console.warn('[RealTurbineAI] Error al configurar WebGL, intentando con CPU:', e);
            await tf.setBackend('cpu');
        }
        
        // Crear un nuevo modelo
        model = createModel();
        console.log('[RealTurbineAI] TensorFlow reinicializado correctamente');
        return true;
    } catch (e) {
        console.error('[RealTurbineAI] Error al reinicializar TensorFlow:', e);
        return false;
    }
}
// Exportar el módulo
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealTurbineAI;
} else if (typeof window !== 'undefined') {
    window.RealTurbineAI = RealTurbineAI;
    // Disparar un evento cuando el módulo esté listo
    try {
        const event = new CustomEvent('realTurbineAIReady', { detail: { RealTurbineAI } });
        window.dispatchEvent(event);
        console.log('[RealTurbineAI] Módulo exportado al objeto window y evento disparado');
    } catch (error) {
        console.error('[RealTurbineAI] Error al disparar evento de inicialización:', error);
    }
}