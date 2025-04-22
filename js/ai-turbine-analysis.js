/**
 * AI Turbine Analysis - Biblioteca para análisis predictivo de turbinas eólicas
 * 
 * Esta biblioteca proporciona funciones para analizar datos de turbinas eólicas
 * y generar insights utilizando técnicas de IA.
 * 
 * En un entorno de producción, estas funciones se conectarían a APIs de ML/IA
 * en el backend. Para esta demostración, usamos algoritmos simulados.
 */

const TurbineAI = (function() {
    // Constantes para análisis
    const OPTIMAL_VOLTAGE_RANGE = [70, 90];
    const OPTIMAL_AMPERAGE_RANGE = [20, 45];
    const RPM_WIND_RATIO = 300; // Valor simulado de RPM ideales por m/s de viento
    const ANOMALY_THRESHOLDS = {
        voltageVariation: 10, // % de variación repentina que indica anomalía
        rpmVariation: 15,     // % de variación que no corresponde con el viento
        efficiencyDrop: 20    // % de caída repentina en eficiencia
    };
    
    // Datos históricos y de referencia (simulados)
    let historicalData = [];
    let referenceModels = {
        'LIAM-F1': {
            idealEfficiency: 0.85, // 85% eficiencia ideal
            powerCurve: [
                { windSpeed: 2, power: 0.1 },  // A 2 m/s -> 0.1 kW
                { windSpeed: 5, power: 0.5 },  // A 5 m/s -> 0.5 kW
                { windSpeed: 8, power: 1.0 },  // A 8 m/s -> 1.0 kW
                { windSpeed: 12, power: 1.5 }, // A 12 m/s -> 1.5 kW
                { windSpeed: 15, power: 1.5 }, // A 15 m/s -> 1.5 kW (máxima potencia)
                { windSpeed: 17, power: 1.5 }, // A 17 m/s -> 1.5 kW (corte superior)
            ],
            maintenanceIntervals: {
                routine: 90,   // días entre mantenimientos rutinarios
                bearings: 180, // días entre revisiones de rodamientos
                blades: 365,   // días entre inspecciones de palas
            },
            typicalLifespan: {
                bearings: 1460, // 4 años en días
                generator: 2190, // 6 años en días
                controller: 1825, // 5 años en días
            }
        }
    };
    
    // Sistema de puntuación de estado (0-100, siendo 100 perfecto)
    let healthScores = {
        overall: 95,
        byComponent: {
            bearings: 92,
            generator: 97,
            blades: 94,
            controller: 96,
            orientation: 93
        },
        history: [] // Para almacenar tendencias
    };
    
    /**
     * Inicializa el sistema con datos históricos
     * @param {Array} data Datos históricos de la turbina
     */
    function initialize(data = []) {
        if (data.length > 0) {
            historicalData = data;
        } else {
            // Generar datos históricos simulados si no se proporcionan
            historicalData = generateSimulatedHistoricalData();
        }
        
        // Calcular puntuación inicial de salud
        calculateHealthScore();
        
        return {
            status: 'initialized',
            dataPoints: historicalData.length
        };
    }
    
    /**
     * Genera datos históricos simulados para pruebas
     * @returns {Array} Datos históricos simulados
     */
    function generateSimulatedHistoricalData() {
        const days = 30; // Generar 30 días de datos
        const pointsPerDay = 24; // 24 puntos por día (uno por hora)
        const data = [];
        
        const now = new Date();
        
        for (let d = days; d > 0; d--) {
            for (let h = 0; h < pointsPerDay; h++) {
                const timestamp = new Date(now);
                timestamp.setDate(now.getDate() - d);
                timestamp.setHours(h, 0, 0, 0);
                
                // Simular patrones de viento y producción realistas
                const hourFactor = (h < 6 || h > 18) ? 0.7 : 1.2; // Menos viento de noche
                const randomFactor = 0.8 + (Math.random() * 0.4); // Variación aleatoria 0.8-1.2
                const seasonalFactor = 1.0; // Podría variar según la temporada
                
                let windSpeedValue = (5 + Math.sin(h/4) * 3) * hourFactor * randomFactor * seasonalFactor;
                windSpeedValue = Math.max(2, Math.min(17, windSpeedValue)); // Limitar a rango 2-17 m/s
                
                // Encontrar producción según curva de potencia
                let power = 0;
                for (let i = 0; i < referenceModels['LIAM-F1'].powerCurve.length; i++) {
                    const point = referenceModels['LIAM-F1'].powerCurve[i];
                    if (windSpeedValue <= point.windSpeed) {
                        if (i === 0) {
                            power = point.power;
                        } else {
                            // Interpolación lineal entre puntos
                            const prevPoint = referenceModels['LIAM-F1'].powerCurve[i-1];
                            const windDiff = point.windSpeed - prevPoint.windSpeed;
                            const powerDiff = point.power - prevPoint.power;
                            const ratio = (windSpeedValue - prevPoint.windSpeed) / windDiff;
                            power = prevPoint.power + (powerDiff * ratio);
                        }
                        break;
                    }
                    // Si supera el último punto, usar el valor máximo
                    if (i === referenceModels['LIAM-F1'].powerCurve.length - 1) {
                        power = point.power;
                    }
                }
                
                // Fluctuación realista según antigüedad (simulada) de componentes
                const daysSinceLastMaintenance = 45; // Simulado
                const ageFactor = 1 - (daysSinceLastMaintenance / 365) * 0.05; // Pérdida de 5% por año
                
                // Simular valores de tensión/corriente basados en la potencia
                const voltageBase = 75; // Valor base
                const amperageBase = power * 30; // Relación simulada potencia/corriente
                
                // Añadir pequeñas variaciones para simular datos reales
                const voltage = voltageBase * (0.95 + Math.random() * 0.1) * ageFactor;
                const amperage = amperageBase * (0.95 + Math.random() * 0.1) * ageFactor;
                const rpm = windSpeedValue * RPM_WIND_RATIO * (0.95 + Math.random() * 0.1) * ageFactor;
                
                data.push({
                    timestamp,
                    windSpeed: windSpeedValue,
                    voltage,
                    amperage,
                    rpm,
                    power: voltage * amperage / 1000, // kW
                    efficiency: calculateEfficiency(windSpeedValue, rpm, voltage, amperage)
                });
                
                // Simular ocasionalmente una anomalía
                if (Math.random() < 0.01) { // 1% de probabilidad
                    const anomalyType = Math.floor(Math.random() * 3);
                    const lastIndex = data.length - 1;
                    
                    if (anomalyType === 0) {
                        // Anomalía de voltaje
                        data[lastIndex].voltage *= 0.7;
                        data[lastIndex].anomaly = 'voltage_drop';
                    } else if (anomalyType === 1) {
                        // Anomalía de RPM
                        data[lastIndex].rpm *= 0.6;
                        data[lastIndex].anomaly = 'rpm_drop';
                    } else {
                        // Anomalía de eficiencia
                        data[lastIndex].efficiency *= 0.65;
                        data[lastIndex].anomaly = 'efficiency_drop';
                    }
                }
            }
        }
        
        return data;
    }
    
    /**
     * Calcula la eficiencia basada en los parámetros de la turbina
     * @param {number} windSpeed Velocidad del viento en m/s
     * @param {number} rpm RPM de la turbina
     * @param {number} voltage Voltaje generado
     * @param {number} amperage Amperaje generado
     * @returns {number} Eficiencia como porcentaje (0-100)
     */
    function calculateEfficiency(windSpeed, rpm, voltage, amperage) {
        // En producción: algoritmo real basado en modelos físicos
        // Para demo: fórmula simplificada
        
        // 1. Calcular potencia teórica según curva de potencia
        let theoreticalPower = 0;
        for (let i = 0; i < referenceModels['LIAM-F1'].powerCurve.length; i++) {
            const point = referenceModels['LIAM-F1'].powerCurve[i];
            if (windSpeed <= point.windSpeed) {
                if (i === 0) {
                    theoreticalPower = point.power;
                } else {
                    // Interpolación
                    const prevPoint = referenceModels['LIAM-F1'].powerCurve[i-1];
                    const windDiff = point.windSpeed - prevPoint.windSpeed;
                    const powerDiff = point.power - prevPoint.power;
                    const ratio = (windSpeed - prevPoint.windSpeed) / windDiff;
                    theoreticalPower = prevPoint.power + (powerDiff * ratio);
                }
                break;
            }
            if (i === referenceModels['LIAM-F1'].powerCurve.length - 1) {
                theoreticalPower = point.power;
            }
        }
        
        // 2. Calcular potencia real
        const actualPower = (voltage * amperage) / 1000; // kW
        
        // 3. Calcular eficiencia (con límite en 100%)
        const efficiency = Math.min(100, (actualPower / theoreticalPower) * 100);
        
        // 4. Añadir un factor de RPM (las RPM deberían corresponder al viento)
        const idealRpm = windSpeed * RPM_WIND_RATIO;
        const rpmEfficiencyFactor = rpm / idealRpm;
        
        // Combinar factores para eficiencia final
        return Math.min(100, efficiency * 0.7 + Math.min(100, rpmEfficiencyFactor * 100) * 0.3);
    }
    
    /**
     * Calcula la puntuación de salud general de la turbina
     */
    function calculateHealthScore() {
        // En producción: algoritmo basado en ML entrenado con datos reales
        // Para demo: simulación basada en patrones
        
        // Degradar ligeramente las puntuaciones con el tiempo
        Object.keys(healthScores.byComponent).forEach(component => {
            // Simular degradación en el tiempo
            const degradationRate = Math.random() * 0.1; // 0-0.1% por día
            healthScores.byComponent[component] = Math.max(
                0, 
                healthScores.byComponent[component] - degradationRate
            );
            
            // Simular problemas aleatorios
            if (Math.random() < 0.01) { // 1% de probabilidad
                healthScores.byComponent[component] -= Math.random() * 5; // Caída de 0-5%
            }
        });
        
        // Calcular puntuación general (media ponderada)
        healthScores.overall = (
            healthScores.byComponent.bearings * 0.25 +
            healthScores.byComponent.generator * 0.25 +
            healthScores.byComponent.blades * 0.20 +
            healthScores.byComponent.controller * 0.15 +
            healthScores.byComponent.orientation * 0.15
        );
        
        // Redondear a entero
        healthScores.overall = Math.round(healthScores.overall);
        
        // Almacenar en historial
        healthScores.history.push({
            timestamp: new Date(),
            score: healthScores.overall
        });
        
        // Mantener historial limitado
        if (healthScores.history.length > 60) { // 60 días
            healthScores.history.shift();
        }
    }
    
    /**
     * Analiza nuevos datos de telemetría para detectar anomalías e insights
     * @param {Object} data Objeto con los datos de telemetría actuales
     * @returns {Object} Resultados del análisis
     */
    function analyzeTelemetry(data) {
        // Validar datos
        if (!data || !data.voltaje || !data.amperaje || !data.rpm || !data.velocidadViento) {
            return {
                status: 'error',
                message: 'Datos de telemetría incompletos o inválidos'
            };
        }
        
        // Convertir a números (por si acaso vienen como string)
        const telemetry = {
            timestamp: new Date(),
            windSpeed: parseFloat(data.velocidadViento),
            voltage: parseFloat(data.voltaje),
            amperage: parseFloat(data.amperaje),
            rpm: parseFloat(data.rpm)
        };
        
        // Calcular potencia y eficiencia
        telemetry.power = (telemetry.voltage * telemetry.amperage) / 1000; // kW
        telemetry.efficiency = calculateEfficiency(
            telemetry.windSpeed, 
            telemetry.rpm, 
            telemetry.voltage, 
            telemetry.amperage
        );
        
        // Añadir a datos históricos
        historicalData.push(telemetry);
        
        // Mantener historial limitado
        if (historicalData.length > 720) { // 30 días x 24 horas
            historicalData.shift();
        }
        
        // Actualizar puntuación de salud
        calculateHealthScore();
        
        // Detectar anomalías
        const anomalies = detectAnomalies(telemetry);
        
        // Generar insights
        const insights = generateInsights(telemetry, anomalies);
        
        // Calcular días hasta próximo mantenimiento
        const maintenanceRecommendation = predictNextMaintenance();
        
        // Devolver resultados completos
        return {
            status: 'success',
            telemetry,
            healthScore: healthScores.overall,
            componentHealth: healthScores.byComponent,
            efficiency: {
                current: telemetry.efficiency,
                trend: calculateEfficiencyTrend(),
                status: telemetry.efficiency > 85 ? 'optimal' : 
                        telemetry.efficiency > 70 ? 'normal' : 'suboptimal'
            },
            anomalies,
            insights,
            maintenanceRecommendation
        };
    }
    
    /**
     * Detecta anomalías en los datos de telemetría actuales
     * @param {Object} current Datos actuales de telemetría
     * @returns {Array} Lista de anomalías detectadas
     */
    function detectAnomalies(current) {
        // Sin suficientes datos históricos para comparar
        if (historicalData.length < 2) return [];
        
        const anomalies = [];
        const previous = historicalData[historicalData.length - 2]; // Punto anterior
        
        // 1. Detección de caída/fluctuación de voltaje
        const voltageDiff = Math.abs((current.voltage - previous.voltage) / previous.voltage) * 100;
        if (voltageDiff > ANOMALY_THRESHOLDS.voltageVariation) {
            anomalies.push({
                id: Date.now() + '-voltage',
                type: 'voltage_fluctuation',
                message: `Fluctuación anormal de voltaje detectada (${voltageDiff.toFixed(1)}%). Puede indicar problemas en el sistema de generación.`,
                severity: voltageDiff > 20 ? 'high' : 'warning',
                timestamp: new Date()
            });
        }
        
        // 2. Detección de variación RPM no correspondiente al viento
        const idealRpm = current.windSpeed * RPM_WIND_RATIO;
        const rpmDeviation = Math.abs((current.rpm - idealRpm) / idealRpm) * 100;
        if (rpmDeviation > ANOMALY_THRESHOLDS.rpmVariation) {
            anomalies.push({
                id: Date.now() + '-rpm',
                type: 'rpm_variation',
                message: `Variación irregular en RPM en relación con la velocidad del viento (${rpmDeviation.toFixed(1)}%). Posible desalineación de palas o problema de rodamientos.`,
                severity: rpmDeviation > 30 ? 'high' : 'medium',
                timestamp: new Date()
            });
        }
        
        // 3. Detección de caída de eficiencia repentina
        if (previous.efficiency > 0) {
            const efficiencyDrop = (previous.efficiency - current.efficiency);
            if (efficiencyDrop > ANOMALY_THRESHOLDS.efficiencyDrop) {
                anomalies.push({
                    id: Date.now() + '-efficiency',
                    type: 'efficiency_drop',
                    message: `Caída repentina de eficiencia (${efficiencyDrop.toFixed(1)}%) en condiciones de viento similares. Verificar sistema completo.`,
                    severity: efficiencyDrop > 30 ? 'high' : 'medium',
                    timestamp: new Date()
                });
            }
        }
        
        // 4. Verificar si el voltaje está fuera del rango óptimo
        if (current.voltage < OPTIMAL_VOLTAGE_RANGE[0] || current.voltage > OPTIMAL_VOLTAGE_RANGE[1]) {
            anomalies.push({
                id: Date.now() + '-voltage-range',
                type: 'voltage_out_of_range',
                message: `Voltaje fuera del rango óptimo (${OPTIMAL_VOLTAGE_RANGE[0]}-${OPTIMAL_VOLTAGE_RANGE[1]}V). Actual: ${current.voltage.toFixed(1)}V.`,
                severity: 'warning',
                timestamp: new Date()
            });
        }
        
        // 5. Verificar si el amperaje está fuera del rango óptimo
        if (current.amperage < OPTIMAL_AMPERAGE_RANGE[0] || current.amperage > OPTIMAL_AMPERAGE_RANGE[1]) {
            anomalies.push({
                id: Date.now() + '-amperage-range',
                type: 'amperage_out_of_range',
                message: `Amperaje fuera del rango óptimo (${OPTIMAL_AMPERAGE_RANGE[0]}-${OPTIMAL_AMPERAGE_RANGE[1]}A). Actual: ${current.amperage.toFixed(1)}A.`,
                severity: 'warning',
                timestamp: new Date()
            });
        }
        
        return anomalies;
    }
    
    /**
     * Genera insights basados en los datos actuales y anomalías
     * @param {Object} current Datos actuales
     * @param {Array} anomalies Anomalías detectadas
     * @returns {Array} Lista de insights
     */
    function generateInsights(current, anomalies) {
        const insights = [];
        
        // 1. Insight de eficiencia
        insights.push({
            id: Date.now() + '-efficiency',
            type: 'efficiency',
            message: `La turbina está operando al ${current.efficiency.toFixed(1)}% de eficiencia basado en las condiciones actuales de viento.`,
            timestamp: new Date(),
            priority: current.efficiency > 85 ? 'info' : current.efficiency > 70 ? 'normal' : 'high'
        });
        
        // 2. Insight basado en velocidad del viento
        if (current.windSpeed < 3) {
            insights.push({
                id: Date.now() + '-low-wind',
                type: 'wind',
                message: 'Velocidad del viento baja. Rendimiento reducido es normal en estas condiciones.',
                timestamp: new Date(),
                priority: 'info'
            });
        } else if (current.windSpeed > 15) {
            insights.push({
                id: Date.now() + '-high-wind',
                type: 'wind',
                message: 'Velocidad del viento cercana al límite superior. El sistema de protección podría activarse.',
                timestamp: new Date(),
                priority: 'normal'
            });
        } else if (current.windSpeed > 7 && current.windSpeed < 13) {
            insights.push({
                id: Date.now() + '-optimal-wind',
                type: 'wind',
                message: 'Velocidad del viento en rango óptimo. Condiciones ideales para máxima producción.',
                timestamp: new Date(),
                priority: 'info'
            });
        }
        
        // 3. Insight basado en salud
        if (healthScores.overall < 80) {
            // Encontrar el componente con peor estado
            let worstComponent = 'general';
            let worstScore = 100;
            
            Object.entries(healthScores.byComponent).forEach(([component, score]) => {
                if (score < worstScore) {
                    worstScore = score;
                    worstComponent = component;
                }
            });
            
            insights.push({
                id: Date.now() + '-health',
                type: 'health',
                message: `Estado de salud del sistema por debajo de lo óptimo (${healthScores.overall}%). Preste especial atención al componente: ${worstComponent}.`,
                timestamp: new Date(),
                priority: healthScores.overall < 70 ? 'high' : 'normal'
            });
        }
        
        // 4. Insight basado en anomalías
        if (anomalies.length > 0) {
            const highSeverity = anomalies.some(a => a.severity === 'high');
            
            insights.push({
                id: Date.now() + '-anomalies',
                type: 'anomalies',
                message: `${anomalies.length} anomalía${anomalies.length > 1 ? 's' : ''} detectada${anomalies.length > 1 ? 's' : ''} en los datos recientes. ${highSeverity ? 'Se recomienda revisión urgente.' : 'Se recomienda monitoreo continuo.'}`,
                timestamp: new Date(),
                priority: highSeverity ? 'high' : 'normal'
            });
        }
        
        // 5. Insight de mantenimiento
        const maintenance = predictNextMaintenance();
        
        if (maintenance.daysUntil < 14) {
            insights.push({
                id: Date.now() + '-maintenance',
                type: 'maintenance',
                message: `Próximo mantenimiento programado en ${maintenance.daysUntil} días. ${maintenance.components.join(', ')} requieren atención.`,
                timestamp: new Date(),
                priority: maintenance.daysUntil < 7 ? 'high' : 'normal'
            });
        }
        
        // 6. A veces, añadir un insight aleatorio sobre optimización
        if (Math.random() < 0.3) { // 30% de probabilidad
            const optimizationInsights = [
                "Ajustando el ángulo de las palas en 2° podría aumentar la eficiencia en condiciones actuales.",
                "La instalación de un sistema de limpieza automática podría mejorar el rendimiento un 3% anual.",
                "Actualizar el firmware del controlador a la última versión puede mejorar la respuesta a cambios de viento.",
                "Implementar algoritmos de orientación predictivos podría aumentar la producción anual hasta un 5%."
            ];
            
            insights.push({
                id: Date.now() + '-optimization',
                type: 'optimization',
                message: optimizationInsights[Math.floor(Math.random() * optimizationInsights.length)],
                timestamp: new Date(),
                priority: 'normal'
            });
        }
        
        return insights;
    }
    
    /**
     * Calcula la tendencia de eficiencia comparando con datos históricos
     * @returns {string} Descripción de la tendencia
     */
    function calculateEfficiencyTrend() {
        // Necesitamos suficientes datos para una tendencia
        if (historicalData.length < 24) return '0% sin cambios';
        
        // Calcular eficiencia promedio reciente (últimas 12 horas)
        const recentData = historicalData.slice(-12);
        const recentAvg = recentData.reduce((sum, data) => sum + data.efficiency, 0) / recentData.length;
        
        // Calcular eficiencia promedio anterior (12-24 horas)
        const previousData = historicalData.slice(-24, -12);
        const previousAvg = previousData.reduce((sum, data) => sum + data.efficiency, 0) / previousData.length;
        
        // Calcular diferencia porcentual
        const diff = recentAvg - previousAvg;
        const percentDiff = (diff / previousAvg) * 100;
        
        // Formatear como string
        return `${percentDiff.toFixed(1)}% ${diff >= 0 ? 'mejor' : 'peor'} que ayer`;
    }
    
    /**
     * Predice la fecha del próximo mantenimiento recomendado
     * @returns {Object} Información sobre el próximo mantenimiento
     */
    function predictNextMaintenance() {
        // En producción: basado en modelos ML entrenados con datos reales
        // Para demo: simulación basada en reglas simples
        
        // Días simulados desde el último mantenimiento
        const daysSinceLastMaintenance = 62; // Simulado
        
        // Calcular componentes que necesitan mantenimiento
        const componentsNeeded = [];
        
        // Algoritmo simple:
        // - Si un componente tiene salud < 80%, añadirlo
        // - Si han pasado más de X días desde último mantenimiento, añadirlo
        
        if (healthScores.byComponent.bearings < 80 || daysSinceLastMaintenance > 180) {
            componentsNeeded.push('Rodamientos');
        }
        
        if (healthScores.byComponent.blades < 80 || daysSinceLastMaintenance > 270) {
            componentsNeeded.push('Palas');
        }
        
        if (healthScores.byComponent.controller < 80) {
            componentsNeeded.push('Sistema de control');
        }
        
        if (healthScores.byComponent.orientation < 80) {
            componentsNeeded.push('Sistema de orientación');
        }
        
        // Calcular días hasta el próximo mantenimiento basado en la salud actual
        let daysUntil = 90; // Valor por defecto
        
        if (healthScores.overall < 75) {
            daysUntil = 14; // 2 semanas si salud es menor a 75%
        } else if (healthScores.overall < 85) {
            daysUntil = 28; // 4 semanas si salud es menor a 85%
        } else if (daysSinceLastMaintenance > 180) {
            daysUntil = 7; // 1 semana si han pasado más de 6 meses
        }
        
        // Si no hay componentes específicos, añadir mantenimiento general
        if (componentsNeeded.length === 0) {
            componentsNeeded.push('Mantenimiento general');
        }
        
        return {
            daysUntil,
            recommendation: daysUntil < 14 ? 'Mantenimiento recomendado a corto plazo' : 'Mantenimiento preventivo programado',
            components: componentsNeeded,
            priority: daysUntil < 7 ? 'high' : daysUntil < 30 ? 'normal' : 'low',
            estimatedDuration: componentsNeeded.length * 2, // Horas estimadas
            lastMaintenance: daysSinceLastMaintenance + ' días atrás'
        };
    }
    
    /**
     * Responde a preguntas del usuario sobre la turbina
     * @param {string} question Pregunta del usuario
     * @returns {string} Respuesta generada
     */
    function answerQuestion(question) {
        // En producción: Integración con LLM o modelo de NLP
        // Para demo: Respuestas basadas en palabras clave
        
        question = question.toLowerCase();
        
        // Obtener datos actuales para respuestas
        const current = historicalData.length > 0 ? 
            historicalData[historicalData.length - 1] : null;
            
        // Si no hay datos, informar al usuario
        if (!current) {
            return "No hay datos disponibles actualmente para responder a tu pregunta. Por favor, intenta de nuevo cuando haya datos de telemetría disponibles.";
        }
        
        // Respuestas basadas en palabras clave
        if (question.includes('eficiencia') || question.includes('rendimiento')) {
            return `La turbina está operando actualmente con una eficiencia del ${current.efficiency.toFixed(1)}%, que es ${
                current.efficiency > 85 ? 'óptima' : 
                current.efficiency > 70 ? 'normal' : 
                'por debajo de lo esperado'
            } basado en las condiciones actuales. ${calculateEfficiencyTrend()}`;
        } 
        
        if (question.includes('mantenimiento') || question.includes('próximo')) {
            const maintenance = predictNextMaintenance();
            return `El próximo mantenimiento está recomendado en ${maintenance.daysUntil} días. Se recomienda revisar: ${maintenance.components.join(', ')}. El último mantenimiento fue hace ${maintenance.lastMaintenance}.`;
        }
        
        if (question.includes('problema') || question.includes('fallo') || question.includes('avería') || question.includes('anomalía')) {
            const anomalies = detectAnomalies(current);
            if (anomalies.length > 0) {
                return `Se han detectado las siguientes anomalías: ${anomalies.map(a => a.message).join(' ')}`;
            } else {
                return 'No se han detectado anomalías o fallos en el funcionamiento actual de la turbina. La puntuación de salud general es ' + healthScores.overall + '/100.';
            }
        }
        
        if (question.includes('producción') || question.includes('energía') || question.includes('genera') || question.includes('potencia')) {
            const produccionEstimada = (current.voltage * current.amperage / 1000 * 24).toFixed(2);
            return `Basado en las condiciones actuales, la turbina está generando aproximadamente ${(current.voltage * current.amperage / 1000).toFixed(2)} kW instantáneos. La producción diaria estimada es de ${produccionEstimada} kWh si las condiciones se mantienen.`;
        }
        
        if (question.includes('viento') || question.includes('clima')) {
            return `La velocidad actual del viento es de ${current.windSpeed.toFixed(2)} m/s, que está ${
                current.windSpeed < 3 ? 'por debajo del rango óptimo' :
                current.windSpeed > 15 ? 'cerca del límite superior' :
                'dentro del rango óptimo'
            } para esta turbina.`;
        }
        
        if (question.includes('comparar') || question.includes('otras turbinas')) {
            return 'Según nuestro análisis comparativo, esta turbina está operando un 12% por encima del promedio de turbinas similares en la misma región. Este cálculo se basa en datos anónimos agregados de nuestra flota.';
        }
        
        if (question.includes('recomendar') || question.includes('sugiere') || question.includes('consejo') || question.includes('optimizar')) {
            const recommendations = [
                `Basado en el análisis de datos, recomendamos programar una inspección del sistema de orientación dentro de las próximas dos semanas para mantener la eficiencia óptima.`,
                `Considere ajustar el ángulo de las palas en 2° para aumentar la eficiencia en las condiciones actuales de viento.`,
                `Los datos sugieren que un mantenimiento preventivo de los rodamientos podría prevenir una pérdida de eficiencia en los próximos meses.`,
                `Recomendamos actualizar el firmware del controlador a la última versión para mejorar la respuesta a cambios repentinos en la dirección del viento.`
            ];
            
            return recommendations[Math.floor(Math.random() * recommendations.length)];
        }

        // NUEVAS PREGUNTAS AGREGADAS

        // Preguntas sobre costos/ahorro
        if (question.includes('costo') || question.includes('ahorro') || question.includes('dinero')) {
            const produccionMensual = current.power * 24 * 30; // kWh por mes
            const costoKwh = 0.15; // Ejemplo de precio por kWh
            const ahorro = produccionMensual * costoKwh;
            
            return `La turbina está generando un ahorro estimado de $${ahorro.toFixed(2)} al mes basado en la producción actual. Esto equivale a ${produccionMensual.toFixed(2)} kWh mensuales con un costo promedio de $${costoKwh}/kWh.`;
        }
        
        // Preguntas sobre vida útil
        if (question.includes('vida útil') || question.includes('durabilidad') || question.includes('cuánto dura')) {
            const yearsInService = 3; // Simulado
            const expectedLifespan = 20; // Años esperados
            const healthScore = healthScores.overall;
            
            return `Esta turbina tiene ${yearsInService} años de servicio. Con un índice de salud actual del ${healthScore}%, se espera que continúe operando eficientemente por ${expectedLifespan - yearsInService} años más bajo mantenimiento regular.`;
        }

        // Preguntas sobre impacto ambiental
        if (question.includes('co2') || question.includes('carbono') || question.includes('impacto ambiental')) {
            const produccionAnual = current.power * 24 * 365;
            const co2Evitado = produccionAnual * 0.5; // kg de CO2 por kWh
            
            return `La turbina está evitando la emisión de aproximadamente ${co2Evitado.toFixed(2)} kg de CO2 al año, equivalente a plantar ${(co2Evitado/22).toFixed(0)} árboles o retirar ${(co2Evitado/4800).toFixed(1)} automóviles de la circulación.`;
        }

        // Preguntas sobre histórico de producción
        if (question.includes('mejor mes') || question.includes('récord') || question.includes('máxima producción')) {
            const bestMonth = historicalData.reduce((max, data) => 
                data.power > max.power ? data : max, historicalData[0]);
            
            return `El récord de producción fue de ${bestMonth.power.toFixed(2)} kW el ${new Date(bestMonth.timestamp).toLocaleDateString()}. Las condiciones óptimas incluyeron vientos de ${bestMonth.windSpeed.toFixed(1)} m/s y una eficiencia del ${bestMonth.efficiency.toFixed(1)}%.`;
        }

        // Preguntas sobre ajustes/configuración
        if (question.includes('ajuste') || question.includes('configurar') || question.includes('calibrar')) {
            const currentEfficiency = current.efficiency;
            const windSpeed = current.windSpeed;
            
            // Simulación de cálculo de ángulo óptimo
            const optimalAngle = Math.min(15, Math.max(2, windSpeed * 0.8)); // Fórmula simplificada
            
            return `Para las condiciones actuales de viento (${windSpeed.toFixed(1)} m/s), se recomienda ajustar el ángulo de las palas a ${optimalAngle.toFixed(1)}°. Esto podría mejorar la eficiencia de ${currentEfficiency.toFixed(1)}% a ${(currentEfficiency + 2).toFixed(1)}%.`;
        }

        // Preguntas sobre temperatura y clima
        if (question.includes('temperatura') || question.includes('clima') || question.includes('condiciones atmosféricas')) {
            const temperatura = 22 + Math.random() * 3; // Simulación
            const humedad = 65 + Math.random() * 10; // Simulación
            
            return `Las condiciones climáticas actuales son: velocidad del viento ${current.windSpeed.toFixed(1)} m/s, temperatura ambiente ${temperatura.toFixed(1)}°C, humedad ${humedad.toFixed(0)}%. Estas condiciones son ${current.windSpeed > 7 && current.windSpeed < 13 ? 'óptimas' : 'subóptimas'} para la generación eléctrica.`;
        }

        // Preguntas sobre comparativa histórica
        if (question.includes('último año') || question.includes('año pasado') || question.includes('comparativa anual')) {
            const lastYearAvg = 1450; // kWh simulado
            const thisYearAvg = current.power * 24 * 365;
            const difference = ((thisYearAvg - lastYearAvg) / lastYearAvg) * 100;
            
            return `Comparado con el año pasado, la producción ha ${difference > 0 ? 'aumentado' : 'disminuido'} un ${Math.abs(difference).toFixed(1)}%. Producción del año pasado: ${lastYearAvg} kWh, proyección actual: ${thisYearAvg.toFixed(0)} kWh.`;
        }

        // Preguntas sobre ROI (Retorno de Inversión)
        if (question.includes('roi') || question.includes('retorno') || question.includes('inversión')) {
            const installationCost = 15000; // Costo simulado
            const yearlyProduction = current.power * 24 * 365;
            const electricityCost = 0.15; // $/kWh
            const yearlySavings = yearlyProduction * electricityCost;
            const roiYears = installationCost / yearlySavings;
            
            return `Con una inversión inicial de $${installationCost.toLocaleString()} y un ahorro anual de $${yearlySavings.toFixed(2)}, el retorno de inversión se estima en ${roiYears.toFixed(1)} años. Has recuperado el ${((3/roiYears)*100).toFixed(1)}% de tu inversión hasta ahora.`;
        }

        // Preguntas sobre componentes específicos
        if (question.includes('rodamiento') || question.includes('bearing')) {
            return `Los rodamientos tienen una salud del ${healthScores.byComponent.bearings.toFixed(1)}%. La última revisión fue hace ${Math.floor(Math.random() * 90) + 30} días. ${healthScores.byComponent.bearings < 80 ? 'Se recomienda una inspección próximamente.' : 'Su estado es bueno.'}`;
        }

        if (question.includes('pala') || question.includes('blade')) {
            return `Las palas tienen una salud del ${healthScores.byComponent.blades.toFixed(1)}%. ${healthScores.byComponent.blades < 85 ? 'Se detectó un ligero desgaste en el borde de ataque. Considere una inspección visual.' : 'Están en excelente condición.'}`;
        }

        if (question.includes('generador') || question.includes('generator')) {
            return `El generador tiene una salud del ${healthScores.byComponent.generator.toFixed(1)}%. La eficiencia de conversión es del ${(healthScores.byComponent.generator * 0.95).toFixed(1)}%. ${healthScores.byComponent.generator > 90 ? 'Funcionamiento óptimo.' : 'Se recomienda verificar las conexiones.'}`;
        }

        // Preguntas sobre predicciones
        if (question.includes('predicción') || question.includes('pronóstico') || question.includes('futuro')) {
            const futureProduction = current.power * 1.05; // 5% de mejora proyectada
            const futureEfficiency = current.efficiency * 1.02; // 2% de mejora proyectada
            
            return `Basado en las tendencias actuales y las mejoras planificadas, proyectamos que la producción podría aumentar a ${futureProduction.toFixed(2)} kW y la eficiencia a ${futureEfficiency.toFixed(1)}% en los próximos 6 meses si se siguen las recomendaciones de mantenimiento.`;
        }

        // Preguntas sobre métricas específicas
        if (question.includes('voltaje')) {
            return `El voltaje actual es ${current.voltage.toFixed(1)}V, ${
                current.voltage >= OPTIMAL_VOLTAGE_RANGE[0] && current.voltage <= OPTIMAL_VOLTAGE_RANGE[1] ? 
                'dentro del rango óptimo' : 'fuera del rango óptimo'
            } (${OPTIMAL_VOLTAGE_RANGE[0]}-${OPTIMAL_VOLTAGE_RANGE[1]}V). La estabilidad del voltaje es del ${(100 - Math.random() * 5).toFixed(1)}%.`;
        }

        if (question.includes('amperaje') || question.includes('corriente')) {
            return `El amperaje actual es ${current.amperage.toFixed(1)}A, ${
                current.amperage >= OPTIMAL_AMPERAGE_RANGE[0] && current.amperage <= OPTIMAL_AMPERAGE_RANGE[1] ? 
                'dentro del rango óptimo' : 'fuera del rango óptimo'
            } (${OPTIMAL_AMPERAGE_RANGE[0]}-${OPTIMAL_AMPERAGE_RANGE[1]}A). La estabilidad de la corriente es del ${(100 - Math.random() * 3).toFixed(1)}%.`;
        }

        if (question.includes('rpm') || question.includes('revoluciones')) {
            const idealRpm = current.windSpeed * RPM_WIND_RATIO;
            const rpmDeviation = ((current.rpm - idealRpm) / idealRpm) * 100;
            
            return `Las RPM actuales son ${current.rpm.toFixed(0)}, que está ${Math.abs(rpmDeviation).toFixed(1)}% ${rpmDeviation > 0 ? 'por encima' : 'por debajo'} del valor ideal para la velocidad del viento actual. ${Math.abs(rpmDeviation) > 15 ? 'Se recomienda verificar el sistema de control.' : 'Operando dentro de parámetros normales.'}`;
        }

        // Preguntas sobre alertas
        if (question.includes('alerta') || question.includes('advertencia') || question.includes('warning')) {
            const alerts = [];
            
            if (healthScores.overall < 80) alerts.push('Salud general por debajo del 80%');
            if (current.efficiency < 70) alerts.push('Eficiencia por debajo del 70%');
            if (current.windSpeed > 15) alerts.push('Velocidad del viento cerca del límite superior');
            
            const maintenance = predictNextMaintenance();
            if (maintenance.daysUntil < 7) alerts.push('Mantenimiento próximo requerido');
            
            return alerts.length > 0 ? 
                `Alertas activas: ${alerts.join(', ')}. Se recomienda monitoreo cercano.` :
                'No hay alertas activas en este momento. Todos los sistemas operan normalmente.';
        }

        // Preguntas sobre actualizaciones del sistema
        if (question.includes('actualizar') || question.includes('upgrade') || question.includes('firmware')) {
            return `La versión actual del firmware es 2.4.1. Hay una actualización disponible (versión 2.5.0) que incluye: 
            - Mejora del 3% en eficiencia de conversión
            - Mejor respuesta a cambios de dirección del viento
            - Optimización del sistema de frenado
            - Corrección de errores menores
            Se recomienda programar la actualización durante el próximo mantenimiento.`;
        }

        // Preguntas sobre seguridad
        if (question.includes('seguridad') || question.includes('seguro') || question.includes('protección')) {
            return `Sistemas de seguridad activos:
            - Freno aerodinámico: operativo
            - Protección contra sobrecarga: activa
            - Sistema anti-vibración: normal
            - Protección contra tormentas: en espera
            - Parada de emergencia: disponible
            Última prueba de seguridad: hace ${Math.floor(Math.random() * 14) + 1} días. Todos los sistemas funcionan correctamente.`;
        }
        
        // Respuesta por defecto
        return 'Puedo ayudarte con información sobre la eficiencia, mantenimiento, posibles problemas, producción energética, condiciones de viento, costos/ahorros, impacto ambiental, vida útil, configuración y recomendaciones para tu turbina. ¿Qué información específica necesitas?';
    }
    
    /**
     * Genera un reporte completo del estado de la turbina
     * @returns {Object} Reporte completo
     */
    function generateReport() {
        // En producción: generaría un reporte detallado real
        // Para demo: reporte simulado
        
        // Verificar si hay datos
        if (historicalData.length === 0) {
            return {
                status: 'error',
                message: 'No hay datos suficientes para generar un reporte'
            };
        }
        
        // Obtener datos recientes
        const last24Hours = historicalData.slice(-24);
        const current = last24Hours[last24Hours.length - 1];
        
        // Calcular producción total diaria
        const dailyProduction = last24Hours.reduce((sum, data) => {
            // Convertir kW a kWh (dividiendo por 24 para simular mediciones horarias)
            return sum + ((data.voltage * data.amperage) / 1000) / 24;
        }, 0);
        
        // Calcular eficiencia promedio
        const avgEfficiency = last24Hours.reduce((sum, data) => sum + data.efficiency, 0) / last24Hours.length;
        
        // Detectar anomalías en el período
        const anomaliesIn24h = last24Hours.filter(data => data.anomaly).length;
        
        // Generar el reporte
        return {
            status: 'success',
            timestamp: new Date(),
            turbineId: 'LIAM-F1-001', // Simulado
            period: '24 horas',
            production: {
                daily: dailyProduction.toFixed(2),
                unit: 'kWh',
                trend: calculateProductionTrend()
            },
            efficiency: {
                average: avgEfficiency.toFixed(1),
                min: Math.min(...last24Hours.map(d => d.efficiency)).toFixed(1),
                max: Math.max(...last24Hours.map(d => d.efficiency)).toFixed(1),
                unit: '%',
                trend: calculateEfficiencyTrend()
            },
            wind: {
                average: last24Hours.reduce((sum, d) => sum + d.windSpeed, 0) / last24Hours.length,
                min: Math.min(...last24Hours.map(d => d.windSpeed)),
                max: Math.max(...last24Hours.map(d => d.windSpeed)),
                unit: 'm/s'
            },
            health: {
                overall: healthScores.overall,
                components: healthScores.byComponent,
                trend: calculateHealthTrend()
            },
            anomalies: {
                count: anomaliesIn24h,
                details: last24Hours.filter(data => data.anomaly).map(d => ({
                    timestamp: d.timestamp,
                    type: d.anomaly,
                    details: `Anomalía de ${d.anomaly} detectada`
                }))
            },
            maintenance: predictNextMaintenance(),
            insights: generateInsights(current, detectAnomalies(current))
        };
    }
    
    /**
     * Calcula la tendencia de producción
     * @returns {string} Descripción de la tendencia
     */
    function calculateProductionTrend() {
        // Simulado para demo
        const trends = ['+15.2%', '-8.7%', '+4.3%', 'Sin cambios', '+10.1%', '-3.5%'];
        return `${trends[Math.floor(Math.random() * trends.length)]} respecto a la semana anterior`;
    }
    
    /**
     * Calcula la tendencia de salud
     * @returns {string} Descripción de la tendencia
     */
    function calculateHealthTrend() {
        // Simulado para demo
        if (healthScores.history.length < 2) return 'Estable';
        
        const current = healthScores.history[healthScores.history.length - 1].score;
        const previous = healthScores.history[0].score;
        const diff = current - previous;
        
        if (Math.abs(diff) < 1) return 'Estable';
        
        return `${diff > 0 ? '+' : ''}${diff.toFixed(1)}% en el último mes`;
    }
    
    // API pública
    return {
        initialize,
        analyzeTelemetry,
        answerQuestion,
        generateReport,
        getHistoricalData: () => historicalData,
        getHealthScores: () => healthScores
    };
})();

// Exportar el módulo
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TurbineAI;
} else if (typeof window !== 'undefined') {
    window.TurbineAI = TurbineAI;
    // Disparar un evento personalizado cuando TurbineAI esté listo
    const event = new CustomEvent('turbineAIReady', { detail: { TurbineAI } });
    window.dispatchEvent(event);
    console.log('TurbineAI exportado al objeto window');
}