const routeLogin = (req, res) => {
    if (req.url === '/login' && req.method === 'POST') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({}));
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 - Ruta no encontrada en API');
    }
  };
  module.exports = routeLogin;