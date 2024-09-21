function renderPage() {
    const page = location.hash.slice(1) || 'home'; // Si no hay hash, cargar 'home'
    const contentDiv = document.getElementById('content');
    
    // Llamar a la función de la página correspondiente
    switch (page) {
        case 'home':
            contentDiv.innerHTML = homePage();
            break;
        case 'about':
            contentDiv.innerHTML = aboutPage();
            break;
        case 'puntos':
            contentDiv.innerHTML = puntosDeControlPage();
            break;
        case 'animales':
            contentDiv.innerHTML = animalesPage();
            break;
        default:
            contentDiv.innerHTML = '<h1>Página no encontrada</h1>';
    }
}

// Escuchar cambios en el hash
window.addEventListener('hashchange', renderPage);

// Cargar la página inicial
renderPage();