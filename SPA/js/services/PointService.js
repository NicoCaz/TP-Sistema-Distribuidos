export class PointService {
    constructor() {
        this.API_URL = 'http://localhost:3000';
    }

    async getPoints() {
        try {
            const response = await fetch(`${this.API_URL}/api/checkpoints`);
            if (!response.ok) {
                throw new Error('Error al obtener los puntos');
            }
            const data = await response.json();
            return data.checkpoints || [];
        } catch (error) {
            console.error('Error fetching points:', error);
            throw new Error('No se pudieron cargar los puntos');
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
                    description: point.description,
                    lat: point.lat,
                    long: point.long
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

    async updatePoint(id, pointData) {
        try {
            if (!pointData.description || !pointData.lat || !pointData.long) {
                throw new Error('Todos los campos son requeridos');
            }

            if (isNaN(pointData.lat) || pointData.lat < -90 || pointData.lat > 90) {
                throw new Error('Latitud debe estar entre -90 y 90');
            }
            if (isNaN(pointData.long) || pointData.long < -180 || pointData.long > 180) {
                throw new Error('Longitud debe estar entre -180 y 180');
            }

            const response = await fetch(`${this.API_URL}/api/checkpoints?id=${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    description: pointData.description,
                    lat: pointData.lat,
                    long: pointData.long
                })
            });

            if (!response.ok) {
                throw new Error('Error al actualizar el punto');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating point:', error);
            throw error;
        }
    }

    async deletePoint(id) {
        try {
            const response = await fetch(`${this.API_URL}/api/checkpoints?id=${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Error al eliminar el punto');
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting point:', error);
            throw error;
        }
    }
}