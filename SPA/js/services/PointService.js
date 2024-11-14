import { config } from '../config.js';	


export class PointService {
    constructor() {
        this.API_URL = config.API_URL;
    }

    async getPoints() {
        try {
            console.log('Intentando obtener puntos');
            const response = await fetch(`${this.API_URL}/checkpoints`);
            if (!response.ok) {
                throw new Error(`Error en la respuesta de la API: ${response.statusText}`);
            }
            console.log('Respuesta del servidor:', response.status);
            const data = await response.json();
            console.log('Data:', data);
            return data.data.checkpoints; // Extraer del nuevo formato
        } catch (error) {
            console.error('Error en getPoints:', error);
            throw error;
        }
    }

    async addPoint(point) {
        try {
            if (!point.description || !point.lat || !point.long) {
                throw new Error('Todos los campos son requeridos');
            }

            if (isNaN(point.lat) || point.lat < -90 || point.lat > 90) {
                throw new Error('Latitud debe estar entre -90 y 90');
            }
            if (isNaN(point.long) || point.long < -180 || point.long > 180) {
                throw new Error('Longitud debe estar entre -180 y 180');
            }

            const response = await fetch(`${this.API_URL}/checkpoints`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: point.id,
                    lat: parseFloat(point.lat),
                    long: parseFloat(point.long),
                    description: point.description
                })
            });

            if (!response.ok) {
                throw new Error('Error al crear el punto');
            }

            return await response.json();
        } catch (error) {
            console.error('Error adding point:', error);
            throw error;
        }
    }

    async updatePoint(id, point) {
        try {
            console.log(`Intentando actualizar punto con ID: ${id}`, point);
            // Cambiar de query parameter a parámetro de ruta
            const response = await fetch(`${this.API_URL}/checkpoints/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: point.id,
                    description: point.description,
                    lat: parseFloat(point.lat),
                    long: parseFloat(point.long)
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Error al actualizar el punto');
            }

            return await response.json();
        } catch (error) {
            console.error('Error en updatePoint:', error);
            throw error;
        }
    }

    async deletePoint(id) {
        try {
            console.log(`Intentando eliminar punto con ID: ${id}`);
            // Cambiar de query parameter a parámetro de ruta
            const response = await fetch(`${this.API_URL}/checkpoints/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Error al eliminar el punto');
            }

            return await response.json();
        } catch (error) {
            console.error('Error en deletePoint:', error);
            throw error;
        }
    }
}