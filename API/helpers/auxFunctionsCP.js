const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', 'BBDD','checkpoints.json');

const getCheckpoints = () => {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  };
  
const saveCheckpoints = (checkpoints,filePath) => {
    fs.writeFileSync(filePath, JSON.stringify(checkpoints, null, 2));
  };

  const getCheckpointById = (id) => {
    const checkpoints = getCheckpoints();

    const checkpoint = checkpoints.find(checkpoint => checkpoint.id === id);

    if (!checkpoint) {
      console.error(`❌ Checkpoint no encontrado para ID: ${id}`);
      return null;
    }
    
    return checkpoint;
  };

module.exports = {getCheckpoints,saveCheckpoints,getCheckpointById};