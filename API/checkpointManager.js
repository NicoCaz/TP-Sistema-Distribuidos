const fs = require('fs');
const path = require('path');
const auxFunc = require('./helpers/auxDataValidation.js');
//const auxFunc = require('./helpers/auxFunctionsCP.js');

const filePath = path.join(__dirname, 'BBDD', 'checkpoint_data.json');
 
let checkpointData = [{
  packageNum: 0,  //si valido por packagenum no consideraria si se pierden intermedios?
  checkpointID: '',
  totalPackages: 0,
  contPackages: 0,
  animals: []
}];
let completedData = null; // Variable para almacenar el sms completo

const updateSMS = (jsonData) => {//agregar la validacion*******
 if (auxFunc.valCheckpoint(jsonData.checkpointID)) {//valido que exist
  
    const subID = jsonData.checkpointID;
    let index  = checkpointData.findIndex(checkpoint => checkpoint.checkpointID === subID);
    
    if (index === -1) {
        checkpointData.push({
        packageNum: 0,
        checkpointID: subID,
        totalPackages: jsonData.totalPackages,
        contPackages: 1,
        animals: jsonData.animals
      });
    }//si no existe el checkpoint

    else{//cuando existe
      

        checkpointData[index].contPackages += 1;//que pasaria si espera recibir 5 sms y se pierde el 3ro
        checkpointData[index].animals = checkpointData[index].animals.concat(jsonData.animals);

        if (checkpointData[index].contPackages === checkpointData[index].totalPackages) {
          console.log('Todos los paquetes recibidos:', checkpointData[index]);

          fs.writeFile(filePath, JSON.stringify(checkpointData, null, 2), (err) => {
            if (err) {
              console.error('Error al guardar los datos:', err);
            } else {
              console.log('Datos guardados en', filePath);
            }
          });

          completedData = { ...checkpointData[index] };

          checkpointData[index] = {
            packageNum: 0,
            checkpointID: '',
            totalPackages: 0,
            contPackages: 0,
            animals: []
          };

          return completedData;
        } else {
          console.log('Paquetes recibidos:', checkpointData[index].contPackages, ', Esperados:', checkpointData[index].totalPackages, ', Punto:', checkpointData[index].checkpointID);
          return null;
        }
      }
  } 
};

const getCheckpointData = () => {//el sms por bloques
  return checkpointData;
}

const getCompletedSMS = () => {//el sms completo
  return completedData; 
}

const getCompletedListDevices = () => {//el sms completo
  return checkpointData.flatMap(data => data.animals);
}

module.exports = { updateSMS, getCheckpointData, getCompletedSMS,getCompletedListDevices};