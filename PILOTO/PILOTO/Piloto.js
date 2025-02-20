function obtenerHoraActual() {
    const ahora = new Date();
    return ahora.toLocaleString();
}

function actualizarSensores() {
    const voltaje = (Math.random() * 100).toFixed(2);
    const amperaje = (Math.random() * 50).toFixed(2);
    const rpm = (Math.random() * 5000).toFixed(0);
    const anemometro = (Math.random() * 25).toFixed(2);
    const hora = obtenerHoraActual();

    document.getElementById("voltaje").textContent = voltaje + " V";
    document.getElementById("amperaje").textContent = amperaje + " A";
    document.getElementById("rpm").textContent = rpm + " RPM";
    document.getElementById("anemometro").textContent = anemometro + " m/s";

    agregarAlHistorial(voltaje, amperaje, rpm, anemometro, hora);
}

function agregarAlHistorial(voltaje, amperaje, rpm, anemometro, hora) {
    const tabla = document.getElementById("historial");
    const fila = document.createElement("tr");

    fila.innerHTML = `
        <td>${voltaje} V</td>
        <td>${amperaje} A</td>
        <td>${rpm} RPM</td>
        <td>${anemometro} m/s</td>
        <td>${hora}</td>
    `;

    tabla.prepend(fila);

    // Limitar a las últimas 10 lecturas
    if (tabla.rows.length > 10) {
        tabla.deleteRow(10);
    }
}

// Controla la velocidad de la turbina con el slider
function actualizarVelocidad(valor) {
    document.getElementById("velocidadValor").textContent = valor;
}

// Simula la actualización cada 2 segundos
setInterval(actualizarSensores, 2000);

