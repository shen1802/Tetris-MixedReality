$(document).ready(function () {
    //User Board Info
    let selected_user_row = '';
    let selectedRow = '';
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
        // Obtener la fila seleccionada de userTable
        selected_user_row = $(this).find('td:eq(0)').text().trim();
        selected_user_row -= 1;
        selectedRow = userTable.row(selected_user_row).node();
        const value = '#user tbody tr:eq(' + selected_user_row + ') #institution_selected';
        const element = 'select[id="table_group_selected_' + selected_user_row + '"]';

        $(value).change(function () {
            // Obtener los datos del formulario
            const institution_id = $(this).serialize();
            // Realizar la solicitud Ajax
            $.ajax({
                type: 'POST',
                url: '/study_group',
                data: { data: institution_id },
                success: function (response) {
                    // Manejar la respuesta del servidor
                    const study_group = response;
                    // Generar el formulario HTML utilizando el valor study_group
                    let options = '';
                    if (study_group.length) {
                        for (let i = 0; i < study_group.length; i++) {
                            options += `<option value="${study_group[i].id}">${study_group[i].name}</option>`;
                        }
                    }

                    // Agregar las opciones al elemento select del formulario
                    const selectElement = document.querySelector(element);
                    selectElement.innerHTML = options;
                },
                error: function (xhr, status, error) {
                    // Manejar errores de la solicitud
                    alert(xhr.responseText);
                }
            });
        });
    });

    $('#user_delete_button').click(function () {
        // Buscar los elementos <input> y <select> solo dentro de la fila seleccionada
        const inputsAndSelects = $(selectedRow).find('input, select');
        // Serializa los valores de los elementos seleccionados
        const data_aux = inputsAndSelects.serialize();
        const data = data_aux + "&admin=true";
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

    $('#institution_selected').change(function () {
        // Obtener los datos del formulario
        const institution_id = $(this).serialize();
        // Realizar la solicitud Ajax
        $.ajax({
            type: 'POST',
            url: '/study_group',
            data: { data: institution_id },
            success: function (response) {
                // Manejar la respuesta del servidor
                const study_group = response;
                // Generar el formulario HTML utilizando el valor study_group
                let options = '';
                if (study_group.length) {
                    for (let i = 0; i < study_group.length; i++) {
                        options += `<option value="${study_group[i].id}">${study_group[i].name}</option>`;
                    }
                }
                // Agregar las opciones al elemento select del formulario
                const selectElement = document.querySelector('select[name="study_group_id"]');
                selectElement.innerHTML = options;
            },
            error: function (xhr, status, error) {
                // Manejar errores de la solicitud
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

    //Institution Board Info
    let selected_institution_row = "";
    let institutionTable = $('#institution').DataTable({
        order: [[0, 'asc']],
        lengthMenu: [
            [5, 10, 25, -1],
            [5, 10, 25, 'All'],
        ],
        "searching": false
    });

    $('#institution tbody').on('click', 'tr', function () {
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
        } else {
            institutionTable.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        }
        selected_institution_row = $(this).find('td:eq(1)').text();
    });

    $('#institution_delete_button').click(function () {
        // Send POST request to server
        $.ajax({
            url: '/delete_institution',  // Replace with your server-side endpoint URL
            method: 'POST',
            data: { institution_id: selected_institution_row },  // Replace with your data
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

    $('#add_institution').submit(function (event) {
        // Evitar envío convencional del formulario
        event.preventDefault();

        // Obtener los datos del formulario
        let formData = $(this).serialize();

        // Realizar la solicitud Ajax
        $.ajax({
            type: 'POST',
            url: '/new_institution',
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

});


var passInput = document.getElementById('pass');
var pass2Input = document.getElementById('pass2');

passInput.addEventListener('input', function () {
    pass2Input.value = passInput.value;
});