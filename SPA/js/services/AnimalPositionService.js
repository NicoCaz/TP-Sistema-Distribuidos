export class AnimalPositionService {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api';
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
            return positions;
        } catch (error) {
            console.error('Error al obtener posiciones de animales:', error);
            throw new Error('No se pudieron cargar las posiciones de los animales');
        }
    }
}