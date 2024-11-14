import { config } from '../config.js';	


export class AboutService {
    constructor() {
        this.BASE_URL = 'https://api.github.com/repos/NicoCaz/TP-Sistema-Distribuidos';
        //Por si hace falta
        this.ApiURL = config.API_URL;
    }

    async getCommitsCount() {
        try {
            const response = await fetch(`${this.BASE_URL}/commits?per_page=1`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            // Obtener el número de commits a partir del header 'Link'
            const linkHeader = response.headers.get('Link');
            if (linkHeader) {
                const lastPageMatch = linkHeader.match(/&page=(\d+)>; rel="last"/);
                if (lastPageMatch) {
                    return parseInt(lastPageMatch[1], 10);
                }
            }
            
            // Si no hay encabezado Link, asumimos que hay 1 commit
            return 1;
        } catch (error) {
            console.error('Error fetching commits:', error);
            return 0;
        }
    }
    

    async getContributorsCount() {
        try {
            const response = await fetch(`${this.BASE_URL}/contributors`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const contributors = await response.json();
            return Array.isArray(contributors) ? contributors.length : 0;
        } catch (error) {
            console.error('Error fetching contributors:', error);
            return 0;
        }
    }

    async getPullRequestsCount() {
        try {
            const response = await fetch(`${this.BASE_URL}/pulls?state=all`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const prs = await response.json();
            return Array.isArray(prs) ? prs.length : 0;
        } catch (error) {
            console.error('Error fetching pull requests:', error);
            return 0;
        }
    }

    async getBranchesCount() {
        try {
            const response = await fetch(`${this.BASE_URL}/branches`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const branches = await response.json();
            return Array.isArray(branches) ? branches.length : 0;
        } catch (error) {
            console.error('Error fetching branches:', error);
            return 0;
        }
    }

    async getRecentCommits(limit = 5) {
        try {
            const response = await fetch(`${this.BASE_URL}/commits?per_page=${limit}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const commits = await response.json();
            return Array.isArray(commits) ? commits.map(commit => ({
                message: commit.commit.message,
                author: commit.commit.author.name,
                date: new Date(commit.commit.author.date).toLocaleDateString(),
                url: commit.html_url
            })) : [];
        } catch (error) {
            console.error('Error fetching recent commits:', error);
            return [];
        }
    }
}