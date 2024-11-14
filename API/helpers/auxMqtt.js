const fs = require('fs').promises;
const path = require('path');

const CHECKPOINT_FILE = 'checkpoint_data.json';

class CheckpointHandler {
  constructor() {
    this.filePath = path.join(__dirname, CHECKPOINT_FILE);
  }

  async loadCheckpointData() {
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Si el archivo no existe, retorna un array vacío
        return [];
      }
      throw error;
    }
  }

  async saveCheckpointData(data) {
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  removeAnimalFromOtherCheckpoints(checkpoints, currentCheckpointId, animal) {
    return checkpoints.map(checkpoint => {
      if (checkpoint.checkpointID !== currentCheckpointId) {
        checkpoint.animals = checkpoint.animals.filter(a => a.id !== animal.id);
      }
      return checkpoint;
    });
  }

  async updateCheckpoint(jsonData) {
    try {
      // Validar el formato de los datos de entrada
      if (!this.validateInputData(jsonData)) {
        throw new Error('Formato de datos inválido');
      }

      let checkpoints = await this.loadCheckpointData();
      const { checkpointID, animals } = jsonData;

      // Buscar el checkpoint existente
      let checkpointIndex = checkpoints.findIndex(cp => cp.checkpointID === checkpointID);

      // Procesar cada animal y removerlo de otros checkpoints
      for (const animal of animals) {
        checkpoints = this.removeAnimalFromOtherCheckpoints(checkpoints, checkpointID, animal);
      }

      if (checkpointIndex === -1) {
        // Si el checkpoint no existe, crear uno nuevo
        checkpoints.push({
          checkpointID,
          animals
        });
      } else {
        // Actualizar checkpoint existente
        checkpoints[checkpointIndex] = {
          checkpointID,
          animals
        };
      }

      // Guardar los cambios en el archivo
      await this.saveCheckpointData(checkpoints);
      
      return {
        success: true,
        message: `Checkpoint ${checkpointID} actualizado exitosamente`,
        data: checkpoints
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

  validateInputData(data) {
    // Validar estructura básica
    if (!data || typeof data !== 'object') return false;
    if (!data.packageNum || typeof data.packageNum !== 'number') return false;
    if (!data.totalPackages || typeof data.totalPackages !== 'number') return false;
    if (!data.checkpointID || typeof data.checkpointID !== 'string') return false;
    if (!Array.isArray(data.animals)) return false;

    // Validar cada animal en el array
    return data.animals.every(animal => 
      animal.id && typeof animal.id === 'string' &&
      typeof animal.rssi === 'number'
    );
  }
}

// Ejemplo de uso:
/*
const handler = new CheckpointHandler();
const sampleData = {
  packageNum: 1,
  totalPackages: 1,
  checkpointID: "8C:AA:B5:8B:F8:40",
  animals: [
    {
      id: "02:b3:ec:c2:17:72",
      rssi: -77
    },
    {
      id: "2a:56:6f:52:50:7c",
      rssi: -44
    }
  ]
};

handler.updateCheckpoint(sampleData)
  .then(result => console.log(result))
  .catch(error => console.error(error));
*/

module.exports = CheckpointHandler;