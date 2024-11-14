const mqtt = require('mqtt');
const fs = require('fs');
const path = require('path');

// Configuración de rutas y archivos
const dirPath = path.join(__dirname, 'BBDD');
const filePath = path.join(dirPath, 'checkpoint_data.json');

// Asegurarse de que el directorio BBDD existe
if (!fs.existsSync(dirPath)){
    fs.mkdirSync(dirPath, { recursive: true });
}

// Cargar datos existentes o crear array vacío
let checkpointData = [];
try {
    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        checkpointData = JSON.parse(fileContent);
    }
} catch (error) {
    console.error('Error al cargar datos:', error);
    checkpointData = [];
}

// Función para validar MAC address
function validateMAC(mac) {
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return macRegex.test(mac);
}

// Función para validar el formato de los datos
function validateData(data) {
    // Verificar estructura básica
    if (!data || typeof data !== 'object') return false;
    if (!data.checkpointID || !Array.isArray(data.animals)) return false;
    
    // Validar MAC del checkpoint
    if (!validateMAC(data.checkpointID)) return false;
    
    // Validar cada animal
    return data.animals.every(animal => 
        animal.id &&
        typeof animal.rssi === 'number' &&
        validateMAC(animal.id)
    );
}

// Función para guardar datos en archivo
function saveToFile() {
    try {
        fs.writeFileSync(filePath, JSON.stringify(checkpointData, null, 2));
        console.log('Datos guardados en:', filePath);
    } catch (error) {
        console.error('Error al guardar datos:', error);
    }
}

// Función para actualizar datos de checkpoint
function updateCheckpointData(data) {
    const index = checkpointData.findIndex(cp => cp.checkpointID === data.checkpointID);
    
    if (index === -1) {
        // Nuevo checkpoint
        checkpointData.push({
            checkpointID: data.checkpointID,
            animals: data.animals
        });
    } else {
        // Actualizar checkpoint existente
        const existingAnimals = new Map(
            checkpointData[index].animals.map(animal => [animal.id, animal])
        );
        
        // Actualizar o agregar nuevos animales
        data.animals.forEach(animal => {
            existingAnimals.set(animal.id, animal);
        });
        
        checkpointData[index].animals = Array.from(existingAnimals.values());
    }
    
    saveToFile();
    return checkpointData;
}

// Configuración del cliente MQTT
const client = mqtt.connect('mqtt://192.168.0.4:1883');

// Evento de conexión
client.on('connect', () => {
    console.log('Conectado a Mosquitto MQTT Broker');
    
    client.subscribe('test/topic', (err) => {
        if (!err) {
            console.log('Suscrito al tema test/topic');
        } else {
            console.error('Error al suscribirse:', err);
        }
    });
});

// Evento de mensaje recibido
client.on('message', (topic, message) => {
    console.log(`Mensaje recibido en ${topic}:`, message.toString());
    
    let jsonData;
    try {
        jsonData = JSON.parse(message.toString());
    } catch (error) {
        console.error('Error al parsear mensaje JSON:', error);
        return;
    }
    
    // Validar datos
    if (!validateData(jsonData)) {
        console.error('Datos inválidos recibidos:', jsonData);
        return;
    }
    
    // Actualizar y guardar datos
    const updatedData = updateCheckpointData(jsonData);
    console.log('Datos actualizados:', updatedData);
});

// Función para publicar mensajes
function publicar(topico, mensaje) {
    client.publish(topico, mensaje);
}

// Función para obtener datos actuales
function getCheckpointData() {
    return checkpointData;
}

module.exports = { 
    client, 
    publicar,
    getCheckpointData 
};