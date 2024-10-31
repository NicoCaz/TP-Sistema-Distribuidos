module.exports = (req, res) => {
    if (req.url === '/checkpoints' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ mensaje: 'GET' }));
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 - Ruta no encontrada en API');
    }
  };