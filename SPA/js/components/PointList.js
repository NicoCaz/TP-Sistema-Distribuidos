export class PointList {
    constructor(containerId, handleEdit, handleDelete) {
        this.list = document.getElementById(containerId);
        this.onEdit = handleEdit;
        this.onDelete = handleDelete;
    }

    render(points) {
        this.list.innerHTML = '';
        
        if (!points || points.length === 0) {
            const li = document.createElement('li');
            li.className = 'empty-state animate-fade-in';
            li.innerHTML = `
                <div class="animal-info">
                    <i class="mdi mdi-information-outline"></i>
                    <p>No hay puntos registrados</p>
                </div>
            `;
            this.list.appendChild(li);
            return;
        }
        
        points.forEach(point => {
            const li = document.createElement('li');
            li.className = 'animal-card animate-fade-in';
            
            const infoDiv = document.createElement('div');
            infoDiv.className = 'animal-info';
            infoDiv.innerHTML = `
                <div class="info-row">
                    <i class="mdi mdi-map-marker"></i>
                    <strong>ID:</strong> 
                    <span>${point.id}</span>
                </div>
                <div class="info-row">
                    <i class="mdi mdi-map"></i>
                    <strong>Descripción:</strong> 
                    <span>${point.description || 'Sin descripción'}</span>
                </div>
                <div class="info-row">
                    <i class="mdi mdi-crosshairs-gps"></i>
                    <strong>Coordenadas:</strong> 
                    <span>Lat: ${point.lat.toFixed(6)}, Long: ${point.long.toFixed(6)}</span>
                </div>
            `;
            
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'button-group';
            
            const editButton = document.createElement('button');
            editButton.innerHTML = '<i class="mdi mdi-pencil"></i> Editar';
            editButton.className = 'btn-primary';
            editButton.onclick = () => this.onEdit?.(point);
            
            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="mdi mdi-delete"></i> Eliminar';
            deleteButton.className = 'btn-danger';
            deleteButton.onclick = () => this.handleDelete(point.id);
            
            actionsDiv.appendChild(editButton);
            actionsDiv.appendChild(deleteButton);
            
            li.appendChild(infoDiv);
            li.appendChild(actionsDiv);
            this.list.appendChild(li);
        });
    }

    async handleDelete(id) {
        if (confirm('¿Está seguro de que desea eliminar este punto?')) {
            await this.onDelete?.(id);
        }
    }

    showError(message) {
        this.list.innerHTML = `
            <li class="error-message">
                <i class="mdi mdi-alert"></i>
                <span>Error: ${message}</span>
            </li>
        `;
    }

    showLoading() {
        this.list.innerHTML = `
            <li class="loading-state">
                <i class="mdi mdi-loading mdi-spin"></i>
                <span>Cargando puntos...</span>
            </li>
        `;
    }
}