const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const server = http.createServer((req, res) => {
    console.log(`Solicitud recibida: ${req.method} ${req.url}`);
    
    // Manejo de rutas para SPA
    let filePath;
    if (req.url.indexOf('.') === -1) {
        // Si la URL no contiene un punto, asumimos que es una ruta de la SPA
        filePath = path.join(PUBLIC_DIR, 'index.html');
    } else {
        // Si la URL contiene un punto, asumimos que es un archivo estático
        filePath = path.join(PUBLIC_DIR, req.url);
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
                '.js': 'application/javascript', // Cambiado de 'text/javascript'
                '.css': 'text/css',
                '.json': 'application/json',
                '.png': 'image/png',
                '.jpg': 'image/jpg',
                '.gif': 'image/gif',
                '.svg': 'image/svg+xml'
            }[extname] || 'application/octet-stream';

            console.log(`Sirviendo ${filePath} como ${contentType}`);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Directorio público: ${PUBLIC_DIR}`);
    console.log('Contenido del directorio público:');
    try {
        fs.readdirSync(PUBLIC_DIR).forEach(file => {
            console.log(file);
        });
    } catch (error) {
        console.error('Error al leer el directorio público:', error);
    }
});