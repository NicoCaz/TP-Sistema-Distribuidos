export class AnimalList {
    constructor(listId, onEdit, onDelete) {
        this.list = document.getElementById(listId);
        this.onEdit = onEdit;
        this.onDelete = onDelete;
    }

    render(animals) {
        this.list.innerHTML = '';
        
        animals.forEach(animal => {
            const li = document.createElement('li');
            
            const infoDiv = document.createElement('div');
            infoDiv.className = 'animal-info';
            infoDiv.innerHTML = `
                <strong>Nombre:</strong> ${animal.name}
                <br>
                <strong>ID:</strong> ${animal.id}
                ${animal.description ? `<br><strong>Descripción:</strong> ${animal.description}` : ''}
            `;
            
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'button-group';
            
            const editButton = document.createElement('button');
            editButton.textContent = 'Editar';
            editButton.className = 'edit-btn';
            editButton.onclick = () => this.onEdit?.(animal);
            
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Eliminar';
            deleteButton.className = 'delete-btn';
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
        this.list.innerHTML = `<li>Error: ${message}</li>`;
    }

    showLoading() {
        this.list.innerHTML = '<li>Cargando animales...</li>';
    }
}