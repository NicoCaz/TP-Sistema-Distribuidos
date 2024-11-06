const fs = require('fs');
const path = require('path');

const vacasFilePath = path.join(__dirname, '../vacas.json');

function loadvacas() {
    try {
        const data = fs.readFileSync(vacasFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error al leer el archivo vacas.json:', error);
        return [];
    }
}

function savevacas(vacas) {
    try {
        fs.writeFileSync(vacasFilePath, JSON.stringify(vacas, null, 2), 'utf8');
    } catch (error) {
        console.error('Error al guardar en vacas.json:', error);
    }
}

module.exports = {loadvacas,savevacas};