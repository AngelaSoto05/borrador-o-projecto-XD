// Gestión de usuarios
document.addEventListener('DOMContentLoaded', function() {
    // Modal de nuevo usuario
    const modal = document.getElementById('modal-usuario');
    const btnNuevo = document.getElementById('btn-nuevo-usuario');
    const btnCancelar = document.getElementById('btn-cancelar');
    const closeBtn = document.querySelector('.close');

    if (btnNuevo) {
        btnNuevo.addEventListener('click', () => {
            modal.style.display = 'block';
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // Cerrar modal al hacer click fuera
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Formulario de nuevo usuario
    const formUsuario = document.getElementById('form-usuario');
    if (formUsuario) {
        formUsuario.addEventListener('submit', function(e) {
            e.preventDefault();
            crearUsuario();
        });
    }

    // Búsqueda de usuarios
    const searchInput = document.getElementById('search-users');
    if (searchInput) {
        searchInput.addEventListener('input', buscarUsuarios);
    }
});

function crearUsuario() {
    const tipo = document.getElementById('tipo-usuario').value;
    const correo = document.getElementById('correo').value;
    const dni = document.getElementById('dni').value;
    const nombre = document.getElementById('nombre').value;

    // Validaciones básicas
    if (!tipo || !correo || !dni || !nombre) {
        alert('Por favor complete todos los campos obligatorios');
        return;
    }

    // Simular creación de usuario (en producción harías fetch a la API)
    console.log('Creando usuario:', { tipo, correo, dni, nombre });
    
    alert('Usuario creado exitosamente. La contraseña inicial es el DNI: ' + dni);
    document.getElementById('modal-usuario').style.display = 'none';
    document.getElementById('form-usuario').reset();
}

function buscarUsuarios() {
    const searchTerm = document.getElementById('search-users').value.toLowerCase();
    const rows = document.querySelectorAll('#users-table-body tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Funciones para otras páginas
function generarReporte() {
    const tipo = document.getElementById('tipo-reporte').value;
    const ciclo = document.getElementById('ciclo-reporte').value;
    const curso = document.getElementById('curso-reporte').value;
    
    if (!tipo || !ciclo) {
        alert('Seleccione tipo de reporte y ciclo académico');
        return;
    }

    // Simular generación de reporte
    alert(`Generando reporte ${tipo} para ciclo ${ciclo}...`);
    
    // En producción: fetch a la API para generar PDF
}

function asignarHorario() {
    const curso = document.getElementById('select-curso').value;
    const docente = document.getElementById('select-docente').value;
    const salon = document.getElementById('select-salon').value;
    const dia = document.getElementById('select-dia').value;
    const horaInicio = document.getElementById('hora-inicio').value;
    const horaFin = document.getElementById('hora-fin').value;

    if (!curso || !docente || !salon || !dia || !horaInicio || !horaFin) {
        alert('Complete todos los campos del horario');
        return;
    }

    // Simular asignación de horario
    alert(`Horario asignado: ${curso} - ${docente} - ${salon} - ${dia} ${horaInicio}-${horaFin}`);
}