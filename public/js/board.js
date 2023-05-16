document.addEventListener('DOMContentLoaded', function () {
    const spinner = document.getElementById("spinner");
    const aceptar = document.getElementById("board-button");
    const abortController = new AbortController();
    const { signal } = abortController;

    let remainingTime = 30; // Tiempo en segundos
    const countdownElement = document.getElementById('countdown');

    const countdownId = setInterval(() => {
        countdownElement.textContent = `Buscando placa: ${remainingTime} segundos`;
        remainingTime--;

        if (remainingTime < 0) {
            clearInterval(countdownId);
            abortController.abort();
            console.log('Búsqueda abortada después de 1 minuto');
        }
    }, 1000); // 1 segundo = 1000 milisegundos

    fetch('/get_boards', { signal })
        .then(response => response.json())
        .then(data => {
            clearInterval(countdownId); // Detener el contador si la búsqueda se completa antes de 1 minuto
            countdownElement.textContent = ''; // Ocultar el contador
            spinner.setAttribute('hidden', '');
            const boards = data;
            let options = '';
            if (boards.length) {
                for (let i = 0; i < boards.length; i++) {
                    options += `<option value="${boards[i].id}" ${boards[i].taken === "si" ? 'disabled' : ''}>${boards[i].id} ${boards[i].taken === "si" ? '- Placa en uso' : '- Disponbile'}</option>`;
                }
            }
            const selectElement = document.querySelector('select[id="board-select"]');
            selectElement.innerHTML = options;
            // Recargar la página después de un cierto tiempo
            setTimeout(function () {
                location.reload();
            }, 20000);
        })
        .catch(error => {
            if (error.name === 'AbortError') {
                window.alert("La búsqueda ha excedido el tiempo");
                spinner.setAttribute('hidden', '');
                aceptar.setAttribute('disabled', '');
                // Recargar la página después de un cierto tiempo
                setTimeout(function () {
                    location.reload();
                }, 20000);
            } else {
                console.error('Error en la búsqueda:', error);
            }
        });
});
