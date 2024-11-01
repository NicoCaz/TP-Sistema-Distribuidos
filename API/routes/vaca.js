const fs = require('fs');
const auxFunc = require('../helpers/auxFunctions.js');
const url = require('url'); // Asegúrate de importar url

let vacas = auxFunc.loadvacas();

const routeVacas = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;
    const pathname = parsedUrl.pathname; // Asegúrate de definir pathname correctamente

    if (pathname === '/vacas' && method === 'POST') {
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
                auxFunc.savevacas(vacas);
                console.log(`Vaca creada: ${nombre} con tag ${tag}`);
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Vaca creada', vaca: { nombre, tag } }));
            } catch (error) {
                console.error('Error al crear la vaca:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Error al crear la vaca', error: error.message }));
            }
        });
    } else if (pathname.startsWith('/vacas/') && method === 'DELETE') {
        const tag = pathname.split('/')[2];
        const initialLength = vacas.length;
        vacas = vacas.filter(vaca => vaca.tag !== tag);
        if (vacas.length < initialLength) {
            auxFunc.savevacas(vacas);
            console.log(`Vaca con tag ${tag} eliminada`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Vaca eliminada', tag }));
        } else {
            console.log(`Vaca con tag ${tag} no encontrada`);
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Vaca no encontrada', tag }));
        }
    } else if (pathname === '/vacas' && method === 'GET') {
        console.log('Lista de vacas solicitada');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Lista de vacas', vacas }));
    } else if (pathname.startsWith('/vacas/') && method === 'PUT') {
        const tag = pathname.split('/')[2]; 
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
                    auxFunc.savevacas(vacas);
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
        console.log(`Ruta no encontrada: ${method} ${pathname}`);
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Ruta no encontrada' }));
    }
};

module.exports = routeVacas;