const { getCompletedSMS } = require('../../checkpointManager');


const availableDevices = (req, res) => {//ver como actualizar para tener los datos de los dispositivos receintes
  const completedData = getCompletedSMS(); 

  if (req.url === '/api/availableDevices' && req.method === 'GET') {
 
    if (completedData) {
        res.json(completedData.animals); //array de animales
    } else {
        res.status(404).json({ message: 'No se encontraron dispositivos cerca' });
    }
}};

module.exports = availableDevices;