const fs = require('fs').promises;
const path = require('path');

const instances = new Map();

class JsonDatabase {
    constructor(filename) {
        if (!filename) {
            throw new Error('Filename is required');
        }
        this.filePath = path.join(__dirname, '..', 'data', filename);
        this.locks = new Map();
    }

    static getInstance(filename) {
        if (!instances.has(filename)) {
            instances.set(filename, new JsonDatabase(filename));
        }
        return instances.get(filename);
    }

    async readData() {
        try {
            const data = await fs.readFile(this.filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                await fs.writeFile(this.filePath, '[]', 'utf8');
                return [];
            }
            console.error(`Error reading file ${this.filePath}:`, error);
            return [];
        }
    }

    async writeData(data) {
        try {
            await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error(`Error writing file ${this.filePath}:`, error);
            throw error;
        }
    }
}

module.exports = JsonDatabase;