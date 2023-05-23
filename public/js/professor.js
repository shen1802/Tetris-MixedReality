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
        const type_user = $(this).find('[name="type_user"]').val();
        const chart0 = $(this).find('[name="start_chart-0"]').val();
        const chart1 = $(this).find('[name="start_chart-1"]').val();
        const chart2 = $(this).find('[name="start_chart-2"]').val();
        const chart3 = $(this).find('[name="start_chart-3"]').val();
        const charts_to_show = [];
        if (chart0 !== null && chart0 !== '') {
            charts_to_show.push(chart0);
        }
        if (chart1 !== null && chart1 !== '') {
            charts_to_show.push(chart1);
        }
        if (chart2 !== null && chart2 !== '') {
            charts_to_show.push(chart2)
        }
        if (chart3 != null && chart3 !== '') {
            charts_to_show.push(chart3)
        }
        const chartType = ['pie', 'bar', 'bar', 'bar'];
        // Realizar la solicitud Ajax
        $.ajax({
            type: 'POST',
            url: '/stats',
            data: { data: formData },
            success: function (response) {
                // Manejar la respuesta del servidor
                const options = [{ total_time: { title: 'TEMPO TOTAL POR JUGADOR (s)', label: "Jugador", array: [] } },
                { player_apm: { title: 'ACCIONES/MIN POR JUGADOR', label: "Jugador", array: [] } },
                { max_level: { title: 'MÁXIMO NIVEL ALCANZADO', label: "Jugador", array: [] } },
                { max_attempt: { title: 'MÁXIMOS INTENTOS POR JUGADOR', label: "Jugador", array: [] } },
                { moves: { title: 'MOVIMIENTOS REALIZADOS', label: "Movimientos", array: [] } },
                { fig_generated: { title: 'FIGURAS GENERADAS', label: "Figuras", array: [] } },
                { games_played: { title: 'PARTIDAS JUGADAS', label: "Partidas", array: [] } },
                ];
                const time_array = [];
                const apm_array = [];
                const level_array = [];
                const attempt_array = [];
                const fig_generated_array = [];
                const moves_array = [];
                const games_played_array = [];

                //Tratamiento de los datos
                for (let i in response) {
                    const traza = JSON.parse(response[i].traza); // recuperamos la traza
                    const display = Object.values(traza.verb.display); // obtenemos el verbo de la ficha
                    const ficha = Object.values(traza.object.definition.name);
                    if (type_user !== null && type_user !== '') {
                        const player_name = traza.actor.name;
                        if (player_name === type_user) {
                            const display = Object.values(traza.verb.display); // obtenemos el valor de la ficha
                            const ficha = Object.values(traza.object.definition.name);
                            const player_name = traza.actor.name;
                            if (display[0] === "completed") {
                                const object = Object.values(traza.result);
                                const time = object[1]["https://www.tetris.com/time"];
                                const apm = object[1]["https://www.tetris.com/apm"];
                                const level = object[1]["https://www.tetris.com/level"];
                                const attempt = object[1]["https://www.tetris.com/attempt"];
                                if (time_array.some(item => Object.keys(item)[0] === player_name)) {
                                    let player = time_array.find(objeto => Object.keys(objeto)[0] === player_name);
                                    player[player_name] += time;
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
                                } else {
                                    const figura = { [player_name]: attempt }
                                    attempt_array.push(figura);
                                }
                                if (games_played_array.some(item => Object.keys(item)[0] === player_name)) {
                                    let player = games_played_array.find(objeto => Object.keys(objeto)[0] === player_name);
                                    player[player_name] += 1;
                                } else {
                                    const figura = { [player_name]: 1 }
                                    games_played_array.push(figura);
                                }
                            } else if (display[0] === "exited") {
                                if (games_played_array.some(item => Object.keys(item)[0] === player_name)) {
                                    let player = games_played_array.find(objeto => Object.keys(objeto)[0] === player_name);
                                    player[player_name] += 1;
                                } else {
                                    const figura = { [player_name]: 1 }
                                    games_played_array.push(figura);
                                }
                            }
                            if (fig_generated_array.some(item => Object.keys(item)[0] === ficha[0])) { // si lo encuentra
                                let figura = fig_generated_array.find(objeto => Object.keys(objeto)[0] === ficha[0]);
                                figura[ficha[0]]++;
                            } else if (ficha[0].includes('ficha')) {
                                const figura = {
                                    [ficha[0]]: 1
                                }
                                fig_generated_array.push(figura);
                            }
                            if (moves_array.some(item => Object.keys(item)[0] === ficha[0])) { // si lo encuentra
                                let figura = moves_array.find(objeto => Object.keys(objeto)[0] === ficha[0]);
                                figura[ficha[0]]++;
                            } else if (ficha[0].includes('arrow')) {
                                const figura = {
                                    [ficha[0]]: 1
                                }
                                moves_array.push(figura);
                            }
                            if (display[0] === "interacted") {
                                const object = Object.values(traza.result);
                                if (object[1] !== undefined) {
                                    if (object[1].hasOwnProperty("https://www.tetris.com/figure/movement")) {
                                        const move = object[1]["https://www.tetris.com/figure/movement"];
                                        if (move !== "generated" && move !== "released") {
                                            if (moves_array.some(item => Object.keys(item)[0] === move)) { // si lo encuentra
                                                let figura = moves_array.find(objeto => Object.keys(objeto)[0] === move);
                                                figura[move]++;
                                            } else {
                                                const figura = {
                                                    [move]: 1
                                                }
                                                moves_array.push(figura);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        const player_name = traza.actor.name;
                        if (display[0] === "completed") {
                            const object = Object.values(traza.result);
                            const time = object[1]["https://www.tetris.com/time"];
                            const apm = object[1]["https://www.tetris.com/apm"];
                            const level = object[1]["https://www.tetris.com/level"];
                            const attempt = object[1]["https://www.tetris.com/attempt"];
                            if (time_array.some(item => Object.keys(item)[0] === player_name)) {
                                let player = time_array.find(objeto => Object.keys(objeto)[0] === player_name);
                                player[player_name] += time;
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
                            } else {
                                const figura = { [player_name]: attempt }
                                attempt_array.push(figura);
                            }
                            if (games_played_array.some(item => Object.keys(item)[0] === player_name)) {
                                let player = games_played_array.find(objeto => Object.keys(objeto)[0] === player_name);
                                player[player_name] += 1;
                            } else {
                                const figura = { [player_name]: 1 }
                                games_played_array.push(figura);
                            }
                        } else if (display[0] === "exited") {
                            if (games_played_array.some(item => Object.keys(item)[0] === player_name)) {
                                let player = games_played_array.find(objeto => Object.keys(objeto)[0] === player_name);
                                player[player_name] += 1;
                            } else {
                                const figura = { [player_name]: 1 }
                                games_played_array.push(figura);
                            }
                        }
                        if (fig_generated_array.some(item => Object.keys(item)[0] === ficha[0])) { // si lo encuentra
                            let figura = fig_generated_array.find(objeto => Object.keys(objeto)[0] === ficha[0]);
                            figura[ficha[0]]++;
                        } else if (ficha[0].includes('ficha')) {
                            const figura = {
                                [ficha[0]]: 1
                            }
                            fig_generated_array.push(figura);
                        }
                        if (moves_array.some(item => Object.keys(item)[0] === ficha[0])) { // si lo encuentra
                            let figura = moves_array.find(objeto => Object.keys(objeto)[0] === ficha[0]);
                            figura[ficha[0]]++;
                        } else if (ficha[0].includes('arrow')) {
                            const figura = {
                                [ficha[0]]: 1
                            }
                            moves_array.push(figura);
                        }
                        if (display[0] === "interacted") {
                            const object = Object.values(traza.result);
                            if (object[1] !== undefined) {
                                if (object[1].hasOwnProperty("https://www.tetris.com/figure/movement")) {
                                    const move = object[1]["https://www.tetris.com/figure/movement"];
                                    if (move !== "generated" && move !== "released") {
                                        if (moves_array.some(item => Object.keys(item)[0] === move)) { // si lo encuentra
                                            let figura = moves_array.find(objeto => Object.keys(objeto)[0] === move);
                                            figura[move]++;
                                        } else {
                                            const figura = {
                                                [move]: 1
                                            }
                                            moves_array.push(figura);
                                        }
                                    }
                                }
                            }
                        }
                    }

                }

                //Añadir los graficos al array
                options[0].total_time.array = time_array;
                options[1].player_apm.array = apm_array;
                options[2].max_level.array = level_array;
                options[3].max_attempt.array = attempt_array;
                options[4].moves.array = moves_array;
                options[5].fig_generated.array = fig_generated_array;
                options[6].games_played.array = games_played_array;

                //generar graficas
                for (let i in charts_to_show) {
                    const chart = options.find(objeto => Object.keys(objeto)[0] === charts_to_show[i]);
                    generateCharts(chart[charts_to_show[i]].array, chartType[i], chart[charts_to_show[i]].label, chart[charts_to_show[i]].title, i);
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
