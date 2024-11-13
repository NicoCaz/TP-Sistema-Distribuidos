const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', 'BBDD','checkpoints.json');

const getCheckpoints = (filePath) => {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  };
  
const saveCheckpoints = (checkpoints,filePath) => {
    fs.writeFileSync(filePath, JSON.stringify(checkpoints, null, 2));
  };


module.exports = {getCheckpoints,saveCheckpoints};