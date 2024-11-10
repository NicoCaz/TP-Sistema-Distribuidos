export class CommitsList {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container with id ${containerId} not found`);
            return;
        }
        this.setupHTML();
    }

    setupHTML() {
        this.container.innerHTML = `
            <div class="recent-commits">
                <h2>Commits Recientes</h2>
                <div id="recent-commits-list"></div>
            </div>
        `;
    }

    render(commits) {
        const listElement = document.getElementById('recent-commits-list');
        if (!listElement) return;

        if (!commits || commits.length === 0) {
            listElement.innerHTML = '<div class="commit-item">No hay commits recientes</div>';
            return;
        }

        listElement.innerHTML = commits.map(commit => `
            <div class="commit-item">
                <a href="${commit.url}" target="_blank" class="commit-message">${commit.message}</a>
                <div class="commit-details">
                    <span class="commit-author">${commit.author}</span>
                    <span class="commit-date">${commit.date}</span>
                </div>
            </div>
        `).join('');
    }

    showLoading() {
        const listElement = document.getElementById('recent-commits-list');
        if (listElement) {
            listElement.innerHTML = '<div class="commit-item">Cargando commits...</div>';
        }
    }

    showError(message) {
        const listElement = document.getElementById('recent-commits-list');
        if (listElement) {
            listElement.innerHTML = `<div class="commit-item error">Error: ${message}</div>`;
        }
    }
}