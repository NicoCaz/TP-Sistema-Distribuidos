const routes = {
    404: "/SPA/pages/404.html",
    "/": "/SPA/pages/index.html",
    "/about": "/SPA/pages/about.html",
    "/animales": "/SPA/pages/animales.html",
    "/mapa": "/SPA/pages/mapa.html",
};

const handleLocation = async () => {
    const path = window.location.pathname;
    const route = routes[path] || routes[404];
    try {
        const response = await fetch(route);
        if (!response.ok) throw new Error('Network response was not ok');
        const html = await response.text();
        document.getElementById("main-page").innerHTML = html;
    } catch (error) {
        console.error('Fetch error:', error);
        document.getElementById("main-page").innerHTML = "<h1>Error loading page</h1>";
    }
};

const route = (event) => {
    event = event || window.event;
    event.preventDefault();
    window.history.pushState({}, "", event.target.href);
    handleLocation();
};

window.onpopstate = handleLocation;
window.route = route;

document.addEventListener("DOMContentLoaded", handleLocation);
