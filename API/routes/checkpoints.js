const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');
const auxFunc = require('../helpers/auxFunctionsCP.js');

const filePath = path.join(__dirname,'..', 'BBDD', 'checkpoints.json');

const routeCheck = (req, res) => {
  console.log(`📥 Request recibido: ${req.method} ${req.url}`);
  
  const checkpoints = auxFunc.getCheckpoints(filePath);
  
  // Extraer la ruta base y el ID si existe
  const urlParts = req.url.split('/');
  const base = `/${urlParts[1]}/${urlParts[2]}`; // /api/checkpoints
  const id = urlParts[3]; // el ID si existe
  
  console.log('🔍 URL procesada:', { base, id });

  // GET /api/checkpoints
  if (base === '/api/checkpoints' && !id && req.method === 'GET') {
      console.log('➡️ Procesando GET todos los checkpoints');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
          data: {
              checkpoints: checkpoints
          }
      }));

  // POST /api/checkpoints
  } else if (base === '/api/checkpoints' && !id && req.method === 'POST') {
      console.log('➡️ Procesando POST nuevo checkpoint');
      let body = '';
      
      req.on('data', chunk => {
          body += chunk.toString();
      });

      req.on('end', () => {
          try {
              const checkpoint = JSON.parse(body);
              console.log('📦 Datos recibidos:', checkpoint);

              if (!checkpoint.lat || !checkpoint.long || !checkpoint.description) {
                  throw new Error('Faltan campos requeridos');
              }

              const newCheckpoint = {
                  id: nanoid(),
                  lat: parseFloat(checkpoint.lat),
                  long: parseFloat(checkpoint.long),
                  description: checkpoint.description
              };

              checkpoints.push(newCheckpoint);
              auxFunc.saveCheckpoints(checkpoints, filePath);
              
              console.log('✅ Checkpoint creado:', newCheckpoint);
              res.writeHead(201, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(newCheckpoint));
          } catch (error) {
              console.error('❌ Error al crear:', error);
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: error.message }));
          }
      });

  // DELETE /api/checkpoints/:id
  } else if (base === '/api/checkpoints' && id && req.method === 'DELETE') {
      console.log('➡️ Procesando DELETE checkpoint:', id);
      
      const index = checkpoints.findIndex(cp => cp.id === id);
      
      if (index !== -1) {
          checkpoints.splice(index, 1);
          auxFunc.saveCheckpoints(checkpoints, filePath);
          console.log('✅ Checkpoint eliminado');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Checkpoint eliminado' }));
      } else {
          console.log('❌ Checkpoint no encontrado');
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Checkpoint no encontrado' }));
      }

  // PATCH /api/checkpoints/:id
  } else if (base === '/api/checkpoints' && id && req.method === 'PATCH') {
      console.log('➡️ Procesando PATCH checkpoint:', id);
      let body = '';
      
      req.on('data', chunk => {
          body += chunk.toString();
      });

      req.on('end', () => {
          try {
              const updateData = JSON.parse(body);
              console.log('📦 Datos recibidos:', updateData);

              const index = checkpoints.findIndex(cp => cp.id === id);
              
              if (index === -1) {
                  throw new Error('Checkpoint no encontrado');
              }

              const updatedCheckpoint = {
                  ...checkpoints[index],
                  ...updateData
              };

              checkpoints[index] = updatedCheckpoint;
              auxFunc.saveCheckpoints(checkpoints, filePath);
              
              console.log('✅ Checkpoint actualizado');
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(updatedCheckpoint));
          } catch (error) {
              console.error('❌ Error al actualizar:', error);
              res.writeHead(error.message === 'Checkpoint no encontrado' ? 404 : 400, { 
                  'Content-Type': 'application/json' 
              });
              res.end(JSON.stringify({ error: error.message }));
          }
      });

  } else {
      console.log('❌ Ruta no encontrada:', req.url);
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
  }
};

module.exports = routeCheck;