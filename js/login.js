document.addEventListener('DOMContentLoaded', function() {
    const clienteBtn = document.getElementById('clienteBtn');
    const tecnicoBtn = document.getElementById('tecnicoBtn');
    const adminBtn = document.getElementById('adminBtn');
    const loginForm = document.getElementById('loginForm');
    let userType = 'cliente'; // Valor predeterminado
    
    // Función para resetear todos los botones
    function resetButtons() {
        clienteBtn.classList.remove('active');
        tecnicoBtn.classList.remove('active');
        adminBtn.classList.remove('active');
    }
    
    // Cambiar entre tipos de usuario
    clienteBtn.addEventListener('click', function() {
        resetButtons();
        clienteBtn.classList.add('active');
        userType = 'cliente';
    });
    
    tecnicoBtn.addEventListener('click', function() {
        resetButtons();
        tecnicoBtn.classList.add('active');
        userType = 'tecnico';
    });
    
    adminBtn.addEventListener('click', function() {
        resetButtons();
        adminBtn.classList.add('active');
        userType = 'admin';
    });
    
    // Manejar envío del formulario
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorElement = document.getElementById('login-error');
        errorElement.style.display = 'none';
        
        try {
            // 1. Intentar iniciar sesión con Firebase
            await firebase.auth().signInWithEmailAndPassword(email, password);
            
            // 2. Obtener el usuario actual
            const usuario = firebase.auth().currentUser;
            
            // 3. Consultar el rol del usuario en Firestore
            const userDoc = await firebase.firestore().collection('usuarios').doc(usuario.uid).get();
            
            if (!userDoc.exists) {
                throw new Error("No se encontró información de usuario");
            }
            
            const userData = userDoc.data();
            const userRole = userData.rol;
            
            // 4. Verificar si el rol coincide con el seleccionado
            if (userRole !== userType) {
                // Si los roles no coinciden, mostramos un mensaje de error
                errorElement.textContent = `Has iniciado sesión como ${userRole}, pero seleccionaste ${userType}`;
                errorElement.style.display = 'block';
                await firebase.auth().signOut();
                return;
            }
            
            // 5. Redireccionar según el tipo de usuario
            switch(userRole) {
                case 'cliente':
                    window.location.href = 'panel-cliente.html';
                    break;
                case 'tecnico':
                    window.location.href = 'panel-tecnico.html';
                    break;
                case 'admin':
                    window.location.href = 'panel-admin.html';
                    break;
                default:
                    throw new Error("Rol de usuario no reconocido");
            }
            
        } catch (error) {
            console.error("Error en inicio de sesión:", error);
            
            let mensajeError = "Error en el inicio de sesión.";
            
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                mensajeError = "Credenciales incorrectas. Por favor, inténtelo de nuevo.";
            } else if (error.code === 'auth/too-many-requests') {
                mensajeError = "Demasiados intentos fallidos. Por favor, inténtelo más tarde.";
            } else if (error.message.includes("No se encontró información")) {
                mensajeError = "No se encontró información de usuario. Contacte al administrador.";
            } else if (error.message.includes("Rol de usuario no reconocido")) {
                mensajeError = "Tipo de usuario no válido. Contacte al administrador.";
            }
            
            // Mostrar mensaje de error en la interfaz
            errorElement.textContent = mensajeError;
            errorElement.style.display = 'block';
        }
    });
    
    // Verificar si hay usuario ya autenticado al cargar la página
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            try {
                // Verificar el rol del usuario actual
                const userDoc = await firebase.firestore().collection('usuarios').doc(user.uid).get();
                
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    
                    // Seleccionar automáticamente el tipo de usuario correcto
                    switch(userData.rol) {
                        case 'cliente':
                            resetButtons();
                            clienteBtn.classList.add('active');
                            userType = 'cliente';
                            break;
                        case 'tecnico':
                            resetButtons();
                            tecnicoBtn.classList.add('active');
                            userType = 'tecnico';
                            break;
                        case 'admin':
                            resetButtons();
                            adminBtn.classList.add('active');
                            userType = 'admin';
                            break;
                    }
                }
            } catch (error) {
                console.error("Error al verificar usuario actual:", error);
            }
        }
    });
});