// panel-tecnico.js - Funcionalidad específica para el panel del técnico

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
            
            // Verificar que sea un técnico
            if (userData.rol !== 'tecnico') {
                alert('No tienes permiso para acceder a esta página');
                window.location.href = 'loggin.html';
                return;
            }
            
            // Actualizar nombre de usuario
            document.querySelector('.user-name').textContent = userData.nombre || 'Técnico';
            
            // Cargar resumen de trabajo
            await cargarResumenTrabajo(user.uid);
            
            // Cargar tareas pendientes
            await cargarTareasPendientes(user.uid);
            
            // Cargar clientes para el formulario
            await cargarClientes();
            
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
    
    // Función para cargar resumen de trabajo del técnico
    async function cargarResumenTrabajo(userId) {
        try {
            // Obtener las tareas asignadas al técnico
            const tareasSnapshot = await firebase.firestore()
                .collection('tareas')
                .where('tecnico_id', '==', userId)
                .where('estado', 'in', ['Programada', 'En Proceso'])
                .get();
            
            // Contar tareas pendientes
            const totalTareas = tareasSnapshot.size;
            document.getElementById('tareas-pendientes').textContent = totalTareas;
            
            // Contar tareas para hoy
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const manana = new Date(hoy);
            manana.setDate(hoy.getDate() + 1);
            
            let tareasHoy = 0;
            tareasSnapshot.forEach(doc => {
                const tarea = doc.data();
                if (tarea.fecha_programada && tarea.fecha_programada.toDate() >= hoy && tarea.fecha_programada.toDate() < manana) {
                    tareasHoy++;
                }
            });
            
            document.getElementById('tareas-hoy').textContent = `${tareasHoy} programadas para hoy`;
            
            // Obtener alertas activas asignadas al técnico
            const alertasSnapshot = await firebase.firestore()
                .collection('alertas')
                .where('tecnico_id', '==', userId)
                .where('estado', '==', 'activa')
                .get();
            
            document.getElementById('alertas-cantidad').textContent = alertasSnapshot.size;
            
            // Consultar histórico para determinar tendencia
            const semanaAnteriorSnapshot = await firebase.firestore()
                .collection('estadisticas')
                .doc(userId)
                .get();
            
            if (semanaAnteriorSnapshot.exists) {
                const stats = semanaAnteriorSnapshot.data();
                if (stats.alertas_semana_anterior) {
                    const diff = alertasSnapshot.size - stats.alertas_semana_anterior;
                    const porcentaje = stats.alertas_semana_anterior > 0 
                        ? Math.round((diff / stats.alertas_semana_anterior) * 100) 
                        : 0;
                    
                    const tendenciaElement = document.getElementById('alertas-tendencia');
                    
                    if (diff < 0) {
                        tendenciaElement.className = 'card-trend trend-up';
                        tendenciaElement.innerHTML = `
                            <svg class="trend-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="18 15 12 9 6 15"></polyline>
                            </svg>
                            ${Math.abs(porcentaje)}% menos que la semana pasada
                        `;
                    } else if (diff > 0) {
                        tendenciaElement.className = 'card-trend trend-down';
                        tendenciaElement.innerHTML = `
                            <svg class="trend-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                            ${porcentaje}% más que la semana pasada
                        `;
                    } else {
                        tendenciaElement.className = 'card-trend';
                        tendenciaElement.innerHTML = 'Sin cambios respecto a la semana pasada';
                    }
                }
            }
            
            // Obtener turbinas asignadas
            const turbinasSnapshot = await firebase.firestore()
                .collection('turbinas')
                .where('tecnicos_asignados', 'array-contains', userId)
                .get();
            
            document.getElementById('turbinas-cantidad').textContent = turbinasSnapshot.size;
            
            // Contar estado de turbinas
            let funcionando = 0;
            let mantenimiento = 0;
            let inactivas = 0;
            
            turbinasSnapshot.forEach(doc => {
                const turbina = doc.data();
                if (turbina.estado === 'funcionando') {
                    funcionando++;
                } else if (turbina.estado === 'mantenimiento') {
                    mantenimiento++;
                } else {
                    inactivas++;
                }
            });
            
            let estadoText = '';
            if (funcionando > 0) {
                estadoText += `${funcionando} funcionando`;
            }
            if (mantenimiento > 0) {
                estadoText += estadoText ? `, ${mantenimiento} en mantenimiento` : `${mantenimiento} en mantenimiento`;
            }
            if (inactivas > 0) {
                estadoText += estadoText ? `, ${inactivas} inactivas` : `${inactivas} inactivas`;
            }
            
            document.getElementById('turbinas-estado').textContent = estadoText || 'No hay turbinas asignadas';
            
        } catch (error) {
            console.error("Error al cargar resumen de trabajo:", error);
        }
    }
    
    // Función para cargar tareas pendientes
    async function cargarTareasPendientes(userId) {
        try {
            // Consultar tareas asignadas al técnico ordenadas por fecha
            const tareasSnapshot = await firebase.firestore()
                .collection('tareas')
                .where('tecnico_id', '==', userId)
                .where('estado', 'in', ['Programada', 'En Proceso'])
                .orderBy('fecha_programada', 'asc')
                .limit(5)
                .get();
            
            const tableBody = document.getElementById('tareas-table-body');
            
            if (tareasSnapshot.empty) {
                tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No hay tareas pendientes</td></tr>';
                return;
            }
            
            let html = '';
            
            for (const doc of tareasSnapshot.docs) {
                const tarea = doc.data();
                
                // Determinar la clase de estado
                let estadoClass = '';
                if (tarea.estado === 'En Proceso') {
                    estadoClass = 'status-online';
                } else if (tarea.estado === 'Programada') {
                    estadoClass = 'status-maintenance';
                } else {
                    estadoClass = 'status-offline';
                }
                
                // Formatear fecha
                const fecha = tarea.fecha_programada ? new Date(tarea.fecha_programada.toDate()).toLocaleDateString('es-ES') : 'N/A';
                
                // Crear fila de tarea
                html += `
                    <tr>
                        <td>${tarea.id || doc.id}</td>
                        <td>${tarea.cliente_nombre || 'N/A'}</td>
                        <td>${tarea.turbina_id || 'N/A'}</td>
                        <td>${tarea.tipo || 'N/A'}</td>
                        <td>
                            <span class="status-badge ${estadoClass}">${tarea.estado || 'N/A'}</span>
                        </td>
                        <td>${fecha}</td>
                        <td>
                            ${tarea.estado === 'Programada' ? 
                                `<button class="btn btn-secondary" onclick="iniciarTarea('${doc.id}')">
                                    <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                    Iniciar
                                </button>` : 
                                `<button class="btn btn-success" onclick="completarTarea('${doc.id}')">
                                    <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                    Completar
                                </button>`
                            }
                        </td>
                    </tr>
                `;
            }
            
            tableBody.innerHTML = html;
            
        } catch (error) {
            console.error("Error al cargar tareas pendientes:", error);
            document.getElementById('tareas-table-body').innerHTML = '<tr><td colspan="7" class="text-center">Error al cargar tareas</td></tr>';
        }
    }
    
    // Función para cargar clientes en el formulario
    async function cargarClientes() {
        try {
            // Obtener todos los clientes
            const clientesSnapshot = await firebase.firestore().collection('usuarios')
                .where('rol', '==', 'cliente')
                .get();
            
            const clienteSelect = document.getElementById('cliente');
            clienteSelect.innerHTML = '<option value="">Seleccionar cliente</option>';
            
            clientesSnapshot.forEach(doc => {
                const cliente = doc.data();
                clienteSelect.innerHTML += `<option value="${doc.id}">${cliente.nombre || cliente.email}</option>`;
            });
            
            // Evento para cargar turbinas al seleccionar un cliente
            clienteSelect.addEventListener('change', async function() {
                const clienteId = this.value;
                await cargarTurbinas(clienteId);
            });
            
        } catch (error) {
            console.error("Error al cargar clientes:", error);
        }
    }
    
    // Función para cargar turbinas según el cliente seleccionado
    async function cargarTurbinas(clienteId) {
        try {
            const turbinaSelect = document.getElementById('turbina');
            turbinaSelect.innerHTML = '<option value="">Seleccionar turbina</option>';
            
            if (!clienteId) return;
            
            // Obtener el documento del cliente para ver qué turbinas tiene asignadas
            const clienteDoc = await firebase.firestore().collection('clientes').doc(clienteId).get();
            
            if (!clienteDoc.exists || !clienteDoc.data().turbinas) {
                turbinaSelect.innerHTML += '<option value="" disabled>No hay turbinas asignadas</option>';
                return;
            }
            
            const turbinasIds = clienteDoc.data().turbinas;
            
            // Obtener detalles de cada turbina
            for (const turbinaId of turbinasIds) {
                const turbinaDoc = await firebase.firestore().collection('turbinas').doc(turbinaId).get();
                
                if (turbinaDoc.exists) {
                    const turbina = turbinaDoc.data();
                    turbinaSelect.innerHTML += `<option value="${turbinaId}">${turbina.modelo || ''} - ${turbina.serial || turbinaId}</option>`;
                }
            }
            
        } catch (error) {
            console.error("Error al cargar turbinas:", error);
        }
    }
    
    // Manejar envío del formulario de nuevo informe
    document.getElementById('reportForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            const user = firebase.auth().currentUser;
            if (!user) {
                alert('Debes iniciar sesión para crear un informe');
                return;
            }
            
            // Obtener valores del formulario
            const clienteId = document.getElementById('cliente').value;
            const turbinaId = document.getElementById('turbina').value;
            const tipo = document.getElementById('tipo').value;
            const detalles = document.getElementById('detalles').value;
            
            // Validaciones básicas
            if (!clienteId || !turbinaId || !tipo || !detalles) {
                alert('Por favor, completa todos los campos');
                return;
            }
            
            // Obtener nombre del cliente
            const clienteDoc = await firebase.firestore().collection('usuarios').doc(clienteId).get();
            const clienteNombre = clienteDoc.exists ? 
                (clienteDoc.data().nombre || clienteDoc.data().email) : 'Cliente';
            
            // Obtener información del técnico
            const tecnicoDoc = await firebase.firestore().collection('usuarios').doc(user.uid).get();
            const tecnicoNombre = tecnicoDoc.exists ? 
                (tecnicoDoc.data().nombre || tecnicoDoc.data().email) : 'Técnico';
            
            // Crear el reporte
            await firebase.firestore().collection('reportes').add({
                cliente_id: clienteId,
                cliente_nombre: clienteNombre,
                turbina_id: turbinaId,
                tecnico_id: user.uid,
                tecnico_nombre: tecnicoNombre,
                tipo: tipo,
                estado: 'Completado',
                fecha: firebase.firestore.FieldValue.serverTimestamp(),
                detalles: detalles
            });
            
            // Limpiar formulario
            document.getElementById('reportForm').reset();
            
            alert('Informe generado correctamente');
            
        } catch (error) {
            console.error("Error al generar informe:", error);
            alert("Error al generar el informe");
        }
    });
    
    // Botón cancelar
    document.getElementById('cancelarInforme').addEventListener('click', function() {
        document.getElementById('reportForm').reset();
    });
    
    // Botón para nuevo informe (mostrar/ocultar formulario)
    document.getElementById('newReportBtn').addEventListener('click', function() {
        const formCard = document.getElementById('reportForm').closest('.card');
        formCard.scrollIntoView({ behavior: 'smooth' });
    });
});

