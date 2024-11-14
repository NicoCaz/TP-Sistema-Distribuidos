const fs = require('fs');
const path = require('path');
const auxFunc = require('./helpers/auxDataValidation.js');

const filePath = path.join(__dirname, 'BBDD', 'checkpoint_data.json');

// Asegurarse de que el directorio BBDD existe
const dirPath = path.join(__dirname, 'BBDD');
if (!fs.existsSync(dirPath)){
    fs.mkdirSync(dirPath, { recursive: true });
}

// Inicializar checkpointData como un array vacío
let checkpointData = [];

// Cargar datos existentes o mantener el array vacío si el archivo no existe
try {
    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const parsedData = JSON.parse(fileContent);
        // Verificar que los datos cargados sean un array
        checkpointData = Array.isArray(parsedData) ? parsedData : [];
    }
} catch (error) {
    console.error('Error al cargar el archivo:', error);
    checkpointData = [];
}

const saveToFile = () => {
    try {
        // Asegurarse de que checkpointData sea un array antes de guardar
        const dataToSave = Array.isArray(checkpointData) ? checkpointData : [];
        fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2));
        console.log('Datos guardados en', filePath);
    } catch (error) {
        console.error('Error al guardar los datos:', error);
    }
};

const updateSMS = (jsonData) => {
    if (!auxFunc.valCheckpoint(jsonData.checkpointID)) {
        console.error('ID de checkpoint inválido');
        return null;
    }

    // Asegurarse de que checkpointData sea un array
    if (!Array.isArray(checkpointData)) {
        checkpointData = [];
    }

    const checkpointIndex = checkpointData.findIndex(
        cp => cp.checkpointID === jsonData.checkpointID
    );

    if (checkpointIndex === -1) {
        // Nuevo checkpoint
        const newCheckpoint = {
            checkpointID: jsonData.checkpointID,
            packages: [{
                packageNum: jsonData.packageNum,
                animals: jsonData.animals || []
            }],
            totalPackages: jsonData.totalPackages,
            receivedPackages: 1,
            lastUpdate: new Date().toISOString()
        };
        checkpointData.push(newCheckpoint);
        saveToFile();
        
        // Si solo hay un paquete total, devolver los datos completos
        if (newCheckpoint.totalPackages === 1) {
            return getCompleteCheckpointData(newCheckpoint);
        }
    } else {
        // Checkpoint existente
        const checkpoint = checkpointData[checkpointIndex];
        
        // Asegurarse de que packages sea un array
        if (!Array.isArray(checkpoint.packages)) {
            checkpoint.packages = [];
        }

        // Verificar si este paquete ya fue recibido
        const packageExists = checkpoint.packages.some(
            pkg => pkg.packageNum === jsonData.packageNum
        );

        if (!packageExists) {
            checkpoint.packages.push({
                packageNum: jsonData.packageNum,
                animals: jsonData.animals || []
            });
            checkpoint.receivedPackages = (checkpoint.receivedPackages || 0) + 1;
            checkpoint.lastUpdate = new Date().toISOString();
            
            // Ordenar paquetes por número
            checkpoint.packages.sort((a, b) => a.packageNum - b.packageNum);
            
            saveToFile();

            // Verificar si se han recibido todos los paquetes
            if (checkpoint.receivedPackages === checkpoint.totalPackages) {
                console.log('Todos los paquetes recibidos para checkpoint:', checkpoint.checkpointID);
                return getCompleteCheckpointData(checkpoint);
            }
        }
    }
    return null;
};

const getCompleteCheckpointData = (checkpoint) => {
    if (!checkpoint || !Array.isArray(checkpoint.packages)) {
        return null;
    }

    // Combinar todos los animales de todos los paquetes
    const allAnimals = checkpoint.packages.reduce((acc, pkg) => {
        return acc.concat(Array.isArray(pkg.animals) ? pkg.animals : []);
    }, []);

    // Eliminar duplicados basados en el ID del animal
    const uniqueAnimals = Array.from(
        new Map(allAnimals.map(animal => [animal.id, animal])).values()
    );

    return {
        checkpointID: checkpoint.checkpointID,
        totalPackages: checkpoint.totalPackages,
        animals: uniqueAnimals
    };
};

const getCheckpointData = () => {
    return Array.isArray(checkpointData) ? checkpointData : [];
};

const getCompletedListDevices = () => {
    if (!Array.isArray(checkpointData)) {
        return [];
    }

    const allAnimals = checkpointData.flatMap(checkpoint => 
        Array.isArray(checkpoint.packages) 
            ? checkpoint.packages.flatMap(pkg => Array.isArray(pkg.animals) ? pkg.animals : [])
            : []
    );
    
    // Eliminar duplicados basados en el ID del animal
    return Array.from(
        new Map(allAnimals.map(animal => [animal.id, animal])).values()
    );
};

module.exports = { 
    updateSMS, 
    getCheckpointData, 
    getCompletedListDevices 
};