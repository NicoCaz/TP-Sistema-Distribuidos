document.addEventListener('DOMContentLoaded', () => {
    const cowForm = document.getElementById('cowForm');
    const cowList = document.getElementById('cowList');

    // Al enviar el formulario, agrega una nueva vaca
    cowForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const cowName = document.getElementById('cowName').value;
        const cowTag = document.getElementById('cowTag').value;

        const newCow = { nombre: cowName, tag: cowTag };
        addCow(newCow);
    });
    
    // Agregar nueva vaca
    function addCow(cow) {
        fetch('http://localhost:3000/vacas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cow)
        })
        .then(response => response.json())
        .then(() => fetchCows()) // Volver a traer la lista después de agregar
        .catch(error => console.error('Error:', error));
    }

    // Obtener la lista de vacas
    function fetchCows() {
        fetch('http://localhost:3000/vacas')
            .then(response => response.json())
            .then(data => displayCows(data))
            .catch(error => console.error('Error:', error));
    }

    // Mostrar la lista de vacas y agregar botón de eliminar
    function displayCows(cows) {
        cowList.innerHTML = ''; // Limpiar la lista antes de mostrar
        cows.forEach(cow => {
            const li = document.createElement('li');
            li.textContent = `Nombre: ${cow.nombre}, Tag: ${cow.tag}`;

            // Crear botón para eliminar vaca
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Eliminar';
            deleteButton.addEventListener('click', () => deleteCow(cow.tag));

            li.appendChild(deleteButton); // Añadir botón de eliminar a cada vaca
            cowList.appendChild(li);
        });
    }

    // Eliminar vaca
    function deleteCow(cowTag) {
        fetch(`http://localhost:3000/vacas/${cowTag}`, {
            method: 'DELETE'
        })
        .then(() => fetchCows()) // Volver a traer la lista después de eliminar
        .catch(error => console.error('Error:', error));
    }

    // Cargar lista de vacas al cargar la página
    //fetchCows();
});
