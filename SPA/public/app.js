// app.js

// Función para mostrar el dashboard
function showDashboard() {
    document.getElementById("main-page").innerHTML = `
        <h2>Dashboard</h2>
        <p>Bienvenido al sistema de monitoreo y control de ganado.</p>
    `;
}

// Función para mostrar la lista de animales
function showAnimales() {
    fetch("/animales.json") // Simulación de un fetch a un archivo JSON local
        .then(response => response.json())
        .then(animales => {
            let animalesHTML = `<h2>Animales</h2><ul>`;
            animales.forEach(animal => {
                animalesHTML += `<li>${animal.nombre} (Collar: ${animal.collarId})</li>`;
            });
            animalesHTML += '</ul>';
            document.getElementById("main-page").innerHTML = animalesHTML;
        })
        .catch(err => {
            console.error(err);
            document.getElementById("main-page").innerHTML = `<p>Error al cargar los animales.</p>`;
        });
}

// Función para mostrar la lista de puntos de control
function showPuntosControl() {
    const puntosControl = [
        { id: 1, nombre: 'Punto 1', ubicacion: 'Pastura' },
        { id: 2, nombre: 'Punto 2', ubicacion: 'Corral' }
    ];
    let puntosHTML = `<h2>Puntos de Control</h2><ul>`;
    puntosControl.forEach(punto => {
        puntosHTML += `<li>${punto.nombre} - ${punto.ubicacion}</li>`;
    });
    puntosHTML += '</ul>';
    document.getElementById("main-page").innerHTML = puntosHTML;
}

// Función para mostrar la página "Acerca de"
function showAbout() {
    document.getElementById("main-page").innerHTML = `
        <h2>Acerca de</h2>
        <p>Esta es una aplicación para el monitoreo de ganado.</p>
    `;
}

// Función para mostrar el error 404
function show404() {
    document.getElementById("main-page").innerHTML = `
        <h2>404 - Página no encontrada</h2>
        <p>La página solicitada no existe.</p>
    `;
}