// Funciones para el manejo de tareas
window.iniciarTarea = async function(tareaId) {
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            alert('Debes iniciar sesión para realizar esta acción');
            return;
        }
        
        // Actualizar estado de la tarea a "En Proceso"
        await firebase.firestore().collection('tareas').doc(tareaId).update({
            estado: 'En Proceso',
            fecha_inicio: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        alert('Tarea iniciada correctamente');
        
        // Recargar la lista de tareas
        await cargarTareasPendientes(user.uid);
        
    } catch (error) {
        console.error("Error al iniciar tarea:", error);
        alert("Error al iniciar la tarea");
    }
};

window.completarTarea = async function(tareaId) {
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            alert('Debes iniciar sesión para realizar esta acción');
            return;
        }
        
        // Solicitar detalles de la finalización
        const detalles = prompt("Ingrese los detalles de la finalización de la tarea:", "");
        
        if (detalles === null) {
            return; // Usuario canceló el prompt
        }
        
        // Actualizar estado de la tarea a "Completada"
        await firebase.firestore().collection('tareas').doc(tareaId).update({
            estado: 'Completada',
            fecha_completado: firebase.firestore.FieldValue.serverTimestamp(),
            detalles_finalizacion: detalles
        });
        
        // Crear reporte automático
        const tareaDoc = await firebase.firestore().collection('tareas').doc(tareaId).get();
        const tarea = tareaDoc.data();
        
        // Crear un reporte asociado a esta tarea
        await firebase.firestore().collection('reportes').add({
            tarea_id: tareaId,
            cliente_id: tarea.cliente_id,
            cliente_nombre: tarea.cliente_nombre,
            turbina_id: tarea.turbina_id,
            tecnico_id: user.uid,
            tecnico_nombre: tarea.tecnico_nombre || 'Técnico',
            tipo: tarea.tipo,
            estado: 'Completado',
            fecha: firebase.firestore.FieldValue.serverTimestamp(),
            detalles: detalles
        });
        
        alert('Tarea completada correctamente y reporte generado');
        
        // Recargar la lista de tareas y el resumen
        await cargarTareasPendientes(user.uid);
        await cargarResumenTrabajo(user.uid);
        
    } catch (error) {
        console.error("Error al completar tarea:", error);
        alert("Error al completar la tarea");
    }
};