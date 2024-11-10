// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado - Verificando elementos...');
    
    // Lista de IDs requeridos
    const requiredElements = [
        'cowForm',
        'cowList',
        'submitBtn',
        'cancelEdit',
        'refreshDevices',
        'deviceSelect',
        'cowName',
        'description'
    ];

    // Verificar cada elemento e informar cuáles faltan
    const missingElements = requiredElements.filter(id => {
        const element = document.getElementById(id);
        console.log(`Buscando elemento '${id}':`, !!element);
        return !element;
    });

    if (missingElements.length > 0) {
        console.error('Elementos faltantes:', missingElements);
        console.error('Por favor, verifica que estos IDs existan en el HTML');
        return;
    }

    console.log('Todos los elementos necesarios fueron encontrados');

    // Obtener referencias a los elementos
    const cowForm = document.getElementById('cowForm');
    const cowList = document.getElementById('cowList');
    const submitBtn = document.getElementById('submitBtn');
    const cancelEditBtn = document.getElementById('cancelEdit');
    const refreshDevicesBtn = document.getElementById('refreshDevices');
    const deviceSelect = document.getElementById('deviceSelect');
    const cowName = document.getElementById('cowName');
    const description = document.getElementById('description');

    let editingId = null;

    // Función para obtener los animales
    async function fetchAnimals() {
        try {
            console.log('Intentando obtener lista de animales...');
            const response = await fetch('http://localhost:3000/API/animals');
            console.log('Respuesta del servidor:', response);

            if (!response.ok) {
                throw new Error(`Error en la respuesta de la API: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Datos recibidos:', data);

            if (data.data && Array.isArray(data.data.animals)) {
                displayAnimals(data.data.animals);
            } else {
                console.error('Formato de datos inválido:', data);
                cowList.innerHTML = '<li>Error en el formato de datos</li>';
            }
        } catch (error) {
            console.error('Error al obtener animales:', error);
            cowList.innerHTML = `<li>Error: ${error.message}</li>`;
        }
    }

    // Función para mostrar la lista de animales
    function displayAnimals(animals) {
        console.log('Mostrando', animals.length, 'animales');
        cowList.innerHTML = '';
        
        animals.forEach(animal => {
            console.log('Renderizando animal:', animal);
            const li = document.createElement('li');
            
            // Información del animal
            const infoDiv = document.createElement('div');
            infoDiv.className = 'animal-info';
            infoDiv.innerHTML = `
                <strong>Nombre:</strong> ${animal.name}
                <br>
                <strong>ID:</strong> ${animal.id}
                ${animal.description ? `<br><strong>Descripción:</strong> ${animal.description}` : ''}
            `;
            
            // Botones de acción
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'button-group';
            
            const editButton = document.createElement('button');
            editButton.textContent = 'Editar';
            editButton.className = 'edit-btn';
            editButton.onclick = () => startEditing(animal);
            
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Eliminar';
            deleteButton.className = 'delete-btn';
            deleteButton.onclick = () => deleteAnimal(animal.id);
            
            actionsDiv.appendChild(editButton);
            actionsDiv.appendChild(deleteButton);
            
            li.appendChild(infoDiv);
            li.appendChild(actionsDiv);
            cowList.appendChild(li);
        });
    }

    // Función para cargar dispositivos disponibles
    async function loadAvailableDevices() {
        console.log('Cargando dispositivos disponibles...');
        try {
            const response = await fetch('http://localhost:3000/API/availableDevices');
            console.log('Respuesta de dispositivos:', response);

            if (!response.ok) {
                throw new Error('Error al obtener dispositivos');
            }

            const data = await response.json();
            console.log('Dispositivos recibidos:', data);

            deviceSelect.innerHTML = '<option value="">Seleccione un dispositivo</option>';
            
            if (Array.isArray(data.devices)) {
                data.devices.forEach(device => {
                    const option = document.createElement('option');
                    option.value = device;
                    option.textContent = device;
                    deviceSelect.appendChild(option);
                });
                console.log(`${data.devices.length} dispositivos cargados en el select`);
            }
        } catch (error) {
            console.error('Error al cargar dispositivos:', error);
            alert('Error al cargar dispositivos disponibles');
        }
    }

    // Función para agregar un nuevo animal
    async function addAnimal(animal) {
        console.log('Intentando agregar animal:', animal);
        try {
            const response = await fetch('http://localhost:3000/API/animals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(animal)
            });
            console.log('Respuesta del servidor:', response);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al crear animal');
            }

            console.log('Animal agregado exitosamente');
            await fetchAnimals();
            resetForm();
        } catch (error) {
            console.error('Error al crear animal:', error);
            alert(error.message);
        }
    }

    // Función para actualizar un animal existente
    async function updateAnimal(id, updatedAnimal) {
        console.log('Actualizando animal:', { id, updatedAnimal });
        try {
            const response = await fetch(`http://localhost:3000/API/animals/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: updatedAnimal.name,
                    description: updatedAnimal.description
                })
            });
            console.log('Respuesta del servidor:', response);

            if (!response.ok) {
                throw new Error('Error al actualizar el animal');
            }

            console.log('Animal actualizado exitosamente');
            await fetchAnimals();
            resetForm();
        } catch (error) {
            console.error('Error al actualizar:', error);
            alert(error.message);
        }
    }

    // Función para eliminar un animal
    async function deleteAnimal(id) {
        console.log('Intentando eliminar animal:', id);
        if (!confirm('¿Está seguro de que desea eliminar este animal?')) {
            console.log('Eliminación cancelada por el usuario');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/API/animals/${id}`, {
                method: 'DELETE'
            });
            console.log('Respuesta del servidor:', response);

            if (!response.ok) {
                throw new Error('Error al eliminar el animal');
            }

            console.log('Animal eliminado exitosamente');
            await fetchAnimals();
        } catch (error) {
            console.error('Error al eliminar:', error);
            alert('Error al eliminar el animal');
        }
    }

    // Función para iniciar la edición de un animal
    function startEditing(animal) {
        console.log('Iniciando edición del animal:', animal);
        editingId = animal.id;
        cowName.value = animal.name;
        description.value = animal.description || '';
        deviceSelect.value = animal.id;
        deviceSelect.disabled = true;
        submitBtn.textContent = 'Actualizar Animal';
        cancelEditBtn.classList.remove('hidden');
    }

    // Función para resetear el formulario
    function resetForm() {
        console.log('Reseteando formulario');
        editingId = null;
        cowForm.reset();
        deviceSelect.disabled = false;
        submitBtn.textContent = 'Agregar Animal';
        cancelEditBtn.classList.add('hidden');
    }

    // Event Listeners
    cowForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        console.log('Formulario enviado');

        const formData = {
            name: cowName.value,
            id: deviceSelect.value,
            description: description.value
        };
        console.log('Datos del formulario:', formData);

        if (!formData.id) {
            console.warn('No se seleccionó dispositivo');
            alert('Por favor seleccione un dispositivo');
            return;
        }

        if (editingId) {
            await updateAnimal(editingId, formData);
        } else {
            await addAnimal(formData);
        }
    });

    refreshDevicesBtn.addEventListener('click', () => {
        console.log('Actualizando lista de dispositivos...');
        loadAvailableDevices();
    });

    cancelEditBtn.addEventListener('click', () => {
        console.log('Cancelando edición...');
        resetForm();
    });

    // Inicializar la aplicación
    console.log('Inicializando aplicación...');
    fetchAnimals();
    loadAvailableDevices();
});