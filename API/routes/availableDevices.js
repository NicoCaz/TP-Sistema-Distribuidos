const { getCompletedSMS: getCompletedListDevices } = require('../checkpointManager');
const auxFunc = require('../helpers/auxDataValidation.js');

const availableDevices = (req, res) => {
  console.log(`\n🔄 Nueva solicitud: ${req.method} ${req.url}`);
  
  console.log('📂 Intentando obtener lista de dispositivos completados');
  const completedData = getCompletedListDevices();
  
  if (req.url === '/api/availableDevices' && req.method === 'GET') {
    console.log('📱 Procesando solicitud de dispositivos disponibles');
    
    const deviceReceived = completedData.flatMap(data => data.animals.map(animal => animal.id));

    const filteredDevices = deviceReceived.filter(device => auxFunc.notValidateAnimal(device));

    if (filteredDevices.length > 0) {
      console.log('✅ Datos de dispositivos encontrados');
      console.log('📤 Enviando lista de dispositivos:', JSON.stringify(filteredDevices));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(filteredDevices));
    } else {
      console.log('❌ No se encontraron dispositivos sin registrar');
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'No se encontraron dispositivos sin registrar' }));
    }
  } else {
    console.log('❌ Ruta no encontrada:', req.url);
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Ruta no encontrada' }));
  }
};

module.exports = availableDevices;