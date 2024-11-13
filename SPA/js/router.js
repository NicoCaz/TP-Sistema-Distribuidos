export class Router {
    constructor() {
        this.routes = {
            '/': {
                template: '/pages/index.html',
                cleanup: () => {
                    this.cleanupAnimalsPage();
                    this.cleanupAboutPage();
                    this.cleanupPointsPage();
                    this.cleanupMapPage();
                    this.cleanupAnimalPositionsPage();
                }
            }, 
            '/login': {
                template: '/pages/login.html',
                script: '/js/pages/login.js',
                init: () => {
                    if (window.initLoginPage) {
                        window.initLoginPage();
                    }
                },
                cleanup: () => {
                    if (window.cleanupLoginPage) {
                        window.cleanupLoginPage();
                    }
                }
            },
            '/about': {
                template: '/pages/about.html',
                script: '/js/pages/about.js',
                init: () => {
                    if (window.initAboutPage) {
                        window.initAboutPage();
                    }
                },
                cleanup: () => {
                    this.cleanupAnimalsPage();
                    this.cleanupAboutPage();
                    this.cleanupPointsPage();
                    this.cleanupMapPage();
                    this.cleanupAnimalPositionsPage();
                }
            },
            '/animales': {
                template: '/pages/animales.html',
                script: '/js/pages/animales.js',
                init: () => {
                    if (window.initAnimalsPage) {
                        window.initAnimalsPage();
                    }
                },
                cleanup: () => {
                    this.cleanupAnimalsPage();
                    this.cleanupAboutPage();
                    this.cleanupPointsPage();
                    this.cleanupMapPage();
                    this.cleanupAnimalPositionsPage();
                }
            },
            '/mapa': {
                template: '/pages/mapa.html',
                script: '/js/pages/mapa.js',
                init: () => {
                    if (window.initMapPage) {
                        window.initMapPage();
                    }
                },
                cleanup: () => {
                    this.cleanupAnimalsPage();
                    this.cleanupAboutPage();
                    this.cleanupPointsPage();
                    this.cleanupMapPage();
                    this.cleanupAnimalPositionsPage();
                }
            },
            '/puntos': {
                template: '/pages/points.html',
                script: '/js/pages/points.js',
                init: () => {
                    if (window.initPointsPage) {
                        window.initPointsPage();
                    }
                },
                cleanup: () => {
                    this.cleanupAnimalsPage();
                    this.cleanupAboutPage();
                    this.cleanupPointsPage();
                    this.cleanupMapPage();
                    this.cleanupAnimalPositionsPage();
                }
            },'/analisis': {
                template: '/pages/animal-positions.html',
                script: '/js/pages/animal-positions.js',
                init: () => {
                    if (window.initAnimalPositionsPage) {
                        window.initAnimalPositionsPage();
                    }
                },
                cleanup: () => {
                    this.cleanupAnimalsPage();
                    this.cleanupAboutPage();
                    this.cleanupPointsPage();
                    this.cleanupMapPage();
                    this.cleanupAnimalPositionsPage();
                }
            },
        };

        this.currentScript = null;
        this.currentPath = null;
        this.init();
    }analisis

    cleanupAnimalsPage() {
        if (window.cleanupAnimalsPage) {
            window.cleanupAnimalsPage();
        }
    }

    cleanupAnimalPositionsPage() {
        if (window.cleanupAnimalPositionsPage) {
            window.cleanupAnimalPositionsPage();
        }
    }


    cleanupAboutPage() {
        if (window.cleanupAboutPage) {
            window.cleanupAboutPage();
        }
    }

    cleanupPointsPage() {
        if (window.cleanupPointsPage) {
            window.cleanupPointsPage();
        }
    }

    cleanupMapPage() {
        if (window.cleanupMapPage) {
            window.cleanupMapPage();
        }
    }

    cleanupCurrentPage() {
        // No llamar a la función cleanup de la ruta directamente
        if (this.currentPath) {
            this.cleanupAnimalsPage();
            this.cleanupAboutPage();
            this.cleanupPointsPage();
            this.cleanupMapPage();
            this.cleanupAnimalPositionsPage();
        }
    }

    init() {
        window.addEventListener('popstate', () => this.route());
        window.addEventListener('load', () => {
            const path = window.location.pathname || '/';
            this.route(path);
        });
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
        this.navigateTo(path);
    }

    navigateTo(path) {
        if (this.currentPath === path) return;
        
        this.cleanupCurrentPage();

        window.history.pushState({}, '', path);
        this.currentPath = path;
        this.route(path);
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
        if (!scriptPath) return true;

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
            };

            document.body.appendChild(script);
        });
    }

    async route(path = window.location.pathname) {
        console.log('Routing to:', path);
        
        this.cleanupCurrentPage();

        const route = this.routes[path] || this.routes['/'];
        this.currentPath = path;

        try {
            if (path !== '/login') {
                const isAuthenticated = await import('./auth.js').then(module => module.checkAuth());
                if (!isAuthenticated) return;
            }
            const content = await this.loadContent(route.template);
            const mainPage = document.getElementById('main-page');
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
        }
    }

    updateActiveNav(currentPath) {
        document.querySelectorAll('nav a').forEach(link => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === currentPath);
        });
    }
}