const http = require('http');
const url = require('url');

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