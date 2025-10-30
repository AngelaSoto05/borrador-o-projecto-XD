document.addEventListener("DOMContentLoaded", function () {
  fetch("notas.csv")
    .then(response => response.text())
    .then(data => {
      const filas = data.trim().split("\n").slice(1); // quitar encabezado
      const tabla = document.querySelector("#tablaNotas tbody");

      filas.forEach(linea => {
        const columnas = linea.split(",");
        const nombre = columnas[0]; // Solo el nombre

        const fila = document.createElement("tr");
        const celdaNombre = document.createElement("td");
        celdaNombre.textContent = nombre;
        fila.appendChild(celdaNombre);

        // Crear 6 inputs de notas
        for (let i = 0; i < 6; i++) {
          const celdaNota = document.createElement("td");
          const input = document.createElement("input");
          input.type = "number";
          input.min = "0";
          input.max = "20";
          input.value = "";
          input.addEventListener("input", calcularPromedios);
          celdaNota.appendChild(input);
          fila.appendChild(celdaNota);
        }

        // Promedio y estado vacíos
        const celdaPromedio = document.createElement("td");
        celdaPromedio.classList.add("promedio");
        celdaPromedio.textContent = "0";
        fila.appendChild(celdaPromedio);

        const celdaEstado = document.createElement("td");
        celdaEstado.classList.add("estado");
        celdaEstado.textContent = "---";
        fila.appendChild(celdaEstado);

        tabla.appendChild(fila);
      });
    });
});

function calcularPromedios() {
  const filas = document.querySelectorAll("#tablaNotas tbody tr");

  filas.forEach(fila => {
    const inputs = fila.querySelectorAll("input[type='number']");
    let suma = 0;
    let cantidad = 0;

    inputs.forEach(input => {
      const valor = parseFloat(input.value);
      if (!isNaN(valor)) {
        suma += valor;
        cantidad++;
      }
    });

    const promedio = cantidad > 0 ? (suma / cantidad).toFixed(1) : 0;
    fila.querySelector(".promedio").textContent = promedio;
    fila.querySelector(".estado").textContent = promedio >= 11 ? "Aprobado" : "Desaprobado";
  });
}
