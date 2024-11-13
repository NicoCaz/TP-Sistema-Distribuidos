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

    render(positions) {
        const listElement = this.container.querySelector('#positionsList');
        if (!positions || positions.length === 0) {
            listElement.innerHTML = '<div class="no-data">No hay posiciones registradas</div>';
            return;
        }

        listElement.innerHTML = positions.map(position => `
            <div class="position-item">
                <div class="position-header">
                    <div class="position-id">${position.id}</div>
                    <div class="position-description">${position.description || 'Sin descripción'}</div>
                </div>
                <div class="position-coordinates">
                    <span class="label">Lat:</span> ${position.lat.toFixed(6)}
                    <span class="label">Long:</span> ${position.long.toFixed(6)}
                </div>
                <div class="animals-summary">
                    <h4>Animales en la posición: ${position.animals.length}</h4>
                    ${this.renderAnimalsList(position.animals)}
                </div>
            </div>
        `).join('');
    }

    renderAnimalsList(animals) {
        if (!animals || animals.length === 0) {
            return '<div class="no-animals">No hay animales en esta posición</div>';
        }

        return `
            <div class="animals-list">
                ${this.generateAnimalsSummary(animals)}
                <table class="animals-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tipo</th>
                            <th>Estado</th>
                            <th>Última actualización</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${animals.map(animal => `
                            <tr>
                                <td>${animal.id}</td>
                                <td>${animal.type}</td>
                                <td>
                                    <span class="status-badge ${animal.status.toLowerCase()}">
                                        ${animal.status}
                                    </span>
                                </td>
                                <td>${new Date(animal.lastUpdate).toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    generateAnimalsSummary(animals) {
        const summary = animals.reduce((acc, animal) => {
            acc[animal.type] = (acc[animal.type] || 0) + 1;
            return acc;
        }, {});

        return `
            <div class="animals-summary-stats">
                ${Object.entries(summary).map(([type, count]) => `
                    <div class="summary-stat">
                        <span class="stat-label">${type}:</span>
                        <span class="stat-value">${count}</span>
                    </div>
                `).join('')}
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