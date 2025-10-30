// app.js
class SistemaNotas {
  constructor() {
    this.apiUrl = 'http://localhost:3001/api';
    this.init();
  }

  async init() {
    await this.cargarEstudiantes();
    this.setupEventListeners();
  }

  async cargarEstudiantes() {
    try {
      const response = await fetch(`${this.apiUrl}/estudiantes`);
      
      if (!response.ok) {
        throw new Error('Error al conectar con el servidor');
      }
      
      const estudiantes = await response.json();
      this.mostrarEstudiantes(estudiantes);
    } catch (error) {
      this.mostrarError('Error al cargar los datos. Verifica que el servidor esté corriendo.');
      console.error('Error:', error);
    }
  }

  mostrarEstudiantes(estudiantes) {
    const tbody = document.querySelector('#tabla-notas tbody');
    tbody.innerHTML = '';

    estudiantes.forEach(est => {
      const promedio = this.calcularPromedio(est);
      const estado = promedio >= 13 ? 'Aprobado' : 'Desaprobado';
      
      const fila = `
        <tr>
          <td><input type="text" value="${est.alumno}" data-field="alumno"></td>
          <td><input type="number" value="${est.cont1}" data-field="cont1" min="0" max="20"></td>
          <td><input type="number" value="${est.parcial1}" data-field="parcial1" min="0" max="20"></td>
          <td><input type="number" value="${est.cont2}" data-field="cont2" min="0" max="20"></td>
          <td><input type="number" value="${est.parcial2}" data-field="parcial2" min="0" max="20"></td>
          <td><input type="number" value="${est.cont3}" data-field="cont3" min="0" max="20"></td>
          <td><input type="number" value="${est.final}" data-field="final" min="0" max="20"></td>
          <td class="promedio">${promedio.toFixed(2)}</td>
          <td class="estado ${estado.toLowerCase()}">${estado}</td>
        </tr>
      `;
      tbody.innerHTML += fila;
    });

    this.actualizarResumen(estudiantes);
  }

  calcularPromedio(estudiante) {
    const { cont1, parcial1, cont2, parcial2, cont3, final } = estudiante;
    return (cont1 + parcial1 + cont2 + parcial2 + cont3 + final) / 6;
  }

  actualizarResumen(estudiantes) {
    const total = estudiantes.length;
    const aprobados = estudiantes.filter(est => 
      this.calcularPromedio(est) >= 13
    ).length;

    document.querySelector('#total-alumnos').textContent = total;
    document.querySelector('#aprobados').textContent = aprobados;
    document.querySelector('#desaprobados').textContent = total - aprobados;
  }

  mostrarError(mensaje) {
    const tbody = document.querySelector('#tabla-notas tbody');
    tbody.innerHTML = `<tr><td colspan="9" class="error">${mensaje}</td></tr>`;
  }

  setupEventListeners() {
    document.getElementById('guardar-cambios').addEventListener('click', () => {
      this.guardarCambios();
    });

    // Actualizar promedios en tiempo real
    document.addEventListener('input', (e) => {
      if (e.target.type === 'number') {
        this.actualizarFila(e.target.closest('tr'));
      }
    });
  }

  actualizarFila(fila) {
    const inputs = fila.querySelectorAll('input[type="number"]');
    let suma = 0;
    
    inputs.forEach(input => {
      suma += parseFloat(input.value) || 0;
    });

    const promedio = suma / 6;
    const estado = promedio >= 13 ? 'Aprobado' : 'Desaprobado';
    
    fila.querySelector('.promedio').textContent = promedio.toFixed(2);
    fila.querySelector('.estado').textContent = estado;
    fila.querySelector('.estado').className = `estado ${estado.toLowerCase()}`;
  }

  async guardarCambios() {
    const estudiantes = [];
    const filas = document.querySelectorAll('#tabla-notas tbody tr');
    
    filas.forEach(fila => {
      const inputs = fila.querySelectorAll('input');
      const estudiante = {};
      
      inputs.forEach(input => {
        estudiante[input.dataset.field] = input.type === 'number' ? 
          parseFloat(input.value) || 0 : input.value;
      });
      
      estudiantes.push(estudiante);
    });

    try {
      const response = await fetch(`${this.apiUrl}/estudiantes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(estudiantes)
      });

      if (response.ok) {
        alert('Cambios guardados exitosamente');
        this.actualizarResumen(estudiantes);
      } else {
        throw new Error('Error al guardar');
      }
    } catch (error) {
      alert('Error al guardar los cambios');
      console.error('Error:', error);
    }
  }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new SistemaNotas();
});