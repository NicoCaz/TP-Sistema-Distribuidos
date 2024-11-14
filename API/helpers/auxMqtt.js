const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', 'BBDD','checkpoint_data.json');

const getAnimalsCheckpoints = () => {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  };
  
const saveAnimalsCheckpoints = (checkpoints,filePath) => {
    fs.writeFileSync(filePath, JSON.stringify(checkpoints, null, 2));
  };

  const getAnimalsCheckpointById = (id) => {
    const checkpoints = getCheckpoints();

    const checkpoint = checkpoints.find(checkpoint => checkpoint.id === id);

    if (!checkpoint) {
      console.error(`❌ Checkpoint no encontrado para ID: ${id}`);
      return null;
    }
    
    return checkpoint;
  };

module.exports = {getAnimalsCheckpoints,saveAnimalsCheckpoints,getAnimalsCheckpointById};