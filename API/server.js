const http = require('http');
const url = require('url');

const fs = require('fs');
const path = require('path');

const vacasFilePath = path.join(__dirname, 'vacas.json');

function loadvacas() {
    try {
        const data = fs.readFileSync(vacasFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error al leer el archivo vacas.json:', error);
        return [];
    }
}

function savevacas() {
    try {
        fs.writeFileSync(vacasFilePath, JSON.stringify(vacas, null, 2), 'utf8');
    } catch (error) {
        console.error('Error al guardar en vacas.json:', error);
    }
}

let vacas = loadvacas();

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

    if (path === '/vacas' && method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const { nombre, tag } = JSON.parse(body);

                if (!nombre || !tag) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: 'Nombre y tag son requeridos' }));
                }
                if (vacas.some(vaca => vaca.tag === tag)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: 'El tag ya existe' }));
                }

                vacas.push({ nombre, tag });
                savevacas();
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
            savevacas();
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
        }

     else if (path.startsWith('/vacas/') && method === 'PUT') {
        const tag = path.split('/')[2]; 
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString(); 
        });
        req.on('end', () => {
            try {
                const { nombre } = JSON.parse(body); 
                let vaca = vacas.find(v => v.tag === tag); 
                if (vaca) {
                    vaca.nombre = nombre; 
                    savevacas();
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Vaca actualizada', vaca }));
                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Vaca no encontrada', tag }));
                }
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Error al actualizar la vaca', error: error.message }));
            }
        });
    

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