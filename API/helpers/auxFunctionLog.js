const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'BBDD','admin.json');
const getUsers = () => {
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
};

const checkUserAndPass = (username, password) => {
  const users = getUsers();
  const user = users.find((user) => user.username === username);
  if (!user) throw new Error("401");

  if (user.password !== password) throw new Error("401");
  return user;
};

module.exports = {getUsers, checkUserAndPass };