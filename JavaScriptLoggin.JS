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
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Simulamos una validación simple (en producción esto se haría con una API o backend)
        if (validarCredenciales(email, password, userType)) {
            // Redireccionar según el tipo de usuario
            switch(userType) {
                case 'cliente':
                    window.location.href = 'panel-cliente.html';
                    break;
                case 'tecnico':
                    window.location.href = 'panel-tecnico.html';
                    break;
                case 'admin':
                    window.location.href = 'panel-admin.html';
                    break;
            }
        } else {
            alert('Credenciales incorrectas. Por favor, inténtelo de nuevo.');
        }
    });
    
    // Función de validación simple (simulada)
    // En un entorno real, esto se haría mediante una llamada a un servidor
    function validarCredenciales(email, password, tipo) {
        // Para fines de demostración, vamos a aceptar cualquier correo que termine con @sepheda.com
        // y cualquier contraseña con al menos 6 caracteres
        // Usuarios de prueba para demostración:
        const usuariosValidos = {
            'cliente': { email: 'cliente@sepheda.com', password: '123456' },
            'tecnico': { email: 'tecnico@sepheda.com', password: '123456' },
            'admin': { email: 'admin@sepheda.com', password: '123456' }
        };
        
        // Para demo, permitimos estos usuarios específicos o cualquier correo @sepheda.com con contraseña mayor a 5 caracteres
        return (
            (email === usuariosValidos[tipo].email && password === usuariosValidos[tipo].password) ||
            (email.endsWith('@sepheda.com') && password.length >= 6)
        );
    }
});