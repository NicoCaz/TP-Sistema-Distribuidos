import { config } from '../config.js';	

export class AnimalService {
    constructor() {
        this.baseUrl = config.API_URL;
        this.mockDevices = [
            'TEST_001',
            'TEST_002',
            'TEST_003',
            'TEST_004',
            'TEST_005'
        ];
    }
    timeoutPromise(promise, timeout = 2000) {
        return Promise.race([
            promise,
            new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error('Timeout - No se recibió respuesta a tiempo'));
                }, timeout);
            })
        ]);
    }




    async getAnimals() {
        try {
            const response = await fetch(`${this.baseUrl}/animals`);
            if (!response.ok) {
                throw new Error(`Error en la respuesta de la API: ${response.statusText}`);
            }
            const data = await response.json();
            
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
            console.log('Intentando obtener dispositivos del servidor...');
            
            // Crear la promesa de fetch con timeout
            const fetchPromise = fetch(`${this.baseUrl}/availableDevices`);
            const response = await this.timeoutPromise(fetchPromise);
            
            console.log('Respuesta del servidor:', response.status);
            if (!response.ok) {
                console.log('Servidor no disponible, usando dispositivos de prueba');
                return this.mockDevices;
            }

            const data = await response.json();
            console.log('Datos recibidos del servidor:', data);

            console.log('Dispositivos encontrados:', data.length);
            if (data.length === 0) {
                console.log('No se encontraron dispositivos en el servidor, usando dispositivos de prueba');
                return this.mockDevices;
            }

            return data;

        } catch (error) {
            if (error.message.includes('Timeout')) {
                console.warn('Timeout al esperar respuesta del servidor, usando dispositivos de prueba');
            } else {
                console.warn('Error al conectar con el servidor:', error);
            }
            return this.mockDevices;
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
            const fetchPromise = fetch(`${this.baseUrl}/animals/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: animal.name,
                    description: animal.description,
                    id: animal.id  // Agregamos el ID del dispositivo para permitir su actualización
                })
            });
    
            const response = await this.timeoutPromise(fetchPromise);
    
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