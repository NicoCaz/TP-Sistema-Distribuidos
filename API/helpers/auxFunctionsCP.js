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

  const getCheckpointById = (id) => {
    const checkpoints = getCheckpoints(filePath);
    return checkpoints.find(checkpoint => checkpoint.checkpointID === id);
  };

module.exports = {getCheckpoints,saveCheckpoints,getCheckpointById};