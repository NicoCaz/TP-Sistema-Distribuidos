export class AnimalPositionService {
    constructor() {
        this.baseUrl = '/api/animals/position';
    }

    async getAnimalPositions() {
        try {
            const response = await fetch(this.baseUrl);
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