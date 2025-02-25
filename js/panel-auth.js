// Script para proteger los paneles basado en roles

document.addEventListener('DOMContentLoaded', function() {
    // Verificar la autenticación y el rol
    firebase.auth().onAuthStateChanged(async (user) => {
        try {
            if (!user) {
                // Usuario no autenticado, redirigir al login
                window.location.href = 'loggin.html';
                return;
            }
            
            // Determinar qué página estamos protegiendo
            const currentPage = window.location.pathname.split('/').pop();
            let requiredRole = null;
            
            if (currentPage === 'panel-cliente.html') {
                requiredRole = 'cliente';
            } else if (currentPage === 'panel-tecnico.html') {
                requiredRole = 'tecnico';
            } else if (currentPage === 'panel-admin.html') {
                requiredRole = 'admin';
            }
            
            if (!requiredRole) {
                return; // No estamos en una página que requiera protección
            }
            
            // Obtener el rol del usuario actual
            const userDoc = await firebase.firestore().collection('usuarios').doc(user.uid).get();
            
            if (!userDoc.exists) {
                console.error("No se encontró documento de usuario");
                alert("Error: No se encontró información de usuario. Contacta al administrador.");
                await firebase.auth().signOut();
                window.location.href = 'loggin.html';
                return;
            }
            
            const userData = userDoc.data();
            const userRole = userData.rol;
            
            // Verificar si el usuario tiene el rol adecuado para esta página
            if (userRole !== requiredRole) {
                alert(`No tienes permisos para acceder a esta página. Tu rol es: ${userRole}`);
                
                // Redirigir al panel correspondiente a su rol
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
                        window.location.href = 'loggin.html';
                }
                return;
            }
            
            // Si llegamos aquí, el usuario está autorizado
            console.log(`Usuario autorizado con rol: ${userRole}`);
            
            // Actualizar la interfaz con la información del usuario
            const userNameElement = document.querySelector('.user-name');
            if (userNameElement && userData.nombre) {
                userNameElement.textContent = userData.nombre;
            }
            
            // Configurar el botón de logout
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', async () => {
                    try {
                        await firebase.auth().signOut();
                        window.location.href = 'loggin.html';
                    } catch (error) {
                        console.error("Error al cerrar sesión:", error);
                        alert("Error al cerrar sesión");
                    }
                });
            }
            
        } catch (error) {
            console.error("Error al verificar autenticación:", error);
            alert("Error al verificar permisos");
            window.location.href = 'loggin.html';
        }
    });
});