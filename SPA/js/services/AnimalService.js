export class AnimalService {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api';
    }

    async getAnimals() {
        try {
            const response = await fetch(`${this.baseUrl}/animals`);
            if (!response.ok) {
                throw new Error(`Error en la respuesta de la API: ${response.statusText}`);
            }
            const data = await response.json();
            
            // Verificar la estructura de la respuesta y manejar diferentes casos
            if (data.data && data.data.animals) {
                return data.data.animals;
            } else if (Array.isArray(data)) {
                return data;
            } else if (data.animals) {
                return data.animals;
            } else {
                console.warn('Estructura de respuesta inesperada:', data);
                return [];
            }
        } catch (error) {
            console.error('Error en getAnimals:', error);
            throw new Error('Error al obtener la lista de animales');
        }
    }

    async getAvailableDevices() {
        try {
            const response = await fetch(`${this.baseUrl}/availableDevices`);
            if (!response.ok) {
                throw new Error('Error al obtener dispositivos');
            }
            const data = await response.json();
            return Array.isArray(data.devices) ? data.devices : [];
        } catch (error) {
            console.error('Error en getAvailableDevices:', error);
            throw new Error('Error al obtener los dispositivos disponibles');
        }
    }

    async addAnimal(animal) {
        try {
            const response = await fetch(`${this.baseUrl}/animals`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(animal)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al crear animal');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error en addAnimal:', error);
            throw new Error('Error al crear el animal');
        }
    }

    async updateAnimal(id, animal) {
        try {
            const response = await fetch(`${this.baseUrl}/animals/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: animal.name,
                    description: animal.description
                })
            });

            if (!response.ok) {
                throw new Error('Error al actualizar el animal');
            }

            return await response.json();
        } catch (error) {
            console.error('Error en updateAnimal:', error);
            throw new Error('Error al actualizar el animal');
        }
    }

    async deleteAnimal(id) {
        try {
            const response = await fetch(`${this.baseUrl}/animals/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Error al eliminar el animal');
            }
        } catch (error) {
            console.error('Error en deleteAnimal:', error);
            throw new Error('Error al eliminar el animal');
        }
    }
}