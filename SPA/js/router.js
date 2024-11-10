// router.js
export class Router {
    constructor() {
        this.routes = {
            '/': {
                template: '/pages/index.html',
            },
            '/about': {
                template: '/pages/about.html',
            },
            '/animales': {
                template: '/pages/animales.html',
                script: '/js/pages/animales.js'
            },
            '/mapa': {
                template: '/pages/mapa.html',
                script: '/js/pages/mapa.js'
            }
        };

        this.currentScript = null;
        this.init();
    }

    init() {
        window.addEventListener('popstate', () => this.route());
        document.addEventListener('DOMContentLoaded', () => this.route());
        this.setupNavigation();
    }

    setupNavigation() {
        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', (e) => this.handleClick(e));
        });
    }

    handleClick(event) {
        event.preventDefault();
        const path = event.target.getAttribute('href');
        window.history.pushState({}, '', path);
        this.route();
    }

    async loadContent(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.text();
        } catch (error) {
            console.error('Error cargando contenido:', error);
            return '<h1>Error 404: Página no encontrada</h1>';
        }
    }

    async loadScript(scriptPath) {
        // Remover script anterior si existe
        if (this.currentScript) {
            document.body.removeChild(this.currentScript);
            this.currentScript = null;
        }

        if (scriptPath) {
            // Crear y cargar nuevo script
            const script = document.createElement('script');
            script.src = scriptPath;
            script.type = 'module';
            
            // Promesa para manejar la carga del script
            const loadPromise = new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
            });

            this.currentScript = script;
            document.body.appendChild(script);

            try {
                await loadPromise;
                return true;
            } catch (error) {
                console.error('Error cargando script:', error);
                return false;
            }
        }
    }

    async route() {
        const path = window.location.pathname;
        const route = this.routes[path] || this.routes['/'];

        // Cargar el contenido HTML
        const content = await this.loadContent(route.template);
        const mainPage = document.getElementById('main-page');
        mainPage.innerHTML = content;

        // Cargar el script asociado
        await this.loadScript(route.script);

        // Actualizar navegación activa
        this.updateActiveNav(path);
    }

    updateActiveNav(currentPath) {
        document.querySelectorAll('nav a').forEach(link => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === currentPath);
        });
    }
}