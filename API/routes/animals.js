const fs = require('fs');
const path = require('path');

// Ruta relativa al archivo animals.json
//si hay mas funciones pasarlas a auxFunctionsAnimals.js
const filePath = path.join(__dirname,'..', 'BBDD', 'animals.json');

const getAnimals = () => {
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
}; 

const routeAnimals = (req, res) => {
  const animals = getAnimals();

  if (req.url === '/animals' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(animals));

  } else if (req.url === '/animals' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const newAnimal = JSON.parse(body);
      animals.push(newAnimal);
      fs.writeFileSync(filePath, JSON.stringify(animals, null, 2));
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newAnimal));
    });

  } else if (req.url.startsWith('/animals/') && req.method === 'DELETE') {
    const id = req.url.split('/')[2];//devuelve ['', 'animals', 'id-animal']->con [2] me quedo con id
    const initialLength = animals.length;//determina si elimino en base a la longitud inicial
    const updateListAnimals = animals.filter(animal => animal.id !== id);//un filter para eliminar el id-animal
    if (updateListAnimals.length < initialLength) {
      fs.writeFileSync(filePath, JSON.stringify(updateListAnimals, null, 2));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: `Animal con id ${id} eliminado` }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: `Animal con id ${id} no encontrado` }));
    }

  } else if (req.url.startsWith('/animals/') && req.method === 'PATCH') {
    const id = req.url.split('/')[2];
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const updatedData = JSON.parse(body);
      let animalFound = false;
      const updatedAnimals = animals.map(animal => {
        if (animal.id === id) {
          animalFound = true;
          return { ...animal, ...updatedData };//creo un nuevo objeto combinando los datos existentes con los datos actualizados
        }
        return animal;
      });
      if (animalFound) {
        fs.writeFileSync(filePath, JSON.stringify(updatedAnimals, null, 2));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: `Animal con id ${id} actualizado` }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: `Animal con id ${id} no encontrado` }));
      }
    });
  } else if (req.url === '/animals/position' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({  }));

  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 - Ruta no encontrada en API');
  }
};

module.exports = routeAnimals;