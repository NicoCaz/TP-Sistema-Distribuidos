const http = require('http');
const url = require('url');

let vacas = [];

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;
    const path = parsedUrl.pathname;

    if (path === '/vacas' && method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const { nombre, tag } = JSON.parse(body);
            vacas.push({ nombre, tag });
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Vaca creada' }));
        });
    } else if (path.startsWith('/vacas/') && method === 'DELETE') {
        const tag = path.split('/')[2];
        vacas = vacas.filter(vaca => vaca.tag !== tag);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Vaca eliminada' }));
    } else if (path === '/vacas' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(vacas));
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Ruta no encontrada' }));
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});