const { getCompletedSMS: getCompletedListDevices } = require('../checkpointManager');

const availableDevices = (req, res) => {
  console.log(`\n🔄 Nueva solicitud: ${req.method} ${req.url}`);
  
  console.log('📂 Intentando obtener lista de dispositivos completados');
  const completedData = getCompletedListDevices();
  
  if (req.url === '/api/availableDevices' && req.method === 'GET') {
    console.log('📱 Procesando solicitud de dispositivos disponibles');
    
    if (completedData) {
      console.log('✅ Datos de dispositivos encontrados');
      console.log('📤 Enviando lista de dispositivos:', completedData.flatMap(data => data.checkpointID));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(completedData.flatMap(data => data.checkpointID)));
    } else {
      console.log('❌ No se encontraron dispositivos cerca');
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'No se encontraron dispositivos cerca' }));
    }
  } else {
    console.log('❌ Ruta no encontrada:', req.url);
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Ruta no encontrada' }));
  }
};

module.exports = availableDevices;