

// Event listener para el formulario de login
document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault();
    document.querySelector('#error-message').style.display = 'none';

    const username = document.querySelector('#username').value;
    const password = document.querySelector('#password').value;

    fetch('/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username, password: password }),
    })
    .then(function(response) {
        if (response.ok){
            // Si el usuario ya está logueado, redirigir a la página que nos indique el servidor
            if(response.redirected)
                window.location.href = response.url
        }
        else if(response.status === 401){
            // Si el usuario no está logueado, mostrar mensaje de error
            document.querySelector('#error-message').style.display = 'inline';
        }
        else
            throw new Error(response.statusText);
    })
    .catch(function(error) {
        console.log(error);
        alert('Ocurrió un error inesperado');
    });
});