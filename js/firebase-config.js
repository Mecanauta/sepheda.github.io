// Configuración y funciones de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCWG2iyzd9gVRHX4dkNpBpWFQ2saY8Jmxo",
    authDomain: "sephedamantenimiento.firebaseapp.com",
    projectId: "sephedamantenimiento",
    storageBucket: "sephedamantenimiento.firebasestorage.app",
    messagingSenderId: "97188760908",
    appId: "1:97188760908:web:5228fb533ad898e5b793e9",
    measurementId: "G-C2RZPX8T2E"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referencias de los servicios que usaremos
const auth = firebase.auth();
const db = firebase.firestore();

// Función para verificar el rol de un usuario actual
async function verificarRolUsuario() {
  const usuario = auth.currentUser;
  
  if (!usuario) {
    return null; // No hay usuario autenticado
  }
  
  try {
    const doc = await db.collection('usuarios').doc(usuario.uid).get();
    
    if (doc.exists) {
      return doc.data().rol; // Retorna el rol del usuario (cliente, tecnico, admin)
    } else {
      console.error("No se encontró documento de usuario para el UID:", usuario.uid);
      return null;
    }
  } catch (error) {
    console.error("Error al verificar rol de usuario:", error);
    return null;
  }
}

// Función para verificar si el usuario tiene acceso a una página determinada
async function verificarAcceso(rolRequerido) {
  const rolUsuario = await verificarRolUsuario();
  
  if (!rolUsuario) {
    return false; // Usuario no autenticado o sin rol asignado
  }
  
  // Si el rol requerido coincide con el rol del usuario, dar acceso
  return rolUsuario === rolRequerido;
}

// Función para proteger páginas
async function protegerPagina(rolRequerido) {
  try {
    const tieneAcceso = await verificarAcceso(rolRequerido);
    
    if (!tieneAcceso) {
      // Si no tiene acceso, redirigir al login
      alert("No tienes permisos para acceder a esta página");
      window.location.href = "loggin.html";
      return false;
    }
    
    return true; // Tiene acceso
  } catch (error) {
    console.error("Error al proteger página:", error);
    window.location.href = "loggin.html";
    return false;
  }
}

// Exportamos las funciones y objetos para usarlos en otros archivos
window.firebaseAuth = auth;
window.firebaseDB = db;
window.verificarRolUsuario = verificarRolUsuario;
window.verificarAcceso = verificarAcceso;
window.protegerPagina = protegerPagina;