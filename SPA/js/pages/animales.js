import { AnimalService } from '../services/AnimalService.js';
import { AnimalForm } from '../components/AnimalForm.js';
import { AnimalList } from '../components/AnimalList.js';

class AnimalsPage {
    constructor() {
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
        this.animalForm.setOnRefreshDevices(this.loadDevices.bind(this));
        await this.loadAnimals();
        await this.loadDevices();
    }

    async loadAnimals() {
        try {
            this.animalList.showLoading();
            const animals = await this.animalService.getAnimals();
            this.animalList.render(animals);
        } catch (error) {
            console.error('Error al cargar animales:', error);
            this.animalList.showError(error.message);
        }
    }

    async loadDevices() {
        try {
            const devices = await this.animalService.getAvailableDevices();
            this.animalForm.setDevices(devices);
        } catch (error) {
            console.error('Error al cargar dispositivos:', error);
            alert('Error al cargar dispositivos disponibles');
        }
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
}

// Inicializar la página
new AnimalsPage();