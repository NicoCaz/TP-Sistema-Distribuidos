const JsonDatabase = require('../database/JsonDatabase');
const responseHandler = require('../utils/responseHandler');

class AnimalController {
    constructor() {
        this.db = JsonDatabase.getInstance('animals.json');
        this.checkpointDataDb  = JsonDatabase.getInstance('checkpoints_data.json');
        this.checkpointsDb  = JsonDatabase.getInstance('checkpoints.json');
    }

    async create(req, res) {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                console.log('Datos recibidos:', body);
                const newAnimal = JSON.parse(body);

                if (!newAnimal.name || !newAnimal.id || !newAnimal.description) {
                    console.log('Datos inválidos:', newAnimal);
                    return responseHandler.sendError(res, 'Todos los campos son requeridos', 400);
                }

                const animals = await this.db.readData();
                console.log('Animales actuales:', animals);

                animals.push({
                    name: newAnimal.name,
                    id: newAnimal.id,
                    description: newAnimal.description
                });

                await this.db.writeData(animals);
                console.log('Animal agregado exitosamente');

                responseHandler.sendJson(res, {
                    success: true,
                    message: 'Animal creado exitosamente',
                    data: newAnimal
                }, 201);

            } catch (error) {
                console.error('Error en create:', error);
                responseHandler.sendError(res, 'Error al crear el animal: ' + error.message);
            }
        });
    }

    async getAll(req, res) {
        try {
            const animals = await this.db.readData();
            responseHandler.sendJson(res, animals);
        } catch (error) {
            responseHandler.sendError(res, 'Error al obtener los animales');
        }
    }

    async update(req, res, id) {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', async () => {
            try {
                const updateData = JSON.parse(body);
                const animals = await this.db.readData();
                const index = animals.findIndex(a => a.id === id);

                if (index === -1) {
                    return responseHandler.sendError(res, 'Animal no encontrado', 404);
                }

                animals[index] = {
                    ...animals[index],
                    ...updateData
                };

                await this.db.writeData(animals);
                responseHandler.sendJson(res, animals[index]);
            } catch (error) {
                responseHandler.sendError(res, 'Error al actualizar el animal');
            }
        });
    }

    
    async delete(req, res, id) {
        try {
            const animals = await this.db.readData();
            const filteredAnimals = animals.filter(a => a.id !== id);
            
            if (filteredAnimals.length === animals.length) {
                return responseHandler.sendError(res, 'Animal no encontrado', 404);
            }

            await this.db.writeData(filteredAnimals);
            responseHandler.sendJson(res, { message: 'Animal eliminado exitosamente' });
        } catch (error) {
            responseHandler.sendError(res, 'Error al eliminar el animal');
        }
    }

 
    async getAnimalsPositions(req, res) {
        try {
            console.log('📍 Solicitando posiciones de animales');
            
            // Leer datos de los archivos
            const checkpoints = await this.checkpointsDb.readData();
            const registeredAnimals = await this.db.readData();
            const checkpointData = await this.checkpointDataDb.readData();
    
            console.log('🔍 Checkpoints totales:', checkpoints.length);
            console.log('🔍 Animales registrados:', registeredAnimals.length);
            
            const positions = checkpoints.map(checkpoint => {
                // Obtener los datos del checkpoint actual
                const checkpointInfo = checkpointData.find(
                    data => data.checkpointID === checkpoint.id
                );
                
                // Obtener la lista de animales del checkpoint
                const checkpointAnimals = checkpointInfo?.animals || [];
    
                // Filtrar y mapear los animales
                const filteredAnimals = checkpointAnimals
                    .filter(checkpointAnimal => 
                        registeredAnimals.some(
                            registeredAnimal => registeredAnimal.id === checkpointAnimal.id
                        )
                    )
                    .map(checkpointAnimal => {
                        const animalInfo = registeredAnimals.find(
                            animal => animal.id === checkpointAnimal.id
                        );
                        return {
                            ...animalInfo,
                            rssi: checkpointAnimal.rssi
                        };
                    });
    
                console.log(`📍 Checkpoint ${checkpoint.id} - Animales registrados: ${filteredAnimals.length}`);
    
                return {
                    id: checkpoint.id,
                    lat: checkpoint.lat,
                    long: checkpoint.long,
                    description: checkpoint.description,
                    animals: filteredAnimals
                };
            });
    
            console.log('📤 Enviando posiciones con info completa:', 
                JSON.stringify(positions, null, 2));
            
            responseHandler.sendJson(res, positions);
        } catch (error) {
            console.error('❌ Error al obtener posiciones:', error);
            responseHandler.sendError(res, 'Error al obtener las posiciones de los animales');
        }
    }
}

module.exports = AnimalController;