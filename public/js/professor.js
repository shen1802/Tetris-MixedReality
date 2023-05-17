$(document).ready(function () {
    let selected_row_user = '';
    let selected_row_group = '';

    let userTable = $('#user').DataTable({
        order: [[0, 'asc']],
        lengthMenu: [
            [5, 10, 25, -1],
            [5, 10, 25, 'All'],
        ],
        "searching": false
    });

    $('#user tbody').on('click', 'tr', function () {
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
        } else {
            userTable.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        }
        selected_row_user = $(this).find('td:eq(0)').text().trim();
    });

    $('#user_delete_button').click(function () {
        // Obtener la fila X de userTable
        const selectedRow = userTable.row(selected_row_user - 1).node();
        // Buscar los elementos <input> y <select> solo dentro de la fila seleccionada
        const inputsAndSelects = $(selectedRow).find('input, select');
        // Serializa los valores de los elementos seleccionados
        const data_aux = inputsAndSelects.serialize();
        const data = data_aux + "&admin=false";
        // Send POST request to server
        $.ajax({
            url: '/delete_user',
            method: 'POST',
            data: { data: data },
            success: function (response) {
                // Handle successful response from server
                window.location.reload();
            },
            error: function (xhr, status, error) {
                // Handle error from server
                alert(xhr.responseText);
            }
        });
    });

    $('#user_update_button').click(function () {
        // Obtener la fila X de userTable
        const selectedRow = userTable.row(selected_row_user - 1).node();
        // Buscar los elementos <input> y <select> solo dentro de la fila seleccionada
        const inputsAndSelects = $(selectedRow).find('input, select');
        // Serializa los valores de los elementos seleccionados
        const data = inputsAndSelects.serialize();
        // Send POST request to server
        $.ajax({
            url: '/update_user',
            method: 'POST',
            data: { data: data },
            success: function (response) {
                // Handle successful response from server
                window.location.reload();
            },
            error: function (xhr, status, error) {
                // Handle error from server
                alert(xhr.responseText);
            }
        });
    });

    $('#add_user').submit(function (event) {
        // Evitar envío convencional del formulario
        event.preventDefault();
        // Obtener los datos del formulario
        const formData = $(this).serialize();
        // Realizar la solicitud Ajax
        $.ajax({
            type: 'POST',
            url: '/new',
            data: { data: formData },
            success: function (response) {
                // Manejar la respuesta del servidor
                window.location.reload();
            },
            error: function (xhr, status, error) {
                // Manejar errores de la solicitud
                alert(xhr.responseText);
            }
        });
    });

    //Group Board Info (CRUD)
    let groupTable = $('#group').DataTable({
        order: [[0, 'asc']],
        lengthMenu: [
            [5, 10, 25, -1],
            [5, 10, 25, 'All'],
        ],
        "searching": false
    });

    $('#group tbody').on('click', 'tr', function () {
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
        } else {
            groupTable.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        }
        selected_row_group = $(this).find('td:eq(0)').text().trim();
    });

    $('#group_delete_button').click(function () {
        // Obtén la segunda fila de userTable
        const selectedRow = groupTable.row(selected_row_group - 1).node();
        // Buscar los elementos <input> y <select> solo dentro de la fila seleccionada
        const inputsAndSelects = $(selectedRow).find('input, select');
        // Serializa los valores de los elementos seleccionados
        const data = inputsAndSelects.serialize();
        // Send POST request to server
        $.ajax({
            url: '/delete_group',  // Replace with your server-side endpoint URL
            method: 'POST',
            data: { data: data },  // Replace with your data
            success: function (response) {
                // Handle successful response from server
                window.location.reload();
            },
            error: function (xhr, status, error) {
                // Handle error from server
                alert(xhr.responseText);
            }
        });
    });

    $('#add_group').submit(function (event) {
        // Evitar envío convencional del formulario
        event.preventDefault();
        // Obtener los datos del formulario
        let formData = $(this).serialize();
        // Realizar la solicitud Ajax
        $.ajax({
            type: 'POST',
            url: '/new_group',
            data: { data: formData },
            success: function (response) {
                // Manejar la respuesta del servidor
                window.location.reload();
            },
            error: function (xhr, status, error) {
                // Manejar errores de la solicitud
                alert(xhr.responseText);
            }
        });
    });

    $('#group_update_button').click(function () {
        // Obtén la segunda fila de userTable
        const selectedRow = groupTable.row(selected_row_group - 1).node();
        // Buscar los elementos <input> y <select> solo dentro de la fila seleccionada
        const inputsAndSelects = $(selectedRow).find('input');
        // Serializa los valores de los elementos seleccionados
        const data = inputsAndSelects.serialize();
        console.log(data);
        // Send POST request to server
        $.ajax({
            url: '/update_group',
            method: 'POST',
            data: { data: data },
            success: function (response) {
                // Handle successful response from server
                window.location.reload();
            },
            error: function (xhr, status, error) {
                // Handle error from server
                alert(xhr.responseText);
            }
        });
    });

    //Stats Panel
    $('#select_group').submit(function (event) {
        // Evitar envío convencional del formulario
        event.preventDefault();
        // Obtener los datos del formulario
        const formData = $(this).serialize();
        const typeStat = $(this).find('[name="type_stats"]').val();
        // Realizar la solicitud Ajax
        $.ajax({
            type: 'POST',
            url: '/stats',
            data: { data: formData },
            success: function (response) {
                // Manejar la respuesta del servidor
                if (typeStat === 'tetris_stats') {
                    const figuras = [];
                    const title = 'FIGURAS GENERADAS';
                    const label = 'Figuras';
                    for (let i in response) {
                        const traza = JSON.parse(response[i].traza); // recuperamos la traza
                        const ficha = traza.object.definition.name; // recuperamos la ficha
                        const valor = Object.values(ficha); // obtenemos el valor de la ficha
                        if (figuras.some(item => Object.keys(item)[0] === valor[0])) { // si lo encuentra
                            let figura = figuras.find(objeto => Object.keys(objeto)[0] === valor[0]);
                            figura[valor[0]]++;
                        } else if (valor[0].includes('ficha')) {
                            const figura = {
                                [valor[0]]: 1
                            }
                            figuras.push(figura);
                        }
                    }
                    generateCharts(figuras, 'bar', label, title);
                } else if (typeStat === 'move_count') {
                    const title = 'MOVIMIENTOS REALIZADOS'
                    const label = 'Tipo de movimiento'
                    for (let i in response) {
                        const traza = JSON.parse(response[i].traza); // recuperamos la traza
                        const ficha = traza.object.definition.name; // recuperamos la ficha
                        const valor = Object.values(ficha); // obtenemos el valor de la ficha
                        if (figuras.some(item => Object.keys(item)[0] === valor[0])) { // si lo encuentra
                            let figura = figuras.find(objeto => Object.keys(objeto)[0] === valor[0]);
                            figura[valor[0]]++;
                        } else if (valor[0].includes('arrow')) {
                            const figura = {
                                [valor[0]]: 1
                            }
                            figuras.push(figura);
                        }
                    }
                } else if (typeStat === 'player_stats') {
                    const figuras = [];
                    const time_array = [];
                    const apm_array = [];
                    const level_array = [];
                    const attempt_array = [];
                    const title = ['TEMPO TOTAL POR JUGADOR (s)', 'ACCIONES/MIN POR JUGADOR', 'MÁXIMO NIVEL ALCANZADO', 'MÁXIMOS INTENTOS POR JUGADOR'];
                    const label = ['Jugador', 'Jugador', 'Jugador', 'Jugador'];
                    const chartType = ['pie', 'bar', 'bar', 'bar'];
                    for (let i in response) {
                        const traza = JSON.parse(response[i].traza); // recuperamos la traza
                        const valor = Object.values(traza.verb.display); // obtenemos el valor de la ficha
                        if (valor[0] === "completed") {
                            const player_name = traza.actor.name;
                            const object = Object.values(traza.result);
                            const time = object[1]["https://www.tetris.com/time"];
                            const apm = object[1]["https://www.tetris.com/apm"];
                            const level = object[1]["https://www.tetris.com/level"];
                            const attempt = object[1]["https://www.tetris.com/attempt"];
                            console.log("El attempt de " + player_name + " es de: " + attempt);
                            if (time_array.some(item => Object.keys(item)[0] === player_name)) {
                                time_array[player_name] += time;
                            } else {
                                const figura = { [player_name]: time }
                                time_array.push(figura);
                            }
                            if (apm_array.some(item => Object.keys(item)[0] === player_name)) {
                                let player = apm_array.find(objeto => Object.keys(objeto)[0] === player_name);
                                if (player[player_name] < apm) {
                                    player[player_name] = apm;
                                }
                            } else {
                                const figura = { [player_name]: apm }
                                apm_array.push(figura);
                            }
                            if (level_array.some(item => Object.keys(item)[0] === player_name)) {
                                let player = level_array.find(objeto => Object.keys(objeto)[0] === player_name);
                                if (player[player_name] < level) {
                                    player[player_name] = level;
                                }
                            } else {
                                const figura = { [player_name]: level }
                                level_array.push(figura);
                            }
                            if (attempt_array.some(item => Object.keys(item)[0] === player_name)) {
                                let player = attempt_array.find(objeto => Object.keys(objeto)[0] === player_name);
                                if (player[player_name] < attempt) {
                                    player[player_name] = attempt;
                                }
                                attempt_array[player_name] += attempt;
                            } else {
                                const figura = { [player_name]: attempt }
                                attempt_array.push(figura);
                            }
                        }
                    }
                    figuras.push(time_array);
                    figuras.push(apm_array);
                    figuras.push(level_array);
                    figuras.push(attempt_array);
                    for (let i in figuras) {
                        generateCharts(figuras[i], chartType[i], label[i], title[i], i);
                    }
                }
            },
            error: function (xhr, status, error) {
                // Manejar errores de la solicitud
                alert(xhr.responseText);
            }
        });
    });
});

