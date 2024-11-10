export class StatsDisplay {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container with id ${containerId} not found`);
            return;
        }
        this.render();
    }

    render() {
        const statsHTML = `
            <div class="stats-card">
                <i class="mdi mdi-source-repository"></i>
                <div class="stats-number" id="commits-count">-</div>
                <div class="stats-label">Total Commits</div>
            </div>
            <div class="stats-card">
                <i class="mdi mdi-account-group"></i>
                <div class="stats-number" id="contributors-count">-</div>
                <div class="stats-label">Contribuidores</div>
            </div>
            <div class="stats-card">
                <i class="mdi mdi-source-pull"></i>
                <div class="stats-number" id="pr-count">-</div>
                <div class="stats-label">Pull Requests</div>
            </div>
            <div class="stats-card">
                <i class="mdi mdi-source-branch"></i>
                <div class="stats-number" id="branches-count">-</div>
                <div class="stats-label">Branches</div>
            </div>
        `;
        
        this.container.innerHTML = statsHTML;
    }

    updateStats(stats) {
        console.log('Actualizando estadísticas:', stats);
        Object.entries(stats).forEach(([key, value]) => {
            const element = document.getElementById(`${key}-count`);
            if (element) {
                element.textContent = this.formatNumber(value);
            } else {
                console.error(`Element ${key}-count not found`);
            }
        });
    }

    formatNumber(num) {
        if (num === null || num === undefined) return '0';
        return num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num.toString();
    }

    showError(message) {
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }
}