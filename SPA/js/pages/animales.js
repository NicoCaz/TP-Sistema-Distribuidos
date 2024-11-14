import { AnimalService } from '../services/AnimalService.js';
import { AnimalForm } from '../components/AnimalForm.js';
import { AnimalList } from '../components/AnimalList.js';

class AnimalsPage {
    constructor() {
        console.log('Inicializando AnimalsPage');
        this.animalService = new AnimalService();
        
        this.animalForm = new AnimalForm('cowForm', 
            this.handleSubmit.bind(this), 
            this.handleCancel.bind(this));
            
        this.animalList = new AnimalList('cowList', 
            this.handleEdit.bind(this), 
            this.handleDelete.bind(this));

        this.init();
    }

    async init() {
        console.log('Iniciando carga de datos de AnimalsPage');
        this.animalForm.setOnRefreshDevices(this.loadDevices.bind(this));
        await this.loadAnimals();
        //await this.loadDevices();
        this.startAutoRefresh();
    }

    async loadAnimals() {
        try {
            this.animalList.showLoading();
            const animals = await this.animalService.getAnimals();
            console.log('Animales cargados:', animals);
            this.animalList.render(animals);
        } catch (error) {
            console.error('Error al cargar animales:', error);
        }
    }

    async loadDevices() {
        try {
            const devices = await this.animalService.getAvailableDevices();
            console.log('Dispositivos cargados:', devices);
            this.animalForm.setDevices(devices);
        } catch (error) {
            console.error('Error al cargar dispositivos:', error);
           
        }
    }
    startAutoRefresh() {
        // Actualizar cada 5 segundos
        this.refreshInterval = setInterval(() => {
            this.loadDevices();
        }, 5000);
    }


    async handleSubmit(formData, editingId) {
        try {
            if (editingId) {
                await this.animalService.updateAnimal(editingId, formData);
            } else {
                await this.animalService.addAnimal(formData);
            }
            
            await this.loadAnimals();
            this.animalForm.reset();
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        }
    }

    handleEdit(animal) {
        this.animalForm.startEditing(animal);
    }

    async handleDelete(id) {
        try {
            await this.animalService.deleteAnimal(id);
            await this.loadAnimals();
        } catch (error) {
            console.error('Error al eliminar:', error);
            alert('Error al eliminar el animal');
        }
    }

    handleCancel() {
        this.animalForm.reset();
    }

    cleanup() {
        console.log('Limpiando instancia de AnimalsPage');
        this.animalForm = null;
        this.animalList = null;
        this.animalService = null;
    }
}

let animalsPageInstance = null;

window.initAnimalsPage = () => {
    console.log('Inicializando nueva instancia de AnimalsPage');
    if (!animalsPageInstance) {
        animalsPageInstance = new AnimalsPage();
    } else {
        console.log('Instancia de AnimalsPage ya existe, recargando datos');
        animalsPageInstance.init();
    }
};

window.cleanupAnimalsPage = () => {
    console.log('Ejecutando limpieza global de AnimalsPage');
    if (animalsPageInstance) {
        animalsPageInstance.cleanup();
        animalsPageInstance = null;
    }
};

// Inicializar si estamos en la página de animales
if (document.readyState === 'complete' && window.location.pathname === '/animales') {
    window.initAnimalsPage();
} else {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.location.pathname === '/animales') {
            window.initAnimalsPage();
        }
    });
}