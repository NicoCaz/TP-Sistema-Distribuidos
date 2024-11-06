const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');//version 3.3.4 poruqe tira error de CommonJS
const auxFunc = require('../helpers/auxFunctionsCP.js');

//si hay mas funciones pasarlas a auxFunctionsCheckpoi.js
const filePath = path.join(__dirname,'..', 'BBDD', 'checkpoints.json');


const routeCheck = (req, res) => {
    const checkpoints = auxFunc.getCheckpoints(filePath);

    if (req.url === '/checkpoints' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(checkpoints));

    }else if (req.url === '/checkpoints' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        const newCheckpoint = JSON.parse(body);
        newCheckpoint.id = nanoid(); // id con nanoid
        checkpoints.checkpoints.push(newCheckpoint);// añado el nuevo checkpoint al array de checkpoints
        auxFunc.saveCheckpoints(checkpoints,filePath);// guardo el nuevo checkpoint en chechpoint.json
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newCheckpoint));
      });
    
    }else if (req.url === '/checkpoints' && req.method === 'DELETE') {
      const id = req.url.split('/')[2];//ver como manejar la obtencion del id desde spa
      const initialLength = checkpoints.checkpoints.length;
      const updatedCheckpoints = checkpoints.checkpoints.filter(checkpoint => checkpoint.id !== id);
      if (updatedCheckpoints.length < initialLength) {
        checkpoints.checkpoints = updatedCheckpoints;
        auxFunc.saveCheckpoints(checkpoints, filePath); // Guarda el array actualizado en el archivo JSON
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: `Checkpoint con id ${id} eliminado` }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: `Checkpoint con id ${id} no encontrado` }));
      }
    
    }else if (req.url === '/checkpoints' && req.method === 'PATCH') {
      const id = req.url.split('/')[2];
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        const updatedData = JSON.parse(body);
        let checkpointFound = false;
        const updatedCheckpoints = checkpoints.checkpoints.map(checkpoint => {
          if (checkpoint.id === id) {
            checkpointFound = true;
            return { ...checkpoint, ...updatedData }; // Combina los datos existentes con los datos actualizados
          }
          return checkpoint;
        });
        if (checkpointFound) {
          checkpoints.checkpoints = updatedCheckpoints;
          auxFunc.saveCheckpoints(checkpoints, filePath); // Guarda el array actualizado en el archivo JSON
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: `Checkpoint con id ${id} actualizado` }));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: `Checkpoint con id ${id} no encontrado` }));
        }
      });
    
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 - Ruta no encontrada en API');
    }
  };

  module.exports = routeCheck;