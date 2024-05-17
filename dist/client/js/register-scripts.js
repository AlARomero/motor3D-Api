document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();
    document.querySelector('#error-same-password-message').style.display = 'none';
    document.querySelector('#error-user-already-exists-message').style.display = 'none';
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        document.querySelector('#error-same-password-message').style.display = 'inline';
        console.error('Las contraseñas no coinciden');
        return;
    }

    const username = document.querySelector('#username').value;
    const email = document.querySelector('#email').value;

    fetch('/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username, email: email, password: password }),
    })
    .then(function(response) {
        if (response.ok){
            // Si el usuario ya está logueado, redirigir a la página que nos indique el servidor
            if(response.redirected)
                window.location.href = response.url
        }
        else if(response.status === 400){
            // Si el usuario no está logueado, mostrar mensaje de error
            document.querySelector('#error-user-already-exists-message').style.display = 'inline';
            console.error('El usuario ya existe');
        }
        else
            throw new Error(response.statusText);
    })
    .catch(function(error) {
        console.log(error);
        alert('Ocurrió un error inesperado');
    });
});