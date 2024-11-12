const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'BBDD','checkpoints.json');

const getCheckpoint = () => {
  const data = fs.readFileSync(filePath, 'utf8');
  const jsonData = JSON.parse(data);
  return jsonData.checkpoints;
};

const valCheckpoint = (checkpointID) => {
  const regCheckpoint = getCheckpoint();
  const check = regCheckpoint.find((check) => check.id === checkpointID);
  if (!check) throw new Error("401");
  return true;
};

module.exports = {getCheckpoint, valCheckpoint };

