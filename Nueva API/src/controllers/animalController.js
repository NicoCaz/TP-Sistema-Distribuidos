const JsonDatabase = require('../database/JsonDatabase');
const responseHandler = require('../utils/responseHandler');

class AnimalController {
    constructor() {
        this.db = JsonDatabase.getInstance('animals.json');
        this.checkpointsDb = JsonDatabase.getInstance('checkpoints_data.json');
        this.checkpointsInfoDb = JsonDatabase.getInstance('checkpoints.json');
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

            // Obtener datos de checkpoints
            const checkpointsData = await this.checkpointsDb.readData();
            const checkpointsInfo = await this.checkpointsInfoDb.readData();

            // Obtener datos de animales
            const animals = await this.db.readData();

            // Mapear los datos al formato requerido
            const positions = checkpointsInfo.map(checkpoint => {
                // Buscar los animales asociados a este checkpoint
                const checkpointData = checkpointsData.find(
                    cd => cd.checkpointID === checkpoint.id
                );

                return {
                    id: checkpoint.id,
                    lat: checkpoint.lat,
                    long: checkpoint.long,
                    description: checkpoint.description,
                    animals: checkpointData?.animals || []
                };
            });

            console.log('📤 Enviando posiciones:', JSON.stringify(positions, null, 2));
            
            // Enviar la respuesta en el formato exacto requerido
            responseHandler.sendJson(res, positions);

        } catch (error) {
            console.error('❌ Error al obtener posiciones:', error);
            responseHandler.sendError(res, 'Error al obtener las posiciones de los animales');
        }
    }

}

module.exports = AnimalController;