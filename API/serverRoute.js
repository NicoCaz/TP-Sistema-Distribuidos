const http = require('http');
const rutasAnimales = require('./routes/animals.js');
const rutasCheckpoint = require('./routes/checkpoints.js');
const rutasLogin = require('./routes/login.js');
const rutasRefresh = require('./routes/refresh.js');
const rutasVacas = require('./routes/vaca.js');
const url = require('url'); 
const fs = require('fs');
//const path = require('path');
const dotenv = require('dotenv');


dotenv.config();

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;
  const path = parsedUrl.pathname;

  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
  }

  console.log(`Request received: ${method} ${path}`);

  // Lógica para verificar cada conjunto de rutas
  if (req.url.startsWith('/animals')) {
    rutasAnimales(req, res);
  } else if (req.url.startsWith('/checkpoints')) {
    rutasCheckpoint(req, res);
  }  else if (req.url.startsWith('/login')) {
    rutasLogin(req, res);
  }  else if (req.url.startsWith('/refresh')) {
    rutasRefresh(req, res);
  }//a modo de ejemplo dejo el de vacas,pero en teoria no existe esa ruta
  else if (req.url.startsWith('/vacas')) {
    rutasVacas(req, res);
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