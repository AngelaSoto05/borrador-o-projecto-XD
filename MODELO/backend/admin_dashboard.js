// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Cargar estadísticas
    cargarEstadisticas();
    
    // Configurar botón de logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('¿Está seguro que desea cerrar sesión?')) {
                localStorage.removeItem('auth_token');
                window.location.href = '../index.html';
            }
        });
    }

    // Toggle sidebar en móviles
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
});

async function cargarEstadisticas() {
    try {
        // Simular carga de datos (en producción harías fetch a la API)
        setTimeout(() => {
            document.getElementById('total-students').textContent = '1,254';
            document.getElementById('total-teachers').textContent = '84';
            document.getElementById('total-courses').textContent = '56';
        }, 1000);
        
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

// Navegación entre páginas
function navegarAPagina(pagina) {
    window.location.href = `admin-pages/${pagina}.html`;
}