const fs = require('fs');
const path = require('path');

const CHECKPOINT_FILE = 'checkpoint_data.json';

class CheckpointHandler {
  constructor() {
    this.filePath = path.join(__dirname, '../BBDD', CHECKPOINT_FILE);
    this.checkpoints = null;
    this.packageTracker = new Map();
    console.log('🚀 CheckpointHandler inicializado. Ruta del archivo:', this.filePath);
  }

  async loadCheckpointData() {
    try {
      // Si ya tenemos los datos en memoria, los devolvemos
      if (this.checkpoints !== null) {
        console.log('📋 Usando datos en caché');
        return this.checkpoints;
      }

      console.log('📂 Intentando cargar datos del archivo...');
      
      // Si no existen en memoria, los cargamos del archivo
      if (!fs.existsSync(this.filePath)) {
        console.log('⚠️ Archivo no encontrado, inicializando array vacío');
        this.checkpoints = [];
        return this.checkpoints;
      }

      const data = await fs.promises.readFile(this.filePath, 'utf8');
      this.checkpoints = JSON.parse(data);
      console.log(`✅ Datos cargados exitosamente. Checkpoints encontrados: ${this.checkpoints.length}`);
      return this.checkpoints;
    } catch (error) {
      console.error('❌ Error al cargar datos:', error);
      this.checkpoints = [];
      return this.checkpoints;
    }
  }

  async saveCheckpointData(data) {
    try {
      console.log('💾 Iniciando guardado de datos...');
      console.log(`📊 Checkpoints a guardar: ${data.length}`);
      
      // Actualizamos los datos en memoria
      this.checkpoints = data;
      
      // Escribimos al archivo
      await fs.promises.writeFile(this.filePath, JSON.stringify(data, null, 2));
      console.log('✅ Datos guardados exitosamente');
    } catch (error) {
      console.error('❌ Error al guardar datos:', error);
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
      console.log('\n🔄 Procesando actualización de checkpoint...');
      console.log('📥 Datos recibidos:', {
        checkpointID: jsonData.checkpointID,
        packageNum: jsonData.packageNum,
        totalPackages: jsonData.totalPackages,
        animalsCount: jsonData.animals?.length
      });

      if (!this.validateInputData(jsonData)) {
        console.error('❌ Datos inválidos recibidos');
        throw new Error('Formato de datos inválido');
      }

      const { checkpointID, packageNum, totalPackages, animals } = jsonData;

      // Inicializar o actualizar tracker
      if (!this.packageTracker.has(checkpointID)) {
        console.log(`📌 Nuevo checkpoint detectado: ${checkpointID}`);
        this.packageTracker.set(checkpointID, {
          receivedPackages: new Set(),
          totalPackages: totalPackages,
          animals: []
        });
      }

      const tracker = this.packageTracker.get(checkpointID);
      tracker.receivedPackages.add(packageNum);
      console.log(`📦 Paquete ${packageNum}/${totalPackages} registrado para ${checkpointID}`);

      // Cargar datos
      let checkpoints = await this.loadCheckpointData();
      let checkpointIndex = checkpoints.findIndex(cp => cp.checkpointID === checkpointID);

      // Actualizar datos
      if (checkpointIndex !== -1) {
        console.log(`🔄 Actualizando checkpoint existente: ${checkpointID}`);
        console.log(`🐾 Animales anteriores: ${checkpoints[checkpointIndex].animals.length}`);
        checkpoints[checkpointIndex].animals = this.mergeAnimals(
          checkpoints[checkpointIndex].animals,
          animals
        );
        console.log(`🐾 Animales después de merge: ${checkpoints[checkpointIndex].animals.length}`);
      } else {
        console.log(`➕ Añadiendo nuevo checkpoint: ${checkpointID}`);
        checkpoints.push({
          checkpointID,
          animals
        });
      }

      // Verificar si la transmisión está completa
      const isComplete = tracker.receivedPackages.size === tracker.totalPackages;
      console.log(`📊 Estado de transmisión: ${tracker.receivedPackages.size}/${tracker.totalPackages} paquetes`);

      // Guardar si está completo
      if (isComplete) {
        console.log(`✅ Transmisión completa para ${checkpointID}, guardando datos...`);
        await this.saveCheckpointData(checkpoints);
        this.packageTracker.delete(checkpointID);
        console.log(`🗑️ Tracker eliminado para ${checkpointID}`);
      } else {
        console.log(`⏳ Esperando más paquetes para ${checkpointID}`);
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
        message: error.message,
        error: error
      };
    }
  }

  mergeAnimals(existingAnimals, newAnimals) {
    console.log('🔄 Iniciando merge de animales...');
    const animalMap = new Map();
    
    if (Array.isArray(existingAnimals)) {
      existingAnimals.forEach(animal => {
        if (animal && animal.id) {
          animalMap.set(animal.id, animal);
        }
      });
      console.log(`📊 Animales existentes procesados: ${animalMap.size}`);
    }
    
    let updatedCount = 0;
    let newCount = 0;
    newAnimals.forEach(animal => {
      if (animal && animal.id) {
        if (animalMap.has(animal.id)) {
          updatedCount++;
        } else {
          newCount++;
        }
        animalMap.set(animal.id, { ...animal });
      }
    });
    
    console.log(`📊 Estadísticas de merge:
    - Actualizados: ${updatedCount}
    - Nuevos: ${newCount}
    - Total final: ${animalMap.size}`);
    
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
    console.log('🔍 Validando datos de entrada...');
    if (!data || typeof data !== 'object') {
      console.log('❌ Error: datos no son un objeto');
      return false;
    }
    if (!data.packageNum || typeof data.packageNum !== 'number') {
      console.log('❌ Error: packageNum inválido');
      return false;
    }
    if (!data.totalPackages || typeof data.totalPackages !== 'number') {
      console.log('❌ Error: totalPackages inválido');
      return false;
    }
    if (!data.checkpointID || typeof data.checkpointID !== 'string') {
      console.log('❌ Error: checkpointID inválido');
      return false;
    }
    if (!Array.isArray(data.animals)) {
      console.log('❌ Error: animals no es un array');
      return false;
    }

    const validAnimals = data.animals.every(animal => 
      animal && animal.id && typeof animal.id === 'string' &&
      typeof animal.rssi === 'number'
    );

    console.log(validAnimals ? '✅ Datos válidos' : '❌ Datos de animales inválidos');
    return validAnimals;
  }
}

module.exports = CheckpointHandler;


