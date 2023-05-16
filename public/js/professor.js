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

    //submenu de estadisticas
    TODO
    $('ul.submenu li a:first').addClass('admin_active');
    $('.sub_paginas .pagina').hide();
    $('.sub_paginas .pagina:first').show();
    $('div.overlay div#form_estudiante').hide();
    $('div.overlay div#form_empresa').hide();
    $('div.overlay div#form_universidad').hide();

    $('ul.submenu li a').click(function () {
        $('ul.submenu li a').removeClass('admin_active');
        $(this).addClass('admin_active');
        $('.sub_paginas .pagina').hide();

        var activeTab = $(this).attr('href');
        $(activeTab).show();
        return false;
    });

    $('#admin_add').click(function () {
        $('#overlay').addClass('active');
    });

    $('a#cerrar_pop_up').click(function () {
        $('#overlay').removeClass('active');
    });

    $('select#tipo_user').click(function () {
        $('div.overlay div#form_estudiante').hide();
        $('div.overlay div#form_empresa').hide();
        $('div.overlay div#form_universidad').hide();
        var tipo = document.getElementById("tipo_user").value;
        var seleccion = '#form_' + tipo;
        $(seleccion).show();
    });
});

var passInput = document.getElementById('pass');
var pass2Input = document.getElementById('pass2');

passInput.addEventListener('input', function () {
    pass2Input.value = passInput.value;
});


