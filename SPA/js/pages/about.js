import { AboutService } from '../services/AboutService.js';
import { StatsDisplay } from '../components/StatsDisplay.js';
import { CommitsList } from '../components/CommitsList.js';

class AboutPage {
    constructor() {
        console.log('Inicializando AboutPage');
        this.aboutService = new AboutService();
        this.initComponents();
    }

    initComponents() {
        console.log('Inicializando componentes');
        
        // Verificar que los contenedores existan
        if (!document.getElementById('stats-container') || !document.getElementById('commits-container')) {
            console.log('Contenedores no encontrados, reintentando en 100ms...');
            setTimeout(() => this.initComponents(), 100);
            return;
        }

        // Inicializar componentes
        this.statsDisplay = new StatsDisplay('stats-container');
        this.commitsList = new CommitsList('commits-container');

        // Cargar datos
        this.loadAllData();
    }

    async loadAllData() {
        try {
            console.log('Cargando datos...');
            this.commitsList?.showLoading();
            
            const [commits, contributors, pr, branches, recentCommits] = await Promise.all([
                this.aboutService.getCommitsCount(),
                this.aboutService.getContributorsCount(),
                this.aboutService.getPullRequestsCount(),
                this.aboutService.getBranchesCount(),
                this.aboutService.getRecentCommits(10)
            ]);

            console.log('Datos cargados exitosamente:', { commits, contributors, pr, branches });

            if (this.statsDisplay) {
                this.statsDisplay.updateStats({
                    commits,
                    contributors,
                    pr,
                    branches
                });
            }

            if (this.commitsList) {
                this.commitsList.render(recentCommits);
            }

        } catch (error) {
            console.error('Error al cargar datos:', error);
            this.handleError(error);
        }
    }

    handleError(error) {
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = error.message;
            errorElement.style.display = 'block';
        }
        console.error('Error en AboutPage:', error);
    }

    cleanup() {
        console.log('Limpiando AboutPage');
        
        ['stats-container', 'commits-container'].forEach(id => {
            const container = document.getElementById(id);
            if (container) container.innerHTML = '';
        });

        this.statsDisplay = null;
        this.commitsList = null;
        this.aboutService = null;
    }
}

// Instancia global
let aboutPageInstance = null;

// Inicialización global
window.initAboutPage = () => {
    console.log('Inicializando AboutPage');
    if (!aboutPageInstance) {
        aboutPageInstance = new AboutPage();
    } else {
        aboutPageInstance.loadAllData();
    }
};

// Limpieza global
window.cleanupAboutPage = () => {
    console.log('Limpiando AboutPage');
    if (aboutPageInstance) {       
        aboutPageInstance.cleanup();   
        aboutPageInstance = null;
    }
};

export default AboutPage;