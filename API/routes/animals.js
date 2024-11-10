const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname,'..', 'BBDD', 'animals.json');

const getAnimals = () => {
  console.log('📂 Intentando leer el archivo:', filePath);
  try {
    const data = fs.readFileSync(filePath, 'utf8');
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

  if (req.url === '/api/animals' && req.method === 'GET') {
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
      fs.writeFileSync(filePath, JSON.stringify(animals, null, 2));
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
      fs.writeFileSync(filePath, JSON.stringify(updateListAnimals, null, 2));
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
        fs.writeFileSync(filePath, JSON.stringify(updatedAnimals, null, 2));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: `Animal con id ${id} actualizado` }));
      } else {
        console.log('❌ Animal no encontrado para actualizar');
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: `Animal con id ${id} no encontrado` }));
      }
    });
  } else if (req.url === '/api/animals/position' && req.method === 'GET') {
    console.log('📍 Solicitando posiciones de animales');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({  }));

  } else {
    console.log('❌ Ruta no encontrada:', req.url);
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 - Ruta no encontrada en API');
  }
};

module.exports = routeAnimals;