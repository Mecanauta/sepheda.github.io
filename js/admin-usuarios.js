// Módulo de gestión de usuarios para el panel de administrador
const AdminUsuarios = (function() {
    // Variables privadas
    let modal, userForm, modalTitle, userIdField, formModeField;
    let closeModalBtn, cancelBtn, statusToggle, statusText;
    
    // Inicialización del módulo
    function init() {
        console.log("Inicializando módulo de gestión de usuarios...");
        
        // Cargar el modal HTML mediante AJAX
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'admin-usuarios-modal.html', true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                // Insertar el HTML del modal en el documento
                document.body.insertAdjacentHTML('beforeend', xhr.responseText);
                
                // Inicializar referencias después de añadir el modal al DOM
                initializeReferences();
                setupEventListeners();
                
                // Cargar usuarios al inicio
                loadUsers();
            }
        };
        xhr.send();
    }
    
    // Inicializar referencias a elementos DOM
    function initializeReferences() {
        modal = document.getElementById('userModal');
        userForm = document.getElementById('userForm');
        modalTitle = document.getElementById('modalTitle');
        userIdField = document.getElementById('userId');
        formModeField = document.getElementById('formMode');
        closeModalBtn = modal.querySelector('.close');
        cancelBtn = document.getElementById('cancelUserForm');
        statusToggle = document.getElementById('userStatus');
        statusText = document.getElementById('statusText');
    }
    
    // Configurar listeners de eventos
    function setupEventListeners() {
        // Evento para botón de añadir usuario (debe existir en el panel de admin)
        const addUserBtn = document.getElementById('newUserBtn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', showAddUserModal);
        }
        
        // Eventos para cerrar modal
        closeModalBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeModal();
            }
        });
        
        // Evento toggle de estado
        statusToggle.addEventListener('change', function() {
            statusText.textContent = this.checked ? 'Activo' : 'Inactivo';
        });
        
        // Evento envío del formulario
        userForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleUserFormSubmit();
        });
    }
    
    // Mostrar modal para añadir usuario
    function showAddUserModal() {
        userForm.reset();
        modalTitle.textContent = 'Añadir Usuario';
        userIdField.value = '';
        formModeField.value = 'add';
        document.getElementById('passwordGroup').style.display = 'block';
        document.getElementById('userPassword').required = true;
        statusToggle.checked = true;
        statusText.textContent = 'Activo';
        modal.style.display = 'block';
    }
    
    // Mostrar modal para editar usuario
    function showEditUserModal(userId, userData) {
        userForm.reset();
        modalTitle.textContent = 'Editar Usuario';
        document.getElementById('userName').value = userData.nombre || '';
        document.getElementById('userEmail').value = userData.email || '';
        document.getElementById('userRole').value = userData.rol || '';
        document.getElementById('passwordGroup').style.display = 'block';
        document.getElementById('userPassword').required = false;
        
        statusToggle.checked = userData.activo !== false;
        statusText.textContent = statusToggle.checked ? 'Activo' : 'Inactivo';
        
        userIdField.value = userId;
        formModeField.value = 'edit';
        modal.style.display = 'block';
    }
    
    // Cerrar modal
    function closeModal() {
        modal.style.display = 'none';
    }
    
    // Manejar envío del formulario
    async function handleUserFormSubmit() {
        const userName = document.getElementById('userName').value;
        const userEmail = document.getElementById('userEmail').value;
        const userPassword = document.getElementById('userPassword').value;
        const userRole = document.getElementById('userRole').value;
        const userActive = statusToggle.checked;
        const userId = userIdField.value;
        const formMode = formModeField.value;
        
        try {
            if (formMode === 'add') {
                // Crear nuevo usuario (requiere funciones de servidor Firebase)
                // Esta parte requiere Firebase Admin SDK o Cloud Functions
                
                // Simulación para desarrollo
                const newUserId = 'user-' + new Date().getTime();
                await firebase.firestore().collection('usuarios').doc(newUserId).set({
                    nombre: userName,
                    email: userEmail,
                    rol: userRole,
                    activo: userActive,
                    fecha_creacion: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                alert('Usuario añadido a Firestore. NOTA: Para crear la cuenta de autenticación completa se requiere configuración de servidor.');
            } else if (formMode === 'edit') {
                // Actualizar usuario existente
                const userData = {
                    nombre: userName,
                    email: userEmail,
                    rol: userRole,
                    activo: userActive,
                    fecha_actualizacion: firebase.firestore.FieldValue.serverTimestamp()
                };
                
                await firebase.firestore().collection('usuarios').doc(userId).update(userData);
                
                if (userPassword) {
                    // Actualizar contraseña (requiere Admin SDK o función de servidor)
                    alert('La actualización de contraseña requiere configuración de servidor con Firebase Admin SDK');
                }
                
                alert('Datos de usuario actualizados correctamente');
            }
            
            closeModal();
            loadUsers(); // Recargar la lista
        } catch (error) {
            console.error('Error al guardar usuario:', error);
            alert('Error al guardar usuario: ' + error.message);
        }
    }
    
    // Cargar usuarios desde Firestore
    async function loadUsers() {
        try {
            const usersSnapshot = await firebase.firestore()
                .collection('usuarios')
                .orderBy('nombre')
                .limit(20)
                .get();
            
            const tableBody = document.getElementById('usuarios-table-body');
            if (!tableBody) {
                console.error("No se encuentra la tabla de usuarios");
                return;
            }
            
            if (usersSnapshot.empty) {
                tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No hay usuarios registrados</td></tr>';
                return;
            }
            
            let html = '';
            
            usersSnapshot.forEach(doc => {
                const user = doc.data();
                const userId = doc.id;
                
                // Clase de estado
                let estadoClass = user.activo !== false ? 'status-online' : 'status-offline';
                
                // Formatear fecha
                let ultimoAcceso = 'Nunca';
                if (user.ultimo_acceso) {
                    ultimoAcceso = new Date(user.ultimo_acceso.toDate()).toLocaleString('es-ES');
                }
                
                html += `
                    <tr>
                        <td>#U-${userId.substring(0, 4)}</td>
                        <td>${user.nombre || 'N/A'}</td>
                        <td>${user.email || 'N/A'}</td>
                        <td>${user.rol || 'N/A'}</td>
                        <td>
                            <span class="status-badge ${estadoClass}">${user.activo !== false ? 'Activo' : 'Inactivo'}</span>
                        </td>
                        <td>${ultimoAcceso}</td>
                        <td>
                            <button class="btn btn-secondary btn-sm" onclick="AdminUsuarios.editUser('${userId}')">
                                <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                                Editar
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="AdminUsuarios.deleteUser('${userId}')">
                                <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                                Eliminar
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            tableBody.innerHTML = html;
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            alert('Error al cargar usuarios: ' + error.message);
        }
    }
    
    // Editar usuario
    async function editUser(userId) {
        try {
            const userDoc = await firebase.firestore().collection('usuarios').doc(userId).get();
            
            if (!userDoc.exists) {
                alert('El usuario no existe');
                return;
            }
            
            const userData = userDoc.data();
            showEditUserModal(userId, userData);
        } catch (error) {
            console.error('Error al obtener datos de usuario:', error);
            alert('Error al obtener datos de usuario: ' + error.message);
        }
    }
    
    // Eliminar usuario
    async function deleteUser(userId) {
        if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
            return;
        }
        
        try {
            // Nota: La eliminación completa requiere función de servidor para Auth
            await firebase.firestore().collection('usuarios').doc(userId).delete();
            alert('Usuario eliminado de Firestore. NOTA: Para eliminación completa de la cuenta se requiere configuración de servidor.');
            loadUsers();
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            alert('Error al eliminar usuario: ' + error.message);
        }
    }
    
    // Interfaz pública del módulo
    return {
        init: init,
        editUser: editUser,
        deleteUser: deleteUser
    };
})();

// Inicializar el módulo cuando el documento esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si estamos en el panel de administrador
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'panel-admin.html') {
        AdminUsuarios.init();
    }
});