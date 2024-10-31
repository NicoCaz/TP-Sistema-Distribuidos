const mqtt = require('mqtt');

// Conectar al broker MQTT (puede ser localhost si ambos están en la misma red)
const client = mqtt.connect('mqtt://localhost:1884');

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
});


function publicar(topico, mensaje) {
    client.publish(topico, mensaje);
  }
  
  module.exports = { client, publicar };