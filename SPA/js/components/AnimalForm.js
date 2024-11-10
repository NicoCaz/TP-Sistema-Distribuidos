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
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        this.elements.cancelBtn.addEventListener('click', () => {
            this.reset();
            this.onCancel?.();
        });

        this.elements.refreshBtn.addEventListener('click', () => {
            this.onRefreshDevices?.();
        });
    }

    async handleSubmit() {
        const formData = {
            name: this.elements.name.value,
            id: this.elements.device.value,
            description: this.elements.description.value
        };

        if (!formData.id) {
            alert('Por favor seleccione un dispositivo');
            return;
        }

        await this.onSubmit(formData, this.editingId);
    }

    setDevices(devices) {
        this.elements.device.innerHTML = '<option value="">Seleccione un dispositivo</option>';
        devices.forEach(device => {
            const option = document.createElement('option');
            option.value = device;
            option.textContent = device;
            this.elements.device.appendChild(option);
        });
    }

    startEditing(animal) {
        this.editingId = animal.id;
        this.elements.name.value = animal.name;
        this.elements.description.value = animal.description || '';
        this.elements.device.value = animal.id;
        this.elements.device.disabled = true;
        this.elements.submitBtn.textContent = 'Actualizar Animal';
        this.elements.cancelBtn.classList.remove('hidden');
    }

    reset() {
        this.editingId = null;
        this.form.reset();
        this.elements.device.disabled = false;
        this.elements.submitBtn.textContent = 'Agregar Animal';
        this.elements.cancelBtn.classList.add('hidden');
    }

    setOnRefreshDevices(callback) {
        this.onRefreshDevices = callback;
    }
}