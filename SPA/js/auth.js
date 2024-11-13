export function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/login';
        return false;
    }
    return true;
}

export function logout() {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
}