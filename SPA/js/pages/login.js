// js/pages/login.js
export function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Store token in localStorage
                localStorage.setItem('authToken', data.token);
                
                // Show success message
                loginMessage.textContent = 'Login successful! Redirecting...';
                loginMessage.className = 'success';

                // Redirect after successful login
                setTimeout(() => {
                    window.location.href = '/';
                }, 1500);
            } else {
                loginMessage.textContent = data.message || 'Login failed. Please try again.';
                loginMessage.className = 'error';
            }
        } catch (error) {
            loginMessage.textContent = 'An error occurred. Please try again.';
            loginMessage.className = 'error';
            console.error('Login error:', error);
        }
    });
}

export function cleanupLoginPage() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.removeEventListener('submit', () => {});
    }
}