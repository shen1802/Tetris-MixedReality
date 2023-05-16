$(document).ready(function () {
    $('#register').submit(function (event) {
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
                alert(response);
                window.location.href = '/';
            },
            error: function (xhr, status, error) {
                // Manejar errores de la solicitud
                alert(xhr.responseText);
            }
        });
    });

    $('#institution').change(function () {
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
                        options += `
          <option value="${study_group[i].id}">
            ${study_group[i].name}
          </option>`;
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
});