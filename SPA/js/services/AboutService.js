export class AboutService {
    constructor() {
        this.BASE_URL = 'https://api.github.com/repos/NicoCaz/TP-Sistema-Distribuidos';
    }

    async getCommitsCount() {
        try {
            const response = await fetch(`${this.BASE_URL}/commits`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const commits = await response.json();
            return Array.isArray(commits) ? commits.length : 0;
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