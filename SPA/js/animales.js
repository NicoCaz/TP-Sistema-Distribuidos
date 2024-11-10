// Función para obtener las vacas que se ejecutará inmediatamente
async function initializeApp() {
    try {
        const response = await fetch('http://localhost:3000/animales');
        if (!response.ok) {
            throw new Error(`Error en la respuesta de la API: ${response.statusText}`);
        }
        const data = await response.json();
        if (data.vacas && Array.isArray(data.vacas)) {
            console.log('Lista inicial de vacas:', data.vacas);
            displayCows(data.vacas);
        } else {
            console.error('La respuesta no contiene una lista de vacas:', data);
            document.getElementById('cowList').innerHTML = '<li>Error al cargar la lista de vacas</li>';
        }
    } catch (error) {
        console.error('Error al cargar las vacas:', error);
        document.getElementById('cowList').innerHTML = '<li>Error al cargar la lista de vacas</li>';
    }
}

// Ejecutar la función inmediatamente cuando se carga el script
initializeApp();

document.addEventListener('DOMContentLoaded', () => {
    const cowForm = document.getElementById('cowForm');
    const cowList = document.getElementById('cowList');
    const submitBtn = document.getElementById('submitBtn');
    const cancelEditBtn = document.getElementById('cancelEdit');
    let editingTag = null;

    // Al enviar el formulario, agrega o actualiza una vaca
    cowForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const cowName = document.getElementById('cowName').value;
        const cowTag = document.getElementById('cowTag').value;
        
        const newCow = { nombre: cowName, tag: cowTag };
        
        if (editingTag) {
            updateCow(editingTag, newCow);
        } else {
            addCow(newCow);
        }
    });

    // Cancelar edición
    cancelEditBtn.addEventListener('click', () => {
        resetForm();
    });

    // Agregar nueva vaca
    async function addCow(cow) {
        try {
            const response = await fetch('http://localhost:3000/animales', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cow)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message);
            }

            await response.json();
            await fetchCows();
            resetForm();
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        }
    }

    // Actualizar vaca existente
    async function updateCow(originalTag, updatedCow) {
        try {
            const response = await fetch(`http://localhost:3000/animales/${originalTag}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedCow)
            });

            if (!response.ok) {
                throw new Error('Error al actualizar la vaca');
            }

            await response.json();
            await fetchCows();
            resetForm();
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        }
    }

    // Obtener la lista de vacas
    async function fetchCows() {
        try {
            const response = await fetch('http://localhost:3000/animales');
            if (!response.ok) {
                throw new Error(`Error en la respuesta de la API: ${response.statusText}`);
            }
            const data = await response.json();
            if (data.vacas && Array.isArray(data.vacas)) {
                displayCows(data.vacas);
            } else {
                console.error('La respuesta no contiene una lista de vacas:', data);
                cowList.innerHTML = '<li>Error al cargar la lista de vacas</li>';
            }
        } catch (error) {
            console.error('Error en obtener vacas:', error);
            cowList.innerHTML = '<li>Error al cargar la lista de vacas</li>';
        }
    }

    // Mostrar la lista de vacas con botones de editar y eliminar
    function displayCows(cows) {
        cowList.innerHTML = '';
        cows.forEach(cow => {
            const li = document.createElement('li');
            li.textContent = `Nombre: ${cow.nombre}, Tag: ${cow.tag}`;
            
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Eliminar';
            deleteButton.addEventListener('click', () => deleteCow(cow.tag));
            
            const editButton = document.createElement('button');
            editButton.textContent = 'Editar';
            editButton.addEventListener('click', () => startEditing(cow));
            
            li.appendChild(editButton);
            li.appendChild(deleteButton);
            cowList.appendChild(li);
        });
    }

    // Iniciar edición de una vaca
    function startEditing(cow) {
        editingTag = cow.tag;
        document.getElementById('cowName').value = cow.nombre;
        document.getElementById('cowTag').value = cow.tag;
        submitBtn.textContent = 'Actualizar Vaca';
        cancelEditBtn.classList.remove('hidden');
        document.getElementById('cowTag').disabled = true;
    }

    // Resetear el formulario al estado inicial
    function resetForm() {
        editingTag = null;
        cowForm.reset();
        submitBtn.textContent = 'Agregar Vaca';
        cancelEditBtn.classList.add('hidden');
        document.getElementById('cowTag').disabled = false;
    }

    // Eliminar vaca
    async function deleteCow(cowTag) {
        try {
            const response = await fetch(`http://localhost:3000/animales/${cowTag}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error('Error al eliminar la vaca');
            }
            
            await fetchCows();
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar la vaca');
        }
    }
});