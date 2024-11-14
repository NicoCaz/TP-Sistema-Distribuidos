const fs = require('fs');
const path = require('path');
const auxFunc = require('./helpers/auxDataValidation.js');
//const auxFunc = require('./helpers/auxFunctionsCP.js');

const filePath = path.join(__dirname, 'BBDD', 'checkpoint_data.json');

let checkpointData = [{
  packageNum: 0,  
  checkpointID: '',
  totalPackages: 0,
  animals: []
}];
let completedData = []; // Variable para almacenar el sms completo

const updateSMS = (jsonData) => {
 if (auxFunc.valCheckpoint(jsonData.checkpointID)) {//valido que exist
  
    const subID = jsonData.checkpointID;
    let index  = checkpointData.findIndex(checkpoint => checkpoint.checkpointID === subID);
    
    if (index === -1) {
        checkpointData.push({
        packageNum: 1,
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

        // Encuentra el índice del objeto con el subID
        let subIndex = completedData.findIndex(data => data.checkpointID === subID);

        if (subIndex === -1) {
          // Si no existe, agrega un nuevo objeto al array
          completedData.push({ ...checkpointData[index] });
        } else {
          // Si existe, actualiza el objeto existente para no tener redundancia de MAC
          completedData[subIndex] = { ...checkpointData[index] };
        }
          checkpointData[index] = {//ver si borrar no reiniciar
            packageNum: 0,
            checkpointID: subID,
            totalPackages: jsonData.totalPackages,
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



let lotePrueba = [
  {
    packageNum: 1,
    checkpointID: "00:1B:44:11:3A:B7",
    totalPackages: 3,
    contPackages: 3,
    animals: [
      { id: 'a1', type: 'dog', name: 'Buddy' },
      { id: 'a2', type: 'cat', name: 'Whiskers' },
      { id: 'test', type: 'bird', name: 'Tweety' }
    ]
  },
  {
    packageNum: 2,
    checkpointID: "08:A6:F7:A1:8E:80",
    totalPackages: 2,
    contPackages: 2,
    animals: [
      { id: 'a4', type: 'dog', name: 'Max' },
      { id: 'a5', type: 'cat', name: 'Shadow' }
    ]
  },
  {
    packageNum: 3,
    checkpointID: "A8:40:41:1A:2B:C3",
    totalPackages: 1,
    contPackages: 1,
    animals: [
      { id: 'a6', type: 'fish', name: 'Goldie' }
    ]
  }
];
const getCheckpointData = () => {//el sms por bloques
  //return checkpointData;
  return lotePrueba;
}

const getCompletedSMS = () => {//el sms completo
  return lotePrueba; 
}

const getCompletedListDevices = () => {//el sms completo
  //return completedData.flatMap(data => data.animals);
  return lotePrueba.flatMap(data => data.animals);

}

module.exports = { updateSMS, getCheckpointData, getCompletedSMS,getCompletedListDevices};