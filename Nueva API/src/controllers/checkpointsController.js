const JsonDatabase = require('../database/JsonDatabase');
const responseHandler = require('../utils/responseHandler');

class CheckpointsController {
    constructor() {
        this.db = JsonDatabase.getInstance('checkpoints.json');
    }

    async create(req, res) {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const newCheckpoint = JSON.parse(body);

                // Validar el formato de entrada POST
                if (!newCheckpoint.id || !newCheckpoint.lat || !newCheckpoint.long || !newCheckpoint.description) {
                    return responseHandler.sendError(res, 'Todos los campos son requeridos (id, lat, long, description)', 400);
                }

                const checkpoints = await this.db.readData();

                const checkpointToAdd = {
                    id: newCheckpoint.id,
                    lat: newCheckpoint.lat,
                    long: newCheckpoint.long,
                    description: newCheckpoint.description
                };

                checkpoints.push(checkpointToAdd);
                await this.db.writeData(checkpoints);

                // Devolver solo el checkpoint creado sin mensaje adicional
                responseHandler.sendJson(res, checkpointToAdd, 201);
            } catch (error) {
                responseHandler.sendError(res, 'Error al crear el checkpoint: ' + error.message);
            }
        });
    }

    async getAll(req, res) {
        try {
            const checkpoints = await this.db.readData();
            // Formato GET especificado
            responseHandler.sendJson(res, {
                data: {
                    checkpoints: checkpoints
                }
            });
        } catch (error) {
            responseHandler.sendError(res, 'Error al obtener los checkpoints');
        }
    }

    async update(req, res, id) {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', async () => {
            try {
                const updateData = JSON.parse(body);
                
                if (!updateData.lat || !updateData.long || !updateData.description) {
                    return responseHandler.sendError(res, 'Los campos lat, long y description son requeridos', 400);
                }

                const checkpoints = await this.db.readData();
                const index = checkpoints.findIndex(c => c.id === id);

                if (index === -1) {
                    return responseHandler.sendError(res, 'Checkpoint no encontrado', 404);
                }

                checkpoints[index] = {
                    ...checkpoints[index],
                    lat: updateData.lat,
                    long: updateData.long,
                    description: updateData.description
                };

                await this.db.writeData(checkpoints);
                responseHandler.sendJson(res, checkpoints[index]);
            } catch (error) {
                responseHandler.sendError(res, 'Error al actualizar el checkpoint');
            }
        });
    }

    async delete(req, res, id) {
        try {
            const checkpoints = await this.db.readData();
            const filteredCheckpoints = checkpoints.filter(c => c.id !== id);
            
            if (filteredCheckpoints.length === checkpoints.length) {
                return responseHandler.sendError(res, 'Checkpoint no encontrado', 404);
            }

            await this.db.writeData(filteredCheckpoints);
            // DELETE responde con un objeto vacío
            responseHandler.sendJson(res, {});
        } catch (error) {
            responseHandler.sendError(res, 'Error al eliminar el checkpoint');
        }
    }
}

module.exports = CheckpointsController;