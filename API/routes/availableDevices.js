const { getCompletedSMS: getCompletedListDevices } = require('../checkpointManager');



const availableDevices = (req, res) => {//ver como actualizar para tener los datos de los dispositivos receintes
  const completedData = getCompletedListDevices(); 
  

  if (req.url === '/api/availableDevices' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });

    if (completedData) {
        res.end(JSON.stringify(completedData));; //array de animales
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