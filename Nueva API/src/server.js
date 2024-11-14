const http = require('http');
const url = require('url');
require('dotenv').config();

const routes = {
    '/api/animals': require('./routes/animalRoutes'),
    '/api/checkpoints': require('./routes/checkpointsRoutes')
  //  '/api/login': require('./routes/loginRoutes'),
  //  '/api/refresh': require('./routes/refreshRoutes'),
  //  '/api/availableDevices': require('./routes/deviceRoutes')
};

const server = http.createServer(async (req, res) => {
    // Configurar CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    try {
        const baseURL = `http://${req.headers.host}`;
        const reqUrl = new URL(req.url, baseURL);
        const pathname = reqUrl.pathname;

        console.log('URL solicitada:', pathname);
        
        const route = Object.keys(routes).find(key => pathname.startsWith(key));
        
        if (route) {
            console.log('Ruta encontrada:', route);
            await routes[route](req, res);
        } else {
            console.log('Ruta no encontrada');
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                error: 'Ruta no encontrada',
                path: pathname,
                availableRoutes: Object.keys(routes)
            }));
        }
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            error: 'Error interno del servidor',
            message: error.message
        }));
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});