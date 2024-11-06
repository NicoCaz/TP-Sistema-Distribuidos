const fs = require('fs');


const getCheckpoints = (filePath) => {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  };
  
  const saveCheckpoints = (checkpoints,filePath) => {
    fs.writeFileSync(filePath, JSON.stringify(checkpoints, null, 2));
  };

module.exports = {getCheckpoints,saveCheckpoints};