export class PointForm {
    constructor(containerId, handleSubmit, handleCancel) {
        this.container = document.getElementById(containerId);
        this.handleSubmit = handleSubmit;
        this.handleCancel = handleCancel;
        this.editingId = null;
        
        this.render();
        this.setupListeners();
    }

    render() {
        this.container.innerHTML = `
            <form id="pointForm" class="point-form">
                <div class="form-group">
                    <label for="pointId">ID (UUID)</label>
                    <input type="text" id="pointId" name="pointId" required 
                           pattern="^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
                           placeholder="Ingrese UUID (ej: 123e4567-e89b-12d3-a456-426614174000)">
                    <small class="form-help">Formato UUID requerido</small>
                </div>
                <div class="form-group">
                    <label for="description">Descripción del Punto</label>
                    <input type="text" id="description" name="description" required 
                           placeholder="Ingrese descripción del punto">
                </div>
                <div class="form-group">
                    <label for="lat">Latitud</label>
                    <input type="number" id="lat" name="lat" step="any" required 
                           placeholder="Ingrese latitud (-90 a 90)">
                </div>
                <div class="form-group">
                    <label for="long">Longitud</label>
                    <input type="number" id="long" name="long" step="any" required 
                           placeholder="Ingrese longitud (-180 a 180)">
                </div>
                <div class="form-buttons">
                    <button type="submit" class="btn-submit">
                        <i class="mdi mdi-content-save"></i>
                        Guardar
                    </button>
                    <button type="button" class="btn-cancel">
                        <i class="mdi mdi-close"></i>
                        Cancelar
                    </button>
                </div>
            </form>
        `;
    }

    setupListeners() {
        const form = this.container.querySelector('#pointForm');
        const cancelButton = this.container.querySelector('.btn-cancel');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Validación del formato UUID
            const uuidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
            if (!uuidPattern.test(form.pointId.value)) {
                alert('Por favor, ingrese un UUID válido');
                return;
            }

            const formData = {
                id: form.pointId.value,
                description: form.description.value,
                lat: parseFloat(form.lat.value),
                long: parseFloat(form.long.value)
            };
            this.handleSubmit(formData, this.editingId);
        });

        cancelButton.addEventListener('click', () => {
            this.handleCancel();
            this.reset();
        });
    }

    startEditing(point) {
        const form = this.container.querySelector('#pointForm');
        form.pointId.value = point.id || '';
        form.description.value = point.description || '';
        form.lat.value = point.lat;
        form.long.value = point.long;
        this.editingId = point.id;

        // Deshabilitar el campo UUID en modo edición
        //form.pointId.disabled = true;

        const submitButton = form.querySelector('.btn-submit');
        submitButton.innerHTML = '<i class="mdi mdi-content-save"></i> Actualizar';
    }

    reset() {
        const form = this.container.querySelector('#pointForm');
        form.reset();
        form.pointId.disabled = false; // Habilitar el campo UUID en modo creación
        this.editingId = null;

        const submitButton = form.querySelector('.btn-submit');
        submitButton.innerHTML = '<i class="mdi mdi-content-save"></i> Guardar';
    }
}