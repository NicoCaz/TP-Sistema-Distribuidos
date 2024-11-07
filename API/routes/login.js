const auxFunc = require('../helpers/auxFunctionLog.js');
const jwt = require('jsonwebtoken');

const routeLogin = (req, res) => {
  if (req.url === '/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const { username: username, password: password } = JSON.parse(body);

      if (!username || !password) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: '400 - Bad Request' }));
      }

      try {      
        const user = auxFunc.checkUserAndPass(username, password);
        const token = jwt.sign({ id: user.id, username: user.username }, 'your_jwt_secret', { expiresIn: '1h' });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: `Authenticated as ${user.username}`, token }));
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

module.exports = routeLogin;