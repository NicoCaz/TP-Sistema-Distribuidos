const http = require('http');
const url = require('url');
const rutasAnimales = require('./routes/animals.js');//si usamos route

let vacas = [];

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;
    const path = parsedUrl.pathname;

    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');



    if (method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    console.log(`Request received: ${method} ${path}`);

    if (path === '/vacas' && method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const { nombre, tag } = JSON.parse(body);
                vacas.push({ nombre, tag });
                console.log(`Vaca creada: ${nombre} con tag ${tag}`);
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Vaca creada', vaca: { nombre, tag } }));
            } catch (error) {
                console.error('Error al crear la vaca:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Error al crear la vaca', error: error.message }));
            }
        });
        //prueba para ver si funciona
    }else if (path === '/animals') {
        rutasAnimales(req, res);

    } else if (path.startsWith('/vacas/') && method === 'DELETE') {
        const tag = path.split('/')[2];
        const initialLength = vacas.length;
        vacas = vacas.filter(vaca => vaca.tag !== tag);
        if (vacas.length < initialLength) {
            console.log(`Vaca con tag ${tag} eliminada`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Vaca eliminada', tag }));
        } else {
            console.log(`Vaca con tag ${tag} no encontrada`);
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Vaca no encontrada', tag }));
        }
    } else if (path === '/vacas' && method === 'GET') {
        console.log('Lista de vacas solicitada');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Lista de vacas', vacas }));
    } else {
        console.log(`Ruta no encontrada: ${method} ${path}`);
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Ruta no encontrada' }));
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

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

