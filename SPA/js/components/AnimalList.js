export class AnimalList {
    constructor(listId, onEdit, onDelete) {
        this.list = document.getElementById(listId);
        this.onEdit = onEdit;
        this.onDelete = onDelete;
    }

    render(animals) {
        this.list.innerHTML = '';
        
        if (animals.length === 0) {
            const li = document.createElement('li');
            li.className = 'empty-state animate-fade-in';
            li.innerHTML = `
                <div class="animal-info">
                    <i class="mdi mdi-information-outline"></i>
                    <p>No hay animales registrados</p>
                </div>
            `;
            this.list.appendChild(li);
            return;
        }
        
        animals.forEach(animal => {
            const li = document.createElement('li');
            li.className = 'animal-card animate-fade-in';
            
            const infoDiv = document.createElement('div');
            infoDiv.className = 'animal-info';
            infoDiv.innerHTML = `
                <div class="info-row">
                    <i class="mdi mdi-cow"></i>
                    <strong>Nombre:</strong> 
                    <span>${animal.name}</span>
                </div>
                <div class="info-row">
                    <i class="mdi mdi-identifier"></i>
                    <strong>ID:</strong> 
                    <span>${animal.id}</span>
                </div>
                ${animal.description ? `
                    <div class="info-row">
                        <i class="mdi mdi-text-box-outline"></i>
                        <strong>Descripción:</strong> 
                        <span>${animal.description}</span>
                    </div>
                ` : ''}
            `;
            
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'button-group';
            
            const editButton = document.createElement('button');
            editButton.innerHTML = '<i class="mdi mdi-pencil"></i> Editar';
            editButton.className = 'btn-primary';
            editButton.onclick = () => this.onEdit?.(animal);
            
            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="mdi mdi-delete"></i> Eliminar';
            deleteButton.className = 'btn-danger';
            deleteButton.onclick = () => this.handleDelete(animal.id);
            
            actionsDiv.appendChild(editButton);
            actionsDiv.appendChild(deleteButton);
            
            li.appendChild(infoDiv);
            li.appendChild(actionsDiv);
            this.list.appendChild(li);
        });
    }

    async handleDelete(id) {
        if (confirm('¿Está seguro de que desea eliminar este animal?')) {
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
                <span>Cargando animales...</span>
            </li>
        `;
    }
}