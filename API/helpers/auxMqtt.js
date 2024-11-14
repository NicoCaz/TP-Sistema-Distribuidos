const fs = require('fs');
const path = require('path');

const CHECKPOINT_FILE = 'checkpoint_data.json';

class CheckpointHandler {
  constructor() {
    this.filePath = path.join(__dirname, '../BBDD', CHECKPOINT_FILE);
    this.packageTracker = new Map();
    this.fileStream = null;
  }

  openStream() {
    if (!this.fileStream) {
      this.fileStream = fs.createWriteStream(this.filePath, { flags: 'r+' });
      console.log('Stream de datos abierto');
    }
  }

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

  getCheckpointDataSync() {
    try {
      if (!fs.existsSync(this.filePath)) {
        fs.writeFileSync(this.filePath, JSON.stringify([]));
      }
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      return [];
    }
  }

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

      if (!this.packageTracker.has(checkpointID)) {
        this.packageTracker.set(checkpointID, {
          receivedPackages: new Set(),
          totalPackages: totalPackages,
          animals: []
        });
      }

      const tracker = this.packageTracker.get(checkpointID);
      tracker.receivedPackages.add(packageNum);

      let checkpoints = await this.loadCheckpointData();
      let checkpointIndex = checkpoints.findIndex(cp => cp.checkpointID === checkpointID);

      const updatedCheckpoint = {
        checkpointID,
        animals: this.mergeAnimals(
          checkpointIndex !== -1 ? checkpoints[checkpointIndex].animals : [],
          animals
        )
      };

      if (checkpointIndex !== -1) {
        checkpoints[checkpointIndex] = updatedCheckpoint;
      } else {
        checkpoints.push(updatedCheckpoint);
      }

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

  async cleanup() {
    await this.closeStream();
    this.packageTracker.clear();
  }
}

module.exports = CheckpointHandler;