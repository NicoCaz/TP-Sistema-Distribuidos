import { AnimalPositionService } from '../services/AnimalPositionService.js';
import { AnimalPositionList } from '../components/AnimalPositionList.js';

class AnimalPositionsPage {
    constructor() {
        console.log('Inicializando AnimalPositionsPage');
        this.animalPositionService = new AnimalPositionService();
        this.animalPositionList = new AnimalPositionList('animalPositionsList');
        this.init();
    }

    async init() {
        console.log('Iniciando carga de datos de AnimalPositionsPage');
        await this.loadPositions();
        // Configurar actualización automática cada 30 segundos
        this.startAutoRefresh();
    }

    async loadPositions() {
        try {
            this.animalPositionList.showLoading();
            const positions = await this.animalPositionService.getAnimalPositions();
            console.log('Posiciones cargadas:', positions);
            this.animalPositionList.render(positions);
        } catch (error) {
            console.error('Error al cargar posiciones:', error);
            this.animalPositionList.showError('Error al cargar las posiciones de los animales');
        }
    }

    startAutoRefresh() {
        // Actualizar cada 5 segundos
        this.refreshInterval = setInterval(() => {
            this.loadPositions();
        }, 5000);
    }

    cleanup() {
        console.log('Limpiando instancia de AnimalPositionsPage');
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        this.animalPositionList = null;
        this.animalPositionService = null;
    }
}

let animalPositionsPageInstance = null;

window.initAnimalPositionsPage = () => {
    console.log('Inicializando nueva instancia de AnimalPositionsPage');
    if (!animalPositionsPageInstance) {
        animalPositionsPageInstance = new AnimalPositionsPage();
    } else {
        console.log('Instancia de AnimalPositionsPage ya existe, recargando datos');
        animalPositionsPageInstance.loadPositions();
    }
};

window.cleanupAnimalPositionsPage = () => {
    console.log('Ejecutando limpieza global de AnimalPositionsPage');
    if (animalPositionsPageInstance) {
        animalPositionsPageInstance.cleanup();
        animalPositionsPageInstance = null;
    }
};

if (document.readyState === 'complete' && window.location.pathname === '/animal-positions') {
    window.initAnimalPositionsPage();
} else {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.location.pathname === '/animal-positions') {
            window.initAnimalPositionsPage();
        }
    });
}