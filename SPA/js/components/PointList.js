export class PointList {
    constructor(containerId, handleEdit, handleDelete) {
        this.container = document.getElementById(containerId);
        this.handleEdit = handleEdit;
        this.handleDelete = handleDelete;
        this.setupHTML();
    }

    setupHTML() {
        this.container.innerHTML = `
            <div class="points-list">
                <div class="list-header">
                    <h2>Lista de Puntos</h2>
                    <div id="pointsError" class="error-message"></div>
                </div>
                <div id="pointsList" class="list-container">
                    <div class="loading">Cargando puntos...</div>
                </div>
            </div>
        `;
    }

    render(points) {
        const listElement = this.container.querySelector('#pointsList');
        if (!points || points.length === 0) {
            listElement.innerHTML = '<div class="no-data">No hay puntos registrados</div>';
            return;
        }

        listElement.innerHTML = points.map(point => `
            <div class="point-item" data-id="${point.id}">
                <div class="point-info">
                    <h3>${point.description || 'Sin descripción'}</h3>
                    <div class="point-id">UUID: ${point.id}</div>
                    <div class="coordinates">
                        <span class="label">Lat:</span> ${point.lat.toFixed(6)}
                        <span class="label">Long:</span> ${point.long.toFixed(6)}
                    </div>
                </div>
                <div class="point-actions">
                    <button class="btn-edit" data-id="${point.id}" title="Editar">
                        <i class="mdi mdi-pencil"></i>
                    </button>
                    <button class="btn-delete" data-id="${point.id}" title="Eliminar">
                        <i class="mdi mdi-delete"></i>
                    </button>
                </div>
            </div>
        `).join('');

        this.setupListeners();
    }

    setupListeners() {
        this.container.querySelectorAll('.btn-edit').forEach(button => {
            button.addEventListener('click', () => {
                const id = button.dataset.id;
                const pointElement = this.container.querySelector(`.point-item[data-id="${id}"]`);
                const description = pointElement.querySelector('h3').textContent;
                const [lat, long] = pointElement.querySelector('.coordinates').textContent
                    .match(/-?\d+\.?\d*/g).map(Number);
                
                this.handleEdit({
                    id,
                    description: description === 'Sin descripción' ? '' : description,
                    lat,
                    long
                });
            });
        });

        this.container.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', () => {
                if (confirm('¿Está seguro de eliminar este punto?')) {
                    this.handleDelete(button.dataset.id);
                }
            });
        });
    }

    showError(message) {
        const errorElement = this.container.querySelector('#pointsError');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        }
    }

    showLoading() {
        const listElement = this.container.querySelector('#pointsList');
        listElement.innerHTML = '<div class="loading">Cargando puntos...</div>';
    }
}