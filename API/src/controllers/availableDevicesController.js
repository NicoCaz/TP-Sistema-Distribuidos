const JsonDatabase = require('../database/JsonDatabase');
const responseHandler = require('../utils/responseHandler');

class AvailableDevicesController {
    constructor() {
        this.animalsDb = JsonDatabase.getInstance('animals.json');
        this.checkpointsDb = JsonDatabase.getInstance('checkpoints.json');
        this.checkpointsDataDb = JsonDatabase.getInstance('checkpoints_data.json');
    }

    async getAll(req, res) {
        try {
            console.log('\n🔄 Obteniendo datos de todos los archivos...');

            // Obtener datos de los tres archivos
            const animals = await this.animalsDb.readData();
            const checkpoints = await this.checkpointsDb.readData();
            const checkpointsData = await this.checkpointsDataDb.readData();

            // Obtener IDs de animals.json y checkpoints.json
            const registeredAnimalIds = new Set(animals.map(animal => animal.id));
            const checkpointAnimalIds = new Set(checkpoints.map(checkpoint => checkpoint.animalId));

            // Obtener todos los IDs únicos de animales en checkpoints_data.json
            const deviceIds = new Set();
            checkpointsData.forEach(checkpoint => {
                checkpoint.animals.forEach(animal => {
                    deviceIds.add(animal.id);
                });
            });

            // Filtrar para obtener solo los IDs que están en checkpoints_data.json 
            // pero no en animals.json ni checkpoints.json
            const availableDevices = Array.from(deviceIds).filter(id => 
                !registeredAnimalIds.has(id) && !checkpointAnimalIds.has(id)
            );

            console.log('📱 Dispositivos disponibles encontrados:', availableDevices.length);

            if (availableDevices.length > 0) {
                responseHandler.sendJson(res, {
                    devices: availableDevices
                });
            } else {
                responseHandler.sendError(res, 'No se encontraron dispositivos sin registrar', 404);
            }

        } catch (error) {
            console.error('Error al obtener dispositivos disponibles:', error);
            responseHandler.sendError(res, 'Error al obtener los dispositivos disponibles');
        }
    }
}

module.exports = AvailableDevicesController;