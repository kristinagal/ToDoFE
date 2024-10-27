document.getElementById('loginForm').addEventListener('submit', handleLogin);

function handleLogin(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const password = document.getElementById('password').value;

    fetch(`https://localhost:7171/api/Auth?userName=${name}&password=${password}`, {
        method: 'GET'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Login failed');
        }
        return response.json();
    })
    .then(data => {
        localStorage.setItem('user', JSON.stringify(data));
        window.location.href = '../ToDo/todo.html';
    })
    .catch(error => {
        const errorMessageDiv = document.getElementById('errorMessage');
        errorMessageDiv.style.display = 'block';
        errorMessageDiv.textContent = error.message;
    });
}
