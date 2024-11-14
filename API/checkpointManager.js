const fs = require('fs');
const path = require('path');
const auxFunc = require('./helpers/auxDataValidation.js');

const filePath = path.join(__dirname, 'BBDD', 'checkpoint_data.json');

// Asegurarse de que el directorio BBDD existe
const dirPath = path.join(__dirname, 'BBDD');
if (!fs.existsSync(dirPath)){
    fs.mkdirSync(dirPath, { recursive: true });
}

// Cargar datos existentes o inicializar si el archivo no existe
let checkpointData = [];
try {
    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        checkpointData = JSON.parse(fileContent);
    }
} catch (error) {
    console.error('Error al cargar el archivo:', error);
    checkpointData = [];
}

const saveToFile = () => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(checkpointData, null, 2));
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

    const checkpointIndex = checkpointData.findIndex(
        cp => cp.checkpointID === jsonData.checkpointID
    );

    if (checkpointIndex === -1) {
        // Nuevo checkpoint
        const newCheckpoint = {
            checkpointID: jsonData.checkpointID,
            packages: [{
                packageNum: jsonData.packageNum,
                animals: jsonData.animals
            }],
            totalPackages: jsonData.totalPackages,
            receivedPackages: 1,
            lastUpdate: new Date().toISOString()
        };
        checkpointData.push(newCheckpoint);
        saveToFile();
    } else {
        // Checkpoint existente
        const checkpoint = checkpointData[checkpointIndex];
        
        // Verificar si este paquete ya fue recibido
        const packageExists = checkpoint.packages.some(
            pkg => pkg.packageNum === jsonData.packageNum
        );

        if (!packageExists) {
            checkpoint.packages.push({
                packageNum: jsonData.packageNum,
                animals: jsonData.animals
            });
            checkpoint.receivedPackages += 1;
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
    // Combinar todos los animales de todos los paquetes
    const allAnimals = checkpoint.packages.reduce((acc, pkg) => {
        return acc.concat(pkg.animals);
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
    return checkpointData;
};

const getCompletedListDevices = () => {
    const allAnimals = checkpointData.flatMap(checkpoint => 
        checkpoint.packages.flatMap(pkg => pkg.animals)
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