const routes = {
    '/': '/pages/index.html',
    '/about': '/pages/about.html',
    '/animales': '/pages/animales.html',
    '/mapa': '/pages/mapa.html'
};

async function loadContent(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const content = await response.text();
        
        // Limpiar y establecer el nuevo contenido
        const mainPage = document.getElementById('main-page');
        mainPage.innerHTML = content;

        // Si estamos en la página del mapa, inicializar después de un breve retraso
        if (window.location.pathname === '/mapa') {
            console.log('Detectada página de mapa');
            setTimeout(() => {
                if (typeof window.initializeMap === 'function') {
                    console.log('Inicializando mapa');
                    window.initializeMap();
                } else {
                    console.error('Función initializeMap no encontrada');
                }
            }, 100);
        }
    } catch (error) {
        console.error('Error cargando contenido:', error);
        document.getElementById('main-page').innerHTML = '<h1>Error 404: Página no encontrada</h1>';
    }
}

function route(event) {
    if (event) {
        event.preventDefault();
        const path = event.target.getAttribute('href');
        window.history.pushState({}, '', path);
    }
    
    const path = window.location.pathname;
    const contentPath = routes[path] || routes['/'];
    loadContent(contentPath);
}

window.addEventListener('popstate', () => {
    route();
});

document.addEventListener('DOMContentLoaded', () => {
    route();
});

// Exponer la función route globalmente
window.route = route;