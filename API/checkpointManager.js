const fs = require('fs');
const path = require('path');
const auxFunc = require('./helpers/auxDataValidation.js');

const filePath = path.join(__dirname, 'BBDD', 'checkpoint_data.json');

let checkpointData = {
  packageNum: 0,  //si valido por packagenum no consideraria si se pierden intermedios?
  checkpointID: '',
  totalPackages: 0,
  contPackages: 0,
  animals: []
};
let completedData = null; // Variable para almacenar el sms completo

const updateSMS = (jsonData) => {
  if (auxFunc.valCheckpoint(jsonData.checkpointID)) {//ver si hay mejor lugar
    if (checkpointData.checkpointID === '') {
      checkpointData.checkpointID = jsonData.checkpointID;
      checkpointData.totalPackages = jsonData.totalPackages;
    }

    checkpointData.contPackages += 1;//que pasaria si espera recibir 5 sms y se pierde el 3ro
    checkpointData.animals = checkpointData.animals.concat(jsonData.animals);

    if (checkpointData.contPackages === checkpointData.totalPackages) {
      console.log('Todos los paquetes recibidos:', checkpointData);

      fs.writeFile(filePath, JSON.stringify(checkpointData, null, 2), (err) => {
        if (err) {
          console.error('Error al guardar los datos:', err);
        } else {
          console.log('Datos guardados en', filePath);
        }
      });

      completedData = { ...checkpointData };

      checkpointData = {
        packageNum: 0,
        checkpointID: '',
        totalPackages: 0,
        contPackages: 0,
        animals: []
      };

      return completedData;
    } else {
      console.log('Paquetes recibidos:', checkpointData.contPackages, ', Esperados:', checkpointData.totalPackages);
      return null;
    }
  }
}

const getCheckpointData = () => {//el sms por bloques
  return checkpointData;
}

const getCompletedSMS = () => {//el sms completo
  return completedData; 
}

module.exports = { updateSMS, getCheckpointData, getCompletedSMS};