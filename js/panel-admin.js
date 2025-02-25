// panel-admin.js - Funcionalidad específica para el panel del administrador

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
            
            // Verificar que sea un administrador
            if (userData.rol !== 'admin') {
                alert('No tienes permiso para acceder a esta página');
                window.location.href = 'loggin.html';
                return;
            }
            
            // Actualizar nombre de usuario
            document.querySelector('.user-name').textContent = userData.nombre || 'Administrador';
            
            // Cargar estadísticas generales
            await cargarEstadisticasGenerales();
            
            // Cargar lista de usuarios
            await cargarUsuarios();
            
            // Cargar técnicos para formulario de asignación
            await cargarTecnicosParaFormulario();
            
            // Cargar clientes para formulario de asignación
            await cargarClientesParaFormulario();
            
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
    
    // Función para cargar estadísticas generales
    async function cargarEstadisticasGenerales() {
        try {
            // Contar clientes activos
            const clientesSnapshot = await firebase.firestore()
                .collection('usuarios')
                .where('rol', '==', 'cliente')
                .where('activo', '==', true)
                .get();
            
            document.getElementById('clientes-cantidad').textContent = clientesSnapshot.size;
            
            // Contar nuevos clientes este mes
            const inicioMes = new Date();
            inicioMes.setDate(1);
            inicioMes.setHours(0, 0, 0, 0);
            
            const clientesNuevosSnapshot = await firebase.firestore()
                .collection('usuarios')
                .where('rol', '==', 'cliente')
                .where('fecha_registro', '>=', inicioMes)
                .get();
            
            document.getElementById('clientes-trend').textContent = `${clientesNuevosSnapshot.size} nuevos este mes`;
            
            // Contar turbinas instaladas
            const turbinasSnapshot = await firebase.firestore()
                .collection('turbinas')
                .get();
            
            document.getElementById('turbinas-cantidad').textContent = turbinasSnapshot.size;
            
            // Contar estados de turbinas
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
                estadoText += `${funcionando} activas`;
            }
            if (mantenimiento > 0) {
                estadoText += estadoText ? `, ${mantenimiento} en mantenimiento` : `${mantenimiento} en mantenimiento`;
            }
            if (inactivas > 0) {
                estadoText += estadoText ? `, ${inactivas} inactivas` : `${inactivas} inactivas`;
            }
            
            document.getElementById('turbinas-estado').textContent = estadoText || 'No hay turbinas registradas';
            
            // Obtener producción total mensual (simulada)
            const totalProduccion = await firebase.firestore()
                .collection('estadisticas')
                .doc('global')
                .get();
            
            if (totalProduccion.exists) {
                const stats = totalProduccion.data();
                document.getElementById('produccion-value').textContent = stats.produccion_total_mes || '0 kWh';
                
                if (stats.produccion_mes_anterior) {
                    const diff = stats.produccion_total_mes - stats.produccion_mes_anterior;
                    const porcentaje = stats.produccion_mes_anterior > 0 
                        ? Math.round((diff / stats.produccion_mes_anterior) * 100)
                        : 0;
                    
                    const tendenciaElement = document.getElementById('produccion-trend');
                    
                    if (diff > 0) {
                        tendenciaElement.className = 'card-trend trend-up';
                        tendenciaElement.innerHTML = `
                            <svg class="trend-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="18 15 12 9 6 15"></polyline>
                            </svg>
                            ${porcentaje}% respecto al mes anterior
                        `;
                    } else if (diff < 0) {
                        tendenciaElement.className = 'card-trend trend-down';
                        tendenciaElement.innerHTML = `
                            <svg class="trend-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                            ${Math.abs(porcentaje)}% menos que el mes anterior
                        `;
                    } else {
                        tendenciaElement.className = 'card-trend';
                        tendenciaElement.textContent = 'Sin cambios respecto al mes anterior';
                    }
                }
            }
            
        } catch (error) {
            console.error("Error al cargar estadísticas generales:", error);
        }
    }
    
    // Función para cargar usuarios en la tabla
    async function cargarUsuarios() {
        try {
            // Obtener todos los usuarios
            const usuariosSnapshot = await firebase.firestore()
                .collection('usuarios')
                .limit(10)
                .get();
            
            const tableBody = document.getElementById('usuarios-table-body');
            
            if (usuariosSnapshot.empty) {
                tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No hay usuarios registrados</td></tr>';
                return;
            }
            
            let html = '';
            
            for (const doc of usuariosSnapshot.docs) {
                const usuario = doc.data();
                
                // Determinar la clase de estado
                let estadoClass = usuario.activo ? 'status-online' : 'status-offline';
                
                // Formatear fecha
                let ultimoAcceso = 'Nunca';
                if (usuario.ultimo_acceso) {
                    ultimoAcceso = new Date(usuario.ultimo_acceso.toDate()).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                }
                
                // Crear fila de usuario
                html += `
                    <tr>
                        <td>#U-${doc.id.substring(0, 4)}</td>
                        <td>${usuario.nombre || usuario.email || 'N/A'}</td>
                        <td>${usuario.email || 'N/A'}</td>
                        <td>${usuario.rol || 'N/A'}</td>
                        <td>
                            <span class="status-badge ${estadoClass}">${usuario.activo ? 'Activo' : 'Inactivo'}</span>
                        </td>
                        <td>${ultimoAcceso}</td>
                        <td>
                            <button class="btn btn-secondary" onclick="editarUsuario('${doc.id}')">
                                <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                                Editar
                            </button>
                        </td>
                    </tr>
                `;
            }
            
            tableBody.innerHTML = html;
            
        } catch (error) {
            console.error("Error al cargar usuarios:", error);
            document.getElementById('usuarios-table-body').innerHTML = '<tr><td colspan="7" class="text-center">Error al cargar usuarios</td></tr>';
        }
    }
    
    // Función para cargar técnicos en el formulario de asignación
    async function cargarTecnicosParaFormulario() {
        try {
            // Obtener todos los técnicos
            const tecnicosSnapshot = await firebase.firestore()
                .collection('usuarios')
                .where('rol', '==', 'tecnico')
                .where('activo', '==', true)
                .get();
            
            const tecnicoSelect = document.getElementById('technician');
            tecnicoSelect.innerHTML = '<option value="">Seleccionar técnico</option>';
            
            tecnicosSnapshot.forEach(doc => {
                const tecnico = doc.data();
                tecnicoSelect.innerHTML += `<option value="${doc.id}">${tecnico.nombre || tecnico.email}</option>`;
            });
            
        } catch (error) {
            console.error("Error al cargar técnicos:", error);
        }
    }
    
    // Función para cargar clientes en el formulario de asignación
    async function cargarClientesParaFormulario() {
        try {
            // Obtener todos los clientes
            const clientesSnapshot = await firebase.firestore()
                .collection('usuarios')
                .where('rol', '==', 'cliente')
                .where('activo', '==', true)
                .get();
            
            const clienteSelect = document.getElementById('client');
            clienteSelect.innerHTML = '<option value="">Seleccionar cliente</option>';
            
            clientesSnapshot.forEach(doc => {
                const cliente = doc.data();
                clienteSelect.innerHTML += `<option value="${doc.id}">${cliente.nombre || cliente.email}</option>`;
            });
            
            // Evento para cargar turbinas al seleccionar un cliente
            clienteSelect.addEventListener('change', async function() {
                const clienteId = this.value;
                await cargarTurbinasParaFormulario(clienteId);
            });
            
        } catch (error) {
            console.error("Error al cargar clientes:", error);
        }
    }
    
    // Función para cargar turbinas según el cliente seleccionado
    async function cargarTurbinasParaFormulario(clienteId) {
        try {
            const turbinaSelect = document.getElementById('turbine');
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
    
    // Manejar envío del formulario de asignación de tareas
    document.getElementById('taskForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            // Obtener valores del formulario
            const tecnicoId = document.getElementById('technician').value;
            const clienteId = document.getElementById('client').value;
            const turbinaId = document.getElementById('turbine').value;
            const tipoTarea = document.getElementById('taskType').value;
            const fechaTarea = document.getElementById('taskDate').value;
            const detallesTarea = document.getElementById('taskDetails').value;
            
            // Validaciones básicas
            if (!tecnicoId || !clienteId || !turbinaId || !tipoTarea || !fechaTarea) {
                alert('Por favor, completa todos los campos obligatorios');
                return;
            }
            
            // Obtener nombre del cliente
            const clienteDoc = await firebase.firestore().collection('usuarios').doc(clienteId).get();
            const clienteNombre = clienteDoc.exists ? 
                (clienteDoc.data().nombre || clienteDoc.data().email) : 'Cliente';
            
            // Obtener nombre del técnico
            const tecnicoDoc = await firebase.firestore().collection('usuarios').doc(tecnicoId).get();
            const tecnicoNombre = tecnicoDoc.exists ? 
                (tecnicoDoc.data().nombre || tecnicoDoc.data().email) : 'Técnico';
            
            // Crear fecha programada como timestamp
            const fechaProgramada = new Date(fechaTarea);
            
            // Crear la tarea
            await firebase.firestore().collection('tareas').add({
                cliente_id: clienteId,
                cliente_nombre: clienteNombre,
                turbina_id: turbinaId,
                tecnico_id: tecnicoId,
                tecnico_nombre: tecnicoNombre,
                tipo: tipoTarea,
                descripcion: detallesTarea,
                estado: 'Programada',
                prioridad: 'Media', // Por defecto
                fecha_creacion: firebase.firestore.FieldValue.serverTimestamp(),
                fecha_programada: firebase.firestore.Timestamp.fromDate(fechaProgramada)
            });
            
            // Limpiar formulario
            document.getElementById('taskForm').reset();
            
            alert('Tarea asignada correctamente');
            
        } catch (error) {
            console.error("Error al asignar tarea:", error);
            alert("Error al asignar la tarea");
        }
    });
    
    // Botón para añadir nuevo usuario
    document.getElementById('newUserBtn').addEventListener('click', function() {
        alert('Esta funcionalidad requiere integración con Firebase Authentication para crear nuevos usuarios.');
        // Aquí se podría abrir un modal con un formulario para crear usuarios
    });
});

// Funciones para gestión de usuarios
window.editarUsuario = function(userId) {
    // Aquí se podría abrir un modal con un formulario para editar usuarios
    alert(`Editar usuario con ID: ${userId}`);
};