var passInput = document.getElementById('pass');
var pass2Input = document.getElementById('pass2');

passInput.addEventListener('input', function () {
    pass2Input.value = passInput.value;
});


function generateCharts(figuras, chartType, label, title, index = 0) {
    const canvas = document.getElementById(`chart-${index}`);
    const ctx = canvas.getContext('2d');

    // Verificar si existe una instancia de Chart en el lienzo y destruirla si es necesario
    if (canvas.chart !== undefined) {
        canvas.chart.destroy();
    }

    canvas.chart = new Chart(ctx, {
        type: chartType,
        data: {
            labels: figuras.map(obj => Object.keys(obj)[0]),
            datasets: [{
                label: label,
                data: figuras.map(obj => Object.values(obj)[0]),
                backgroundColor: ['rgb(0, 18, 25, 0.7)', 'rgb(0, 95, 115, 0.7)', 'rgb(10, 147, 150, 0.7)', 'rgb(148, 210, 0.7)', 'rgb(238, 155, 0, 0.7)', 'rgb(202, 103, 2, 0.7)', 'rgb(187, 62, 3, 0.7)', 'rgb(174, 32, 18, 0.7)', 'rgb(155, 34, 38, 0.7)'], // Array de colores para las barras
                borderColor: ['rgb(0, 18, 25, 1)', 'rgb(0, 95, 115, 1)', 'rgb(10, 147, 150, 1)', 'rgb(148, 210, 189, 1)', 'rgb(238, 155, 0, 1)', 'rgb(202, 103, 2, 1)', 'rgb(187, 62, 3, 1)', 'rgb(174, 32, 18, 1)', 'rgb(155, 34, 38, 1)'], // Array de colores para los bordes de las barras
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: title
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            },
        }
    });
}
