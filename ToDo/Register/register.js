document.getElementById('registerForm').addEventListener('submit', handleRegistration);

function handleRegistration(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const email = document.getElementById('email').value;

    const errorMessageDiv = document.getElementById('errorMessage');

    if (password !== confirmPassword) {
        errorMessageDiv.style.display = 'block';
        errorMessageDiv.textContent = 'Passwords do not match!';
        return;
    }

    const userData = {
        userName: name,
        password: password,
        email: email
    };

    fetch('https://localhost:7171/api/Auth', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => {
        if (response.ok && response.headers.get('content-length') !== '0') {
            return response.json();
        } else if (!response.ok) {
            throw new Error('Registration failed');
        }
        return {}; 
    })
    .then(data => {
        console.log('Registration successful:', data);
        window.location.href = '../Login/login.html'; 
    })
    .catch(error => {
        errorMessageDiv.style.display = 'block';
        errorMessageDiv.textContent = 'Registration failed: ' + error.message;
    });
}
