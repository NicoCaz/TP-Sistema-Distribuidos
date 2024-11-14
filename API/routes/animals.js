const fs = require('fs');
const path = require('path');
const auxFuncCP = require('../helpers/auxFunctionsCP.js');
const CheckpointHandler = require('../helpers/auxMqtt');
const handler = new CheckpointHandler();
const animalsFilePath = path.join(__dirname, '..', 'BBDD', 'animals.json');

// Radio máximo de distancia en grados (aproximadamente 100-200 metros)
const MAX_RADIUS = 0.002;

const getAnimals = () => {
  console.log('📂 Intentando leer el archivo:', animalsFilePath);
  try {
    const data = fs.readFileSync(animalsFilePath, 'utf8');
    console.log('✅ Archivo leído exitosamente');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Error al leer el archivo:', error.message);
    throw error;
  }
};



const routeAnimals = (req, res) => {
  console.log(`\n🔄 Nueva solicitud: ${req.method} ${req.url}`);
  const animals = getAnimals();
  const dataCheckPoints = handler.getCheckpointDataSync();
  //creo el formato con los datos actuales
  console.log(dataCheckPoints);
  if (req.url === '/api/animals/position' && req.method === 'GET') {
    console.log('📍 Solicitando posiciones de animales');

    const dataPosition = dataCheckPoints.map(dataCheckpoint => {
      console.log('🔍 Buscando checkpoint:', dataCheckpoint.checkpointID);
      const checkpoint = auxFuncCP.getCheckpointById(dataCheckpoint.checkpointID);
      console.log (checkpoint)
      const coordinates = {
        lat: checkpoint.lat,
        long: checkpoint.long
      };

      return {
        idCP: dataCheckpoint.checkpointID,
        lat: coordinates.lat,
        long: coordinates.long,
        descriptionCP: checkpoint.description,
        animals: dataCheckpoint.animals
      };
    });

    console.log('📤 Enviando posiciones:',JSON.stringify(dataPosition, null, 2));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ dataPosition}));
  }

  else if (req.url === '/api/animals' && req.method === 'GET') {
    console.log('📤 Enviando lista de todos los animales');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(animals));

  } else if (req.url === '/api/animals' && req.method === 'POST') {
    console.log('📥 Procesando solicitud POST para nuevo animal');
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      console.log('📦 Recibiendo datos...');
    });
    req.on('end', () => {
      console.log('📝 Datos recibidos completos:', body);
      const newAnimal = JSON.parse(body);
      animals.push(newAnimal);
      console.log('💾 Guardando nuevo animal:', newAnimal);
      fs.writeFileSync(animalsFilePath, JSON.stringify(animals, null, 2));
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newAnimal));
    });

  } else if (req.url.startsWith('/api/animals/') && req.method === 'DELETE') {
    const id = req.url.split('/')[3];
    console.log('🗑️ Intentando eliminar animal con ID:', id);
    const initialLength = animals.length;
    const updateListAnimals = animals.filter(animal => animal.id !== id);
    console.log(`📊 Animales antes: ${initialLength}, después: ${updateListAnimals.length}`);
    
    if (updateListAnimals.length < initialLength) {
      console.log('✅ Animal encontrado y eliminado');
      fs.writeFileSync(animalsFilePath, JSON.stringify(updateListAnimals, null, 2));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: `Animal con id ${id} eliminado` }));
    } else {
      console.log('❌ Animal no encontrado para eliminar');
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: `Animal con id ${id} no encontrado` }));
    }

  } else if (req.url.startsWith('/api/animals/') && req.method === 'PATCH') {
    const id = req.url.split('/')[3];
    console.log('🔄 Intentando actualizar animal con ID:', id);
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      console.log('📦 Recibiendo datos de actualización...');
    });
    req.on('end', () => {
      console.log('📝 Datos de actualización recibidos:', body);
      const updatedData = JSON.parse(body);
      let animalFound = false;
      const updatedAnimals = animals.map(animal => {
        if (animal.id === id) {
          animalFound = true;
          console.log('🔍 Animal encontrado, actualizando datos');
          return { ...animal, ...updatedData };
        }
        return animal;
      });
      if (animalFound) {
        console.log('✅ Animal actualizado exitosamente');
        fs.writeFileSync(animalsFilePath, JSON.stringify(updatedAnimals, null, 2));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: `Animal con id ${id} actualizado` }));
      } else {
        console.log('❌ Animal no encontrado para actualizar');
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: `Animal con id ${id} no encontrado` }));
      }
    });
  } else {
    console.log('❌ Ruta no encontrada:', req.url);
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 - Ruta no encontrada en API');
  }
};

module.exports = routeAnimals;