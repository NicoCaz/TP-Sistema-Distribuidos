module.exports = (req, res) => {

    if (req.url === '/animals' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ mensaje: 'GET' }));
    } else if (req.url === '/animals/position' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ data: [1, 2, 3, 4] }));
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 - Ruta no encontrada en API');
    }
  };