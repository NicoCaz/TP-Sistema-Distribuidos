const mqtt = require('mqtt');
const funcManager = require('./checkpointManager');

// Conectar al broker MQTT (puede ser localhost si ambos están en la misma red)
const client = mqtt.connect('mqtt://192.168.0.4:1883'); //aca poner sí o sí la ip local!!!! no funciona con localhost

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
//  client.publish('test/topic', '¡Hola desde Node.js!');
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

const completSMS = funcManager.updateSMS(jsonData);

if (completSMS) {
  //mandar a SPA
  console.log('SMS completo:', completSMS);
}


});

function publicar(topico, mensaje) {
client.publish(topico, mensaje);
}
  
  module.exports = { client, publicar };

