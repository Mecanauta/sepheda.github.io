// panel-cliente.js - Funcionalidad específica para el panel del cliente

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación y proteger página
    firebase.auth().onAuthStateChanged(async (user) => {
        if (!user) {
            // Redirigir al login si no hay usuario autenticado
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
            
            // Cargar datos de turbinas del cliente
            await cargarDatosTurbinas(user.uid);
            
            // Cargar reportes recientes
            await cargarReportesRecientes(user.uid);
            
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
    
    // Función para cargar datos de turbinas
    async function cargarDatosTurbinas(userId) {
        try {
            // Obtener el documento del cliente con sus turbinas asignadas
            const clienteDoc = await firebase.firestore().collection('clientes').doc(userId).get();
            
            if (!clienteDoc.exists) {
                console.error("No se encontró información del cliente");
                return;
            }
            
            const clienteData = clienteDoc.data();
            
            // Si hay turbinas asignadas al cliente
            if (clienteData.turbinas && clienteData.turbinas.length > 0) {
                // Vamos a suponer que mostramos datos de la primera turbina
                const turbina = await firebase.firestore().collection('turbinas').doc(clienteData.turbinas[0]).get();
                
                if (turbina.exists) {
                    const turbinaData = turbina.data();
                    
                    // Actualizar métricas en la UI
                    document.getElementById('produccion-value').textContent = turbinaData.produccion_mes || '0 kWh';
                    document.getElementById('produccion-trend').textContent = turbinaData.produccion_tendencia || '0% respecto al mes anterior';
                    
                    document.getElementById('eficiencia-value').textContent = turbinaData.eficiencia || '0%';
                    document.getElementById('eficiencia-trend').textContent = turbinaData.eficiencia_tendencia || '0% respecto al mes anterior';
                    
                    // Actualizar estado de la turbina
                    const estadoElement = document.getElementById('turbina-estado');
                    if (turbinaData.estado === 'funcionando') {
                        estadoElement.className = 'status-badge status-online';
                        estadoElement.innerHTML = '<span class="status-dot dot-online"></span>Funcionando';
                    } else if (turbinaData.estado === 'mantenimiento') {
                        estadoElement.className = 'status-badge status-maintenance';
                        estadoElement.innerHTML = '<span class="status-dot dot-maintenance"></span>En Mantenimiento';
                    } else {
                        estadoElement.className = 'status-badge status-offline';
                        estadoElement.innerHTML = '<span class="status-dot dot-offline"></span>Inactiva';
                    }
                    
                    // Actualizar información adicional
                    document.getElementById('ultima-revision').textContent = `Última revisión: ${turbinaData.ultima_revision || 'N/A'}`;
                    document.getElementById('proximo-mantenimiento').textContent = `Próximo mantenimiento: ${turbinaData.proximo_mantenimiento || 'No programado'}`;
                }
            }
        } catch (error) {
            console.error("Error al cargar datos de turbinas:", error);
        }
    }
    
    // Función para cargar reportes recientes
    async function cargarReportesRecientes(userId) {
        try {
            // Consultar reportes del cliente ordenados por fecha
            const reportesSnapshot = await firebase.firestore()
                .collection('reportes')
                .where('cliente_id', '==', userId)
                .orderBy('fecha', 'desc')
                .limit(5)
                .get();
            
            const tableBody = document.getElementById('reportes-table-body');
            
            if (reportesSnapshot.empty) {
                tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No hay reportes disponibles</td></tr>';
                return;
            }
            
            let html = '';
            
            for (const doc of reportesSnapshot.docs) {
                const reporte = doc.data();
                
                // Determinar la clase de estado
                let estadoClass = '';
                if (reporte.estado === 'Completado') {
                    estadoClass = 'status-online';
                } else if (reporte.estado === 'En Proceso') {
                    estadoClass = 'status-maintenance';
                } else {
                    estadoClass = 'status-offline';
                }
                
                // Formatear fecha
                const fecha = reporte.fecha ? new Date(reporte.fecha.toDate()).toLocaleDateString('es-ES') : 'N/A';
                
                // Crear fila de reporte
                html += `
                    <tr>
                        <td>${fecha}</td>
                        <td>${reporte.tipo || 'N/A'}</td>
                        <td>
                            <span class="status-badge ${estadoClass}">${reporte.estado || 'N/A'}</span>
                        </td>
                        <td>${reporte.tecnico_nombre || 'N/A'}</td>
                        <td>
                            <button class="btn btn-secondary" onclick="verReporte('${doc.id}')">
                                <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                                Ver
                            </button>
                        </td>
                    </tr>
                `;
            }
            
            tableBody.innerHTML = html;
            
        } catch (error) {
            console.error("Error al cargar reportes:", error);
            document.getElementById('reportes-table-body').innerHTML = '<tr><td colspan="5" class="text-center">Error al cargar reportes</td></tr>';
        }
    }
    
    // Función para ver un reporte (definida globalmente)
    window.verReporte = function(reporteId) {
        alert(`Ver detalles del reporte ${reporteId}`);
        // Aquí podrías abrir un modal o redireccionar a la página de detalles
    };
});