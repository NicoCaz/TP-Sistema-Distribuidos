const JsonDatabase = require('../database/JsonDatabase');
const responseHandler = require('../utils/responseHandler');

class MQTTController {
    constructor() {
        this.db = JsonDatabase.getInstance('checkpoints_data.json');
        this.packageTracker = new Map();
    }

    async processCheckpointUpdate(req, res) {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                console.log('📥 Datos recibidos:', body);
                const checkpointData = JSON.parse(body);

                if (!this.validateInputData(checkpointData)) {
                    return responseHandler.sendError(res, 'Formato de datos inválido', 400);
                }

                const result = await this.updateCheckpoint(checkpointData);
                
                if (result.success) {
                    responseHandler.sendJson(res, {
                        success: true,
                        message: result.message,
                        complete: result.complete
                    }, 200);
                } else {
                    responseHandler.sendError(res, result.message, 400);
                }

            } catch (error) {
                console.error('❌ Error en processCheckpointUpdate:', error);
                responseHandler.sendError(res, 'Error al procesar la actualización: ' + error.message);
            }
        });
    }

    async getAllCheckpoints(req, res) {
        try {
            const checkpoints = await this.db.readData();
            responseHandler.sendJson(res, checkpoints);
        } catch (error) {
            responseHandler.sendError(res, 'Error al obtener los checkpoints');
        }
    }

    async getCheckpointById(req, res, checkpointId) {
        try {
            const checkpoints = await this.db.readData();
            const checkpoint = checkpoints.find(cp => cp.checkpointID === checkpointId);
            
            if (!checkpoint) {
                return responseHandler.sendError(res, 'Checkpoint no encontrado', 404);
            }

            responseHandler.sendJson(res, checkpoint);
        } catch (error) {
            responseHandler.sendError(res, 'Error al obtener el checkpoint');
        }
    }

    async updateCheckpoint(checkpointData) {
        try {
            const { checkpointID, packageNum, totalPackages, animals } = checkpointData;

            // Inicializar o actualizar tracker
            if (!this.packageTracker.has(checkpointID)) {
                this.packageTracker.set(checkpointID, {
                    receivedPackages: new Set(),
                    totalPackages: totalPackages,
                    animals: []
                });
            }

            const tracker = this.packageTracker.get(checkpointID);
            tracker.receivedPackages.add(packageNum);

            // Cargar datos actuales
            let checkpoints = await this.db.readData();
            let checkpointIndex = checkpoints.findIndex(cp => cp.checkpointID === checkpointID);

            // Actualizar o crear nuevo checkpoint
            if (checkpointIndex !== -1) {
                checkpoints[checkpointIndex].animals = this.mergeAnimals(
                    checkpoints[checkpointIndex].animals,
                    animals
                );
            } else {
                checkpoints.push({
                    checkpointID,
                    animals
                });
            }

            // Verificar si la transmisión está completa
            const isComplete = tracker.receivedPackages.size === tracker.totalPackages;

            if (isComplete) {
                await this.db.writeData(checkpoints);
                this.packageTracker.delete(checkpointID);
            }

            return {
                success: true,
                message: `Paquete ${packageNum}/${totalPackages} procesado para checkpoint ${checkpointID}`,
                complete: isComplete
            };

        } catch (error) {
            console.error('❌ Error en updateCheckpoint:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    mergeAnimals(existingAnimals, newAnimals) {
        const animalMap = new Map();
        
        if (Array.isArray(existingAnimals)) {
            existingAnimals.forEach(animal => {
                if (animal && animal.id) {
                    animalMap.set(animal.id, animal);
                }
            });
        }
        
        newAnimals.forEach(animal => {
            if (animal && animal.id) {
                animalMap.set(animal.id, { ...animal });
            }
        });
        
        return Array.from(animalMap.values());
    }
    
    async removeCheckpoint(checkpointId) {
        try {
            const checkpoints = await this.db.readData();
            const filteredCheckpoints = checkpoints.filter(
                cp => cp.checkpointID !== checkpointId
            );
            
            // Si no se encontró el checkpoint, no es necesario actualizar
            if (filteredCheckpoints.length === checkpoints.length) {
                console.log(`ℹ️ No se encontró el checkpoint ${checkpointId} para eliminar`);
                return;
            }
            
            // Eliminar cualquier tracking pendiente
            if (this.packageTracker.has(checkpointId)) {
                this.packageTracker.delete(checkpointId);
            }
            
            // Guardar los datos actualizados
            await this.db.writeData(filteredCheckpoints);
            console.log(`✅ Checkpoint ${checkpointId} eliminado exitosamente`);
            
            return {
                success: true,
                message: `Checkpoint ${checkpointId} eliminado`
            };
        } catch (error) {
            console.error(`❌ Error al eliminar checkpoint ${checkpointId}:`, error);
            return {
                success: false,
                message: `Error al eliminar checkpoint: ${error.message}`
            };
        }
    }




    validateInputData(data) {
        if (!data || typeof data !== 'object') return false;
        if (!data.packageNum || typeof data.packageNum !== 'number') return false;
        if (!data.totalPackages || typeof data.totalPackages !== 'number') return false;
        if (!data.checkpointID || typeof data.checkpointID !== 'string') return false;
        if (!Array.isArray(data.animals)) return false;

        return data.animals.every(animal => 
            animal && 
            animal.id && 
            typeof animal.id === 'string' &&
            typeof animal.rssi === 'number'
        );
    }
}

module.exports = MQTTController;

