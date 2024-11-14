const mqtt = require('mqtt');
const funcManager = require('./checkpointManager');

const client = mqtt.connect('mqtt://192.168.0.4:1883'); 
const handler = new CheckpointHandler();
// Cuando se conecta exitosamente
client.on('connect', () => {
    console.log('Conectado a Mosquitto MQTT Broker');

    client.subscribe('test/topic', (err) => {
        if (!err) {
            console.log('Suscrito al tema test/topic');
        }
    });
});

// Manejar los mensajes recibidos
client.on('message', (topic, message) => {
    console.log(`Mensaje recibido en el tema ${topic}: ${message.toString()}`);

    let jsonData;
    try {
        jsonData = JSON.parse(message.toString());
    } catch (error) {
        console.error('Error al parsear el mensaje:', error);
        return;
    }

   // const completSMS = funcManager.updateSMS(jsonData);

    handler.updateCheckpoint(jsonData)
            .then(result => console.log(result))
            .catch(error => console.error(error));
});

function publicar(topico, mensaje) {
    client.publish(topico, mensaje);
}
  
module.exports = { client, publicar };