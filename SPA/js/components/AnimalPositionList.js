export class AnimalPositionList {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.setupHTML();
    }

    setupHTML() {
        this.container.innerHTML = `
            <div class="animal-positions-list">
                <div class="list-header">
                    <h2>Lista de Posiciones y Animales</h2>
                    <div id="positionsError" class="error-message"></div>
                </div>
                <div id="positionsList" class="list-container">
                    <div class="loading">Cargando posiciones...</div>
                </div>
            </div>
        `;
    }

    safeNumberFormat(number, decimals = 6) {
        if (number === undefined || number === null || isNaN(number)) {
            return 'N/A';
        }
        return Number(number).toFixed(decimals);
    }

    getAnimalIcon(type) {
        return '🐄';
    }

    render(data) {
        const listElement = this.container.querySelector('#positionsList');
        
        // Ahora trabajamos directamente con el array de posiciones
        const positions = Array.isArray(data) ? data : [];

        if (!positions || positions.length === 0) {
            listElement.innerHTML = '<div class="no-data">No hay posiciones registradas</div>';
            return;
        }

        listElement.innerHTML = positions.map((position, index) => {
            if (!position) return '';

            return `
                <div class="position-item">
                    <div class="position-header">
                        <div class="position-id">${position.id || 'ID No disponible'}</div>
                        <div class="position-description">${position.description || 'Sin descripción'}</div>
                    </div>
                    <div class="position-coordinates">
                        <span class="label">Lat:</span> ${this.safeNumberFormat(position.lat)}
                        <span class="label">Long:</span> ${this.safeNumberFormat(position.long)}
                    </div>
                    <div class="animals-summary">
                        <h4>Vacas en la posición: ${(position.animals || []).length}</h4>
                        ${this.renderAnimalsList(position.animals || [])}
                    </div>
                </div>
            `;
        }).join('');
    }

    renderAnimalsList(animals) {
        if (!animals || animals.length === 0) {
            return '<div class="no-animals">No hay vacas en esta posición</div>';
        }

        return `
            <div class="animals-list">
                ${this.generateAnimalsSummary(animals)}
                <table class="animals-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Vaca</th>
                            <th>Nombre</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${animals.map(animal => {
                            if (!animal) return '';
                            
                            return `
                                <tr>
                                    <td>${animal.id || 'N/A'}</td>
                                    <td>
                                        <span class="animal-icon">${this.getAnimalIcon()}</span>
                                        Vaca
                                    </td>
                                    <td>${animal.name || 'Sin nombre'}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    generateAnimalsSummary(animals) {
        if (!Array.isArray(animals)) return '';

        return `
            <div class="animals-summary-stats">
                <div class="summary-stat">
                    <span class="animal-icon">${this.getAnimalIcon()}</span>
                    <span class="stat-label">Vacas:</span>
                    <span class="stat-value">${animals.length}</span>
                </div>
            </div>
        `;
    }

    showError(message) {
        const errorElement = this.container.querySelector('#positionsError');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        }
    }

    showLoading() {
        const listElement = this.container.querySelector('#positionsList');
        listElement.innerHTML = '<div class="loading">Cargando posiciones...</div>';
    }
}