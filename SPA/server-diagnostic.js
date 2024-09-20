const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;

const server = http.createServer((req, res) => {
  console.log(`Solicitud recibida: ${req.method} ${req.url}`);
  
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './index.html';
  }

  console.log(`Intentando leer el archivo: ${filePath}`);

  fs.readFile(filePath, (error, content) => {
    if (error) {
      console.error(`Error al leer el archivo ${filePath}:`, error);
      if(error.code == 'ENOENT') {
        res.writeHead(404);
        res.end('Archivo no encontrado');
      } else {
        res.writeHead(500);
        res.end('Error del servidor: '+error.code);
      }
    } else {
      const extname = String(path.extname(filePath)).toLowerCase();
      const contentType = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
      }[extname] || 'application/octet-stream';

      console.log(`Sirviendo ${filePath} como ${contentType}`);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Directorio actual: ${process.cwd()}`);
  console.log('Contenido del directorio:');
  fs.readdirSync('.').forEach(file => {
    console.log(file);
  });
});