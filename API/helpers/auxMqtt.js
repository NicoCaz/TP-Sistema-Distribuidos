const fs = require('fs');
const path = require('path');

const CHECKPOINT_FILE = 'checkpoint_data.json';

class CheckpointHandler {
  constructor() {
    this.filePath = path.join(__dirname, '../BBDD', CHECKPOINT_FILE);
    this.checkpoints = null;
    this.packageTracker = new Map();
  }

  async loadCheckpointData() {
    try {
      // Si ya tenemos los datos en memoria, los devolvemos
      if (this.checkpoints !== null) {
        return this.checkpoints;
      }

      // Si no existen en memoria, los cargamos del archivo
      if (!fs.existsSync(this.filePath)) {
        this.checkpoints = [];
        return this.checkpoints;
      }

      const data = await fs.promises.readFile(this.filePath, 'utf8');
      this.checkpoints = JSON.parse(data);
      return this.checkpoints;
    } catch (error) {
      console.error('Error al cargar datos:', error);
      this.checkpoints = [];
      return this.checkpoints;
    }
  }

  async saveCheckpointData(data) {
    try {
      // Actualizamos los datos en memoria
      this.checkpoints = data;
      // Escribimos al archivo
      await fs.promises.writeFile(this.filePath, JSON.stringify(data, null, 2));
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

      // Cargar datos de memoria o archivo si es necesario
      let checkpoints = await this.loadCheckpointData();
      let checkpointIndex = checkpoints.findIndex(cp => cp.checkpointID === checkpointID);

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

      // Solo guardar al archivo si la transmisión está completa
      if (tracker.receivedPackages.size === tracker.totalPackages) {
        await this.saveCheckpointData(checkpoints);
        this.packageTracker.delete(checkpointID);
      }

      return {
        success: true,
        message: `Paquete ${packageNum}/${totalPackages} procesado para checkpoint ${checkpointID}`,
        complete: tracker.receivedPackages.size === tracker.totalPackages
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
    const animalMap = new Map();
    
    // Añadir animales existentes al mapa
    if (Array.isArray(existingAnimals)) {
      existingAnimals.forEach(animal => {
        if (animal && animal.id) {
          animalMap.set(animal.id, animal);
        }
      });
    }
    
    // Actualizar con nuevos animales
    newAnimals.forEach(animal => {
      if (animal && animal.id) {
        animalMap.set(animal.id, { ...animal });
      }
    });
    
    return Array.from(animalMap.values());
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
  

  validateInputData(data) {
    if (!data || typeof data !== 'object') return false;
    if (!data.packageNum || typeof data.packageNum !== 'number') return false;
    if (!data.totalPackages || typeof data.totalPackages !== 'number') return false;
    if (!data.checkpointID || typeof data.checkpointID !== 'string') return false;
    if (!Array.isArray(data.animals)) return false;

    return data.animals.every(animal => 
      animal && animal.id && typeof animal.id === 'string' &&
      typeof animal.rssi === 'number'
    );
  }
}

module.exports = CheckpointHandler;
