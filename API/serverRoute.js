const http = require('http');
const rutasAnimales = require('./routes/animals.js');
const rutasCheckpoint = require('./routes/checkpoints.js');
const rutasLogin = require('./routes/login.js');
const rutasRefresh = require('./routes/refresh.js');
const mqttClient = require('./mqttCliente.js');

dotenv.config

const server = http.createServer((req, res) => {
  // Lógica para verificar cada conjunto de rutas
  if (req.url.startsWith('/animals')) {
    rutasAnimales(req, res);
  } else if (req.url.startsWith('/checkpoints')) {
    rutasCheckpoint(req, res);
  }
  else if (req.url.startsWith('/login')) {
    rutasLogin(req, res);
  }
  else if (req.url.startsWith('/refresh')) {
    rutasRefresh(req, res);
  }
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 - Ruta no encontrada');
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor en ejecución en http://localhost:${PORT}`);
});