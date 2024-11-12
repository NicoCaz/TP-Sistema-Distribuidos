const { getCompletedSMS } = require('../checkpointManager');



const availableDevices = (req, res) => {//ver como actualizar para tener los datos de los dispositivos receintes
  const completedData = getCompletedSMS(); 
  let aux = {
    packageNum: 1,
    checkpointID: '12345',
    totalPackages: 1,
    contPackages: 1,
    animals: [
      { id: 'animal1', rssi: -77 },
      { id: 'animal2', rssi: -44 },
      { id: 'animal3', rssi: -81 }
    ]
  };


  if (req.url === '/api/availableDevices' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });

    if (true/*completedData*/) {
        res.end(JSON.stringify(aux.animals));; //array de animales

       // res.end(JSON.stringify(completedData.animals));; //array de animales
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'No se encontraron dispositivos cerca' }));
      }
} else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Ruta no encontrada' }));
  }




};

module.exports = availableDevices;