const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'BBDD','checkpoints.json');

const getCheckpoint = () => {
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
};

const valCheckpoint = (checkpointID) => {
 // const regCheckpoint = getCheckpoint();
  //const check = regCheckpoint.find((check) => check.checkpointID === checkpointID);
 // if (!check) throw new Error("401");
  return true;
};

module.exports = {getCheckpoint, valCheckpoint };

