export class PointForm {
    constructor(formId, onSubmit, onCancel) {
        this.form = document.getElementById(formId);
        this.elements = {
            id: document.getElementById('pointId'),
            description: document.getElementById('description'),
            lat: document.getElementById('lat'),
            long: document.getElementById('long'),
            submitBtn: document.getElementById('submitBtn'),
            cancelBtn: document.getElementById('cancelEdit')
        };
        
        this.onSubmit = onSubmit;
        this.onCancel = onCancel;
        this.editingId = null;
        
        this.setupListeners();
    }

    setupListeners() {
        console.log('Configurando listeners del formulario de puntos');
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        this.elements.cancelBtn.addEventListener('click', () => {
            this.reset();
            this.onCancel?.();
        });
    }

    handleSubmit() {
        const formData = {
            id: this.elements.id.value,
            description: this.elements.description.value,
            lat: parseFloat(this.elements.lat.value),
            long: parseFloat(this.elements.long.value)
        };

        console.log('Datos del formulario a enviar:', formData);
        this.onSubmit(formData, this.editingId);
    }

    startEditing(point) {
        console.log('Iniciando edición del punto:', point);
        this.editingId = point.id;
        this.elements.id.value = point.id || '';
        this.elements.description.value = point.description || '';
        this.elements.lat.value = point.lat;
        this.elements.long.value = point.long;
        
        this.elements.submitBtn.textContent = 'Actualizar Punto';
        this.elements.cancelBtn.classList.remove('hidden');
    }

    reset() {
        console.log('Reseteando formulario de puntos');
        this.editingId = null;
        this.form.reset();
        this.elements.submitBtn.textContent = 'Agregar Punto';
        this.elements.cancelBtn.classList.add('hidden');
    }
}