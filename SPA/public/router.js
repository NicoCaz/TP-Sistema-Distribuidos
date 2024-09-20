// router.js

const routes = {
    404: show404,
    "/": showDashboard,
    "/about": showAbout,
    "/animales": showAnimales,
    "/puntos-control": showPuntosControl,
};

const route = (event) => {
    event = event || window.event;
    event.preventDefault();
    const href = event.target.href;
    window.history.pushState({}, "", href);
    handleLocation();
};

const handleLocation = () => {
    const path = window.location.pathname;
    const routeAction = routes[path] || routes[404];
    routeAction(); // Llama la función asociada a la ruta
};

// Maneja los cambios en el historial (botones back/forward del navegador)
window.onpopstate = handleLocation;

// Expone la función `route` globalmente para ser usada en los enlaces
window.route = route;

// Llama a la función cuando la página se carga por primera vez
handleLocation();
