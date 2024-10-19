const fs = require('fs');
const path = require('path');

document.addEventListener('DOMContentLoaded', () => {
    const cowForm = document.getElementById('cowForm');
    const cowList = document.getElementById('cowList');

    cowForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const cowName = document.getElementById('cowName').value;
        const cowTag = document.getElementById('cowTag').value;

        const newCow = { name: cowName, tag: cowTag };
        addCow(newCow);
    });

    function addCow(cow) {
        const cowsFilePath = path.join(__dirname, 'cows.json');
        fs.readFile(cowsFilePath, (err, data) => {
            if (err) {
                console.error('Error reading cows file:', err);
                return;
            }
            const cows = JSON.parse(data);
            cows.push(cow);
            fs.writeFile(cowsFilePath, JSON.stringify(cows, null, 2), (err) => {
                if (err) {
                    console.error('Error writing cows file:', err);
                    return;
                }
                displayCows(cows);
            });
        });
    }

    function displayCows(cows) {
        cowList.innerHTML = '';
        cows.forEach(cow => {
            const li = document.createElement('li');
            li.textContent = `Nombre: ${cow.name}, Tag: ${cow.tag}`;
            cowList.appendChild(li);
        });
    }

    const cowsFilePath = path.join(__dirname, 'cows.json');
    fs.readFile(cowsFilePath, (err, data) => {
        if (err) {
            console.error('Error reading cows file:', err);
            return;
        }
        const cows = JSON.parse(data);
        displayCows(cows);
    });
});