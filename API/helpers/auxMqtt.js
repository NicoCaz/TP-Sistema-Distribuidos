const fs = require('fs');
const path = require('path');

const CHECKPOINT_FILE = 'checkpoint_data.json';

class CheckpointHandler {
  constructor() {
    this.filePath = path.join(__dirname, CHECKPOINT_FILE);
    this.packageTracker = new Map();
    this.fileStream = null;
  }

  // Abrir el stream de datos
  openStream() {
    if (!this.fileStream) {
      this.fileStream = fs.createWriteStream(this.filePath, { flags: 'r+' });
      console.log('Stream de datos abierto');
    }
  }

  // Cerrar el stream de datos
  closeStream() {
    return new Promise((resolve, reject) => {
      if (this.fileStream) {
        this.fileStream.end(() => {
          this.fileStream.close((err) => {
            if (err) {
              console.error('Error al cerrar el stream:', err);
              reject(err);
            } else {
              console.log('Stream de datos cerrado');
              this.fileStream = null;
              resolve();
            }
          });
        });
      } else {
        resolve();
      }
    });
  }

  // Cargar datos del archivo
  async loadCheckpointData() {
    try {
      if (!fs.existsSync(this.filePath)) {
        await fs.promises.writeFile(this.filePath, JSON.stringify([]));
      }
      const data = await fs.promises.readFile(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      return [];
    }
  }

  // Guardar datos en el archivo
  async saveCheckpointData(data) {
    try {
      this.openStream();
      const jsonData = JSON.stringify(data, null, 2);
      
      return new Promise((resolve, reject) => {
        this.fileStream.write(jsonData, async (err) => {
          if (err) {
            console.error('Error al escribir datos:', err);
            reject(err);
          } else {
            // Si se han recibido todos los paquetes, cerrar el stream
            if (this.isTransmissionComplete(data)) {
              await this.closeStream();
            }
            resolve();
          }
        });
      });
    } catch (error) {
      console.error('Error al guardar datos:', error);
      throw error;
    }
  }

  // Verificar si la transmisión está completa
  isTransmissionComplete(data) {
    for (const [checkpointID, tracker] of this.packageTracker.entries()) {
      if (tracker.receivedPackages.size !== tracker.totalPackages) {
        return false;
      }
    }
    return true;
  }

  async updateCheckpoint(jsonData) {
    try {
      if (!this.validateInputData(jsonData)) {
        throw new Error('Formato de datos inválido');
      }

      const { checkpointID, packageNum, totalPackages, animals } = jsonData;

      // Inicializar o actualizar el rastreador de paquetes
      if (!this.packageTracker.has(checkpointID)) {
        this.packageTracker.set(checkpointID, {
          receivedPackages: new Set(),
          totalPackages: totalPackages,
          animals: []
        });
      }

      const tracker = this.packageTracker.get(checkpointID);
      tracker.receivedPackages.add(packageNum);

      // Cargar datos existentes
      let checkpoints = await this.loadCheckpointData();
      let checkpointIndex = checkpoints.findIndex(cp => cp.checkpointID === checkpointID);

      // Actualizar o crear nuevo checkpoint
      const updatedCheckpoint = {
        checkpointID,
        animals: this.mergeAnimals(
          checkpointIndex !== -1 ? checkpoints[checkpointIndex].animals : [],
          animals
        ),
        lastUpdate: new Date().toISOString()
      };

      if (checkpointIndex !== -1) {
        checkpoints[checkpointIndex] = updatedCheckpoint;
      } else {
        checkpoints.push(updatedCheckpoint);
      }

      // Guardar los datos actualizados
      await this.saveCheckpointData(checkpoints);

      const isComplete = tracker.receivedPackages.size === tracker.totalPackages;
      
      return {
        success: true,
        message: isComplete ? 
          `Transmisión completa para checkpoint ${checkpointID}` : 
          `Paquete ${packageNum}/${totalPackages} procesado para checkpoint ${checkpointID}`,
        complete: isComplete,
        progress: {
          received: tracker.receivedPackages.size,
          total: tracker.totalPackages
        }
      };

    } catch (error) {
      console.error('Error en updateCheckpoint:', error);
      return {
        success: false,
        message: error.message,
        error: error
      };
    }
  }

  mergeAnimals(existingAnimals, newAnimals) {
    const animalMap = new Map(existingAnimals.map(a => [a.id, a]));
    newAnimals.forEach(animal => {
      animalMap.set(animal.id, animal);
    });
    return Array.from(animalMap.values());
  }

  validateInputData(data) {
    if (!data || typeof data !== 'object') return false;
    if (!data.packageNum || typeof data.packageNum !== 'number') return false;
    if (!data.totalPackages || typeof data.totalPackages !== 'number') return false;
    if (!data.checkpointID || typeof data.checkpointID !== 'string') return false;
    if (!Array.isArray(data.animals)) return false;

    return data.animals.every(animal => 
      animal.id && typeof animal.id === 'string' &&
      typeof animal.rssi === 'number'
    );
  }

  // Método para limpiar recursos al finalizar
  async cleanup() {
    await this.closeStream();
    this.packageTracker.clear();
  }
}

module.exports = CheckpointHandler;