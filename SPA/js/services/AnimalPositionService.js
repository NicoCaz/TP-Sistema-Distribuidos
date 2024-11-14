import { config } from '../config.js';	

export class AnimalPositionService {
    constructor() {
        this.baseUrl = config.API_URL;
    }

    async getAnimalPositions() {
        try {
            console.log('Obteniendo posiciones de animales...');
            console.log('URL:', this.baseUrl);
            const response = await fetch(`${this.baseUrl}/animals/position`);
            console.log('Response:', response);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const positions = await response.json();
            console.log('Positions:', positions);
            return positions;
        } catch (error) {
            console.error('Error al obtener posiciones de animales:', error);
            throw new Error('No se pudieron cargar las posiciones de los animales');
        }
    }
}