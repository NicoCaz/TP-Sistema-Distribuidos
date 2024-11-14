export class Router {
    constructor() {
        this.routes = {
            '/': {
                template: '/pages/index.html',
                cleanup: () => this.cleanupAllPages()
            }, 
            '/about': {
                template: '/pages/about.html',
                script: '/js/pages/about.js',
                init: () => {
                    if (window.initAboutPage) {
                        window.initAboutPage();
                    }
                },
                cleanup: () => this.cleanupAllPages()
            },
            '/animales': {
                template: '/pages/animales.html',
                script: '/js/pages/animales.js',
                init: () => {
                    if (window.initAnimalsPage) {
                        window.initAnimalsPage();
                    }
                },
                cleanup: () => this.cleanupAllPages()
            },
            '/mapa': {
                template: '/pages/mapa.html',
                script: '/js/pages/mapa.js',
                init: () => {
                    if (window.initMapPage) {
                        window.initMapPage();
                    }
                },
                cleanup: () => this.cleanupAllPages()
            },
            '/puntos': {
                template: '/pages/points.html',
                script: '/js/pages/points.js',
                init: () => {
                    if (window.initPointsPage) {
                        window.initPointsPage();
                    }
                },
                cleanup: () => this.cleanupAllPages()
            },
            '/analisis': {
                template: '/pages/animal-positions.html',
                script: '/js/pages/animal-positions.js',
                init: () => {
                    if (window.initAnimalPositionsPage) {
                        window.initAnimalPositionsPage();
                    }
                },
                cleanup: () => this.cleanupAllPages()
            },
            '/404': {
                template: '/pages/404.html'
            }
        };

        this.currentScript = null;
        this.currentPath = null;
        this.init();
    }

    cleanupAllPages() {
        const cleanupFunctions = [
            'cleanupAnimalsPage',
            'cleanupAboutPage',
            'cleanupPointsPage',
            'cleanupMapPage',
            'cleanupAnimalPositionsPage'
        ];

        cleanupFunctions.forEach(cleanup => {
            if (window[cleanup]) {
                window[cleanup]();
            }
        });
    }

    init() {
        // Manejar la navegación hacia atrás/adelante
        window.addEventListener('popstate', (event) => {
            // Prevenir comportamiento por defecto si es necesario
            event.preventDefault();
            const path = window.location.pathname;
            this.route(path, false); // false indica que no debe agregar una nueva entrada al historial
        });

        // Manejar la carga inicial y recargas
        window.addEventListener('load', () => {
            const path = window.location.pathname;
            this.route(path, false);
        });

        this.setupNavigation();
    }

    setupNavigation() {
        document.addEventListener('click', (e) => {
            // Usar delegación de eventos para manejar los clicks en los enlaces
            const link = e.target.closest('nav a');
            if (link) {
                e.preventDefault();
                const path = link.getAttribute('href');
                this.navigateTo(path);
            }
        });
    }

    navigateTo(path) {
        if (this.currentPath === path) return;
        this.route(path, true);
    }

    async loadContent(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.text();
        } catch (error) {
            console.error('Error cargando contenido:', error);
            // Redirigir a 404 si hay un error
            return this.redirectTo404();
        }
    }

    async loadScript(scriptPath) {
        if (!scriptPath) return true;

        // Limpiar script anterior si existe
        if (this.currentScript) {
            document.body.removeChild(this.currentScript);
            this.currentScript = null;
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.type = 'module';
            script.src = scriptPath;
            
            script.onload = () => {
                this.currentScript = script;
                resolve(true);
            };
            
            script.onerror = () => {
                reject(new Error(`Error loading script: ${scriptPath}`));
                this.redirectTo404();
            };

            document.body.appendChild(script);
        });
    }

    redirectTo404() {
        window.history.pushState({}, '', '/404');
        return this.route('/404', false);
    }

    async route(path, addToHistory = true) {
        console.log('Routing to:', path);
        
        // Limpiar página actual antes de cargar la nueva
        if (this.currentPath) {
            this.cleanupAllPages();
        }

        // Verificar si la ruta existe
        const route = this.routes[path];
        console.log('Route:', route);
        if (!route) {
            return this.redirectTo404();
        }

        try {
            // Actualizar el historial si es necesario
            if (addToHistory) {
                window.history.pushState({path}, '', path);
            }

            this.currentPath = path;
            
            const content = await this.loadContent(route.template);
            const mainPage = document.getElementById('main-page');
            if (!mainPage) {
                throw new Error('Element with id "main-page" not found');
            }

            mainPage.innerHTML = content;

            if (route.script) {
                await this.loadScript(route.script);
                if (route.init) {
                    route.init();
                }
            }

            this.updateActiveNav(path);
        } catch (error) {
            console.error('Error en el enrutamiento:', error);
            return this.redirectTo404();
        }
    }

    updateActiveNav(currentPath) {
        document.querySelectorAll('nav a').forEach(link => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === currentPath);
        });
    }
}