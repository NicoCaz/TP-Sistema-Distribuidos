const mqtt = require('mqtt');
const fs = require('fs');
const path = require('path');

// Conectar al broker MQTT (puede ser localhost si ambos están en la misma red)
const client = mqtt.connect('mqtt://192.168.0.4:1883'); //aca poner sí o sí la ip local!!!! no funciona con localhost
const filePath = path.join(__dirname, 'BBDD', 'checkpoint_data.json');

let checkpointData = {//la creo para almacenar em sms completo
  checkpointID: '',
  totalPackages: 0,
  receivedPackages: 0,
  animals: []
};


// Cuando se conecta exitosamente
client.on('connect', () => {
  console.log('Conectado a Mosquitto MQTT Broker');

  // Suscribirse a un tema
  client.subscribe('test/topic', (err) => {
    if (!err) {
      console.log('Suscrito al tema test/topic');
    }
  });

  // Publicar un mensaje en el tema
  client.publish('test/topic', '¡Hola desde Node.js!');
});

// Manejar los mensajes recibidos
client.on('message', (topic, message) => {
console.log(`Mensaje recibido en el tema ${topic}: ${message.toString()}`);


//const filePath = path.join(__dirname, /*'..',*/ 'BBDD', 'checkpoint_data.json');
let jsonData;
try {
  jsonData = JSON.parse(message.toString());
} catch (error) {
  console.error('Error al parsear el mensaje:', error);
  return;
}

if (checkpointData.checkpointID === '') {
  checkpointData.checkpointID = jsonData.checkpointID;
  checkpointData.totalPackages = jsonData.totalPackages;
}

checkpointData.receivedPackages += 1;//verifica si se recibieron todos los paquetes
checkpointData.animals = checkpointData.animals.concat(jsonData.animals);

// Verificar si se han recibido todos los paquetes
if (checkpointData.receivedPackages === checkpointData.totalPackages) {
  console.log('Todos los paquetes recibidos:', checkpointData);

  // Guardar los datos en un archivo/ no se si es necesario
  fs.writeFile(filePath, JSON.stringify(checkpointData, null, 2), (err) => {
    if (err) {
      console.error('Error al guardar los datos:', err);
    } else {
      console.log('Datos guardados en', filePath);
    }
  });

  // Reiniciar la estructura para el próximo conjunto de paquetes
  checkpointData = {
    checkpointID: '',
    totalPackages: 0,
    receivedPackages: 0,
    animals: []
  };
}else{
  console.log('Paquetes recibidos:', checkpointData.receivedPackages,', Esperados: ',checkpointData.totalPackages);}

});

function publicar(topico, mensaje) {
client.publish(topico, mensaje);
}
  
  module.exports = { client, publicar };