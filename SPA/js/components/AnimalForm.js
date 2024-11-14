export class AnimalForm {
    constructor(formId, onSubmit, onCancel) {
        this.form = document.getElementById(formId);
        this.elements = {
            name: document.getElementById('cowName'),
            device: document.getElementById('deviceSelect'),
            description: document.getElementById('description'),
            submitBtn: document.getElementById('submitBtn'),
            cancelBtn: document.getElementById('cancelEdit'),
            refreshBtn: document.getElementById('refreshDevices')
        };
        
        this.onSubmit = onSubmit;
        this.onCancel = onCancel;
        this.editingId = null;
        
        this.setupListeners();
    }

    setupListeners() {
        console.log('Configurando listeners del formulario');
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        this.elements.cancelBtn.addEventListener('click', () => {
            this.reset();
            this.onCancel?.();
        });

        this.elements.refreshBtn.addEventListener('click', () => {
            console.log('Solicitando actualización de dispositivos');
            this.onRefreshDevices?.();
        });
    }

    setDevices(response) {
        console.log('Datos recibidos en setDevices:', response);
        const deviceSelect = this.elements.device;
        
        // Guardar el valor actual antes de limpiar
        const currentValue = deviceSelect.value;
        
        // Limpiar opciones existentes
        deviceSelect.innerHTML = '<option value="">Seleccione un dispositivo</option>';
        
        // Verificar si tenemos el array de devices y tiene elementos
        if (response && response.devices && response.devices.length > 0) {
            console.log(`Procesando ${response.devices.length} dispositivos`);
            
            response.devices.forEach(device => {
                const option = document.createElement('option');
                option.value = device;
                option.textContent = device;
                deviceSelect.appendChild(option);
            });
            
            console.log(`Se agregaron ${response.devices.length} dispositivos al select`);

            // Restaurar el valor seleccionado si existía y está disponible
            if (currentValue && response.devices.includes(currentValue)) {
                deviceSelect.value = currentValue;
            }
        } else {
            console.warn('No hay dispositivos disponibles para agregar');
            const option = document.createElement('option');
            option.value = "";
            option.textContent = "No hay dispositivos disponibles";
            option.disabled = true;
            deviceSelect.appendChild(option);
        }
    }

    startEditing(animal) {
        console.log('Iniciando edición del animal:', animal);
        this.editingId = animal.id;
        this.elements.name.value = animal.name;
        this.elements.description.value = animal.description || '';
        this.elements.device.value = animal.id;
        this.elements.submitBtn.textContent = 'Actualizar Animal';
        this.elements.cancelBtn.classList.remove('hidden');
    }

    handleSubmit() {
        const formData = {
            name: this.elements.name.value,
            id: this.elements.device.value,
            description: this.elements.description.value
        };

        console.log('Datos del formulario a enviar:', formData);

        if (!formData.id) {
            console.warn('No se seleccionó dispositivo');
            alert('Por favor seleccione un dispositivo');
            return;
        }

        this.onSubmit(formData, this.editingId);
    }

    reset() {
        console.log('Reseteando formulario');
        this.editingId = null;
        this.form.reset();
        this.elements.submitBtn.textContent = 'Agregar Animal';
        this.elements.cancelBtn.classList.add('hidden');
    }

    setOnRefreshDevices(callback) {
        console.log('Configurando callback de refresh devices');
        this.onRefreshDevices = callback;
    }
}