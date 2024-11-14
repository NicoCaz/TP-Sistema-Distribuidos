import { config } from '../config.js';	


export class MapService {
    constructor() {
        this.map = null;
        this.pointsLayer = null;
        this.animalsLayer = null;
        this.API_URL = config.API_URL;
    }

    async getCheckpoints() {
        try {
            const response = await fetch(`${this.API_URL}/checkpoints`);
            if (!response.ok) throw new Error('Error al obtener los puntos de control');
            const data = await response.json();
            return data.data.checkpoints;
        } catch (error) {
            console.error('Error fetching checkpoints:', error);
            throw error;
        }
    }

    async getAnimalPositions() {
        try {
            const response = await fetch(`${this.API_URL}/animals/position`);
            if (!response.ok) throw new Error('Error al obtener las posiciones de los animales');
            const data = await response.json();
            return data.animals;
        } catch (error) {
            console.error('Error fetching animal positions:', error);
            throw error;
        }
    }
}
