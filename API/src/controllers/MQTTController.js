const JsonDatabase = require('../database/JsonDatabase');
const responseHandler = require('../utils/responseHandler');

class MQTTController {
    constructor() {
        this.db = JsonDatabase.getInstance('checkpoints_data.json');
        this.packageTracker = new Map();
        this.processingLock = new Map(); // Prevenir procesamiento simultáneo del mismo checkpoint
    }

    async updateCheckpoint(checkpointData) {
        const { checkpointID } = checkpointData;
        
        // Si ya hay un procesamiento en curso para este checkpoint, esperar
        if (this.processingLock.get(checkpointID)) {
            console.log(`⏳ Esperando procesamiento previo para ${checkpointID}`);
            await this.waitForLock(checkpointID);
        }

        try {
            // Establecer lock
            this.processingLock.set(checkpointID, true);

            const result = await this._processCheckpointUpdate(checkpointData);
            return result;

        } catch (error) {
            console.error(`❌ Error procesando checkpoint ${checkpointID}:`, error);
            return {
                success: false,
                message: error.message
            };
        } finally {
            // Liberar lock
            this.processingLock.set(checkpointID, false);
        }
    }

    async waitForLock(checkpointID) {
        return new Promise(resolve => {
            const checkLock = () => {
                if (!this.processingLock.get(checkpointID)) {
                    resolve();
                } else {
                    setTimeout(checkLock, 100); // Verificar cada 100ms
                }
            };
            checkLock();
        });
    }

    async _processCheckpointUpdate(checkpointData) {
        const { checkpointID, packageNum, totalPackages, animals } = checkpointData;

        // Inicializar tracker si no existe
        if (!this.packageTracker.has(checkpointID)) {
            this.packageTracker.set(checkpointID, {
                receivedPackages: new Set(),
                totalPackages,
                animals: new Map() // Usar Map para mejor manejo concurrente
            });
        }

        const tracker = this.packageTracker.get(checkpointID);
        tracker.receivedPackages.add(packageNum);

        // Actualizar animales en el tracker
        animals.forEach(animal => {
            tracker.animals.set(animal.id, animal);
        });

        // Verificar si la transmisión está completa
        const isComplete = tracker.receivedPackages.size === tracker.totalPackages;

        if (isComplete) {
            await this._saveCompleteData(checkpointID);
            this.packageTracker.delete(checkpointID);
        }

        return {
            success: true,
            message: `Paquete ${packageNum}/${totalPackages} procesado`,
            complete: isComplete
        };
    }

    async _saveCompleteData(checkpointID) {
        const tracker = this.packageTracker.get(checkpointID);
        const checkpoints = await this.db.readData();
        
        const checkpointIndex = checkpoints.findIndex(cp => cp.checkpointID === checkpointID);
        const updatedAnimals = Array.from(tracker.animals.values());

        if (checkpointIndex !== -1) {
            checkpoints[checkpointIndex].animals = updatedAnimals;
        } else {
            checkpoints.push({
                checkpointID,
                animals: updatedAnimals
            });
        }

        await this.db.writeData(checkpoints);
    }
}

module.exports = MQTTController;