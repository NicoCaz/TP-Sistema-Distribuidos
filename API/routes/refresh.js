const jwt = require('jsonwebtoken');

const routeRefresh = (req, res) => {
  if (req.url === '/refresh' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const { token } = JSON.parse(body);

      if (!token) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: '400 - Bad Request' }));
      }

      try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        const newToken = jwt.sign({ id: decoded.id, username: decoded.username }, 'your_jwt_secret', { expiresIn: '1h' });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ token: newToken }));
      } catch (error) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: '401 - Unauthorized' }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 - Ruta no encontrada en API');
  }
};

module.exports = routeRefresh;