export class AnimalPositionList {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.setupHTML();
        this.setupStyles();
    }

    setupStyles() {
        const styles = `
            <style>
                .animal-positions-list {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    max-width: 1200px;
                    margin: 20px auto;
                    padding: 20px;
                }

                .list-header {
                    margin-bottom: 20px;
                }

                .list-header h2 {
                    color: #2c3e50;
                    font-size: 24px;
                    margin: 0 0 10px 0;
                }

                .error-message {
                    background-color: #ff6b6b;
                    color: white;
                    padding: 10px;
                    border-radius: 4px;
                    display: none;
                }

                .position-item {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    margin-bottom: 20px;
                    padding: 20px;
                    transition: transform 0.2s;
                }

                .position-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
                }

                .position-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #e1e8ed;
                }

                .position-id {
                    font-weight: bold;
                    color: #2c3e50;
                }

                .position-description {
                    color: #34495e;
                }

                .position-coordinates {
                    background: #f8f9fa;
                    padding: 10px;
                    border-radius: 4px;
                    margin-bottom: 15px;
                    font-family: monospace;
                }

                .position-coordinates .label {
                    color: #6c757d;
                    margin-right: 5px;
                }

                .animals-summary h4 {
                    color: #2c3e50;
                    margin: 0 0 15px 0;
                }

                .animals-summary-stats {
                    display: flex;
                    gap: 15px;
                    flex-wrap: wrap;
                    margin-bottom: 15px;
                    background: #f8f9fa;
                    padding: 10px;
                    border-radius: 4px;
                }

                .summary-stat {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .stat-label {
                    color: #6c757d;
                    font-weight: 500;
                }

                .stat-value {
                    font-weight: bold;
                    color: #2c3e50;
                }

                .animals-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                }

                .animals-table th {
                    background: #f1f3f5;
                    padding: 12px;
                    text-align: left;
                    color: #495057;
                    font-weight: 600;
                }

                .animals-table td {
                    padding: 12px;
                    border-bottom: 1px solid #e9ecef;
                }

                .animals-table tr:hover {
                    background: #f8f9fa;
                }

                .status-badge {
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 0.85em;
                    font-weight: 500;
                }

                .animal-icon {
                    width: 24px;
                    height: 24px;
                    margin-right: 8px;
                    vertical-align: middle;
                }

                .loading {
                    text-align: center;
                    padding: 20px;
                    color: #6c757d;
                }

                .no-data, .no-animals {
                    text-align: center;
                    padding: 20px;
                    color: #6c757d;
                    background: #f8f9fa;
                    border-radius: 4px;
                }
            </style>
        `;
        this.container.insertAdjacentHTML('beforeend', styles);
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
        const icons = {
            dog: '🐕',
            cat: '🐱',
            bird: '🐦'
        };
        return icons[type.toLowerCase()] || '🐾';
    }

    render(data) {
        const listElement = this.container.querySelector('#positionsList');
        
        // Extraer el array de posiciones de la estructura de datos
        const positions = data?.dataPosition || [];

        if (!positions || positions.length === 0) {
            listElement.innerHTML = '<div class="no-data">No hay posiciones registradas</div>';
            return;
        }

        listElement.innerHTML = positions.map((position, index) => {
            if (!position) return '';

            return `
                <div class="position-item">
                    <div class="position-header">
                        <div class="position-id">${position.idCP || 'ID No disponible'}</div>
                        <div class="position-description">${position.descriptionCP || 'Sin descripción'}</div>
                    </div>
                    <div class="position-coordinates">
                        <span class="label">Lat:</span> ${this.safeNumberFormat(position.lat)}
                        <span class="label">Long:</span> ${this.safeNumberFormat(position.long)}
                    </div>
                    <div class="animals-summary">
                        <h4>Animales en la posición: ${(position.animals || []).length}</h4>
                        ${this.renderAnimalsList(position.animals || [])}
                    </div>
                </div>
            `;
        }).join('');
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
                            <th>Animal</th>
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
                                        <span class="animal-icon">${this.getAnimalIcon(animal.type)}</span>
                                        ${animal.type || 'N/A'}
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

        const summary = animals.reduce((acc, animal) => {
            if (animal && animal.type) {
                acc[animal.type] = (acc[animal.type] || 0) + 1;
            }
            return acc;
        }, {});

        return `
            <div class="animals-summary-stats">
                ${Object.entries(summary).map(([type, count]) => `
                    <div class="summary-stat">
                        <span class="animal-icon">${this.getAnimalIcon(type)}</span>
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