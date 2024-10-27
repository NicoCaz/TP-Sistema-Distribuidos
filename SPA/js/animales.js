document.addEventListener('DOMContentLoaded', () => {
    const cowForm = document.getElementById('cowForm');
    const cowList = document.getElementById('cowList');

    // Al enviar el formulario, agrega una nueva vaca
    cowForm.addEventListener('submit', (event) => {
        event.preventDefault();
        console.log("Formulario enviado"); // Verifica que esto se imprime
        const cowName = document.getElementById('cowName').value;
        const cowTag = document.getElementById('cowTag').value;
    
        const newCow = { nombre: cowName, tag: cowTag };
        addCow(newCow);
    });
    
    // Agregar nueva vaca
    function addCow(cow) {
        console.log("Nueva vaca a agregar:", cow);
        fetch('http://localhost:3000/vacas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cow)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(errorData.message); // Maneja el error aquí
                });
            }
            return response.json();
        })
        .then(() => fetchCows()) 
        .catch(error => {
            console.error('Error:', error);
            alert(error.message); 
        });
    }
    // Obtener la lista de vacas
    function fetchCows() {
        fetch('http://localhost:3000/vacas')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error en la respuesta de la API: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                
                if (data.vacas && Array.isArray(data.vacas)) {
                    console.log('Lista de vacas:', data.vacas);
                    displayCows(data.vacas); 
                } else {
                    console.error('La respuesta no contiene una lista de vacas:', data);
                    cowList.innerHTML = '<li>Error al cargar la lista de vacas</li>';
                }
            })
            .catch(error => console.error('Error en obtener vacas:', error));
    }

    // Mostrar la lista de vacas y agregar botón de eliminar
    function displayCows(cows) {
        
        cowList.innerHTML = ''; 
        cows.forEach(cow => {
            const li = document.createElement('li');
            li.textContent = `Nombre: ${cow.nombre}, Tag: ${cow.tag}`;
    
            
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

    
    fetchCows();
});
