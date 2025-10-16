function iniciarSesion() {
  const correo = document.getElementById("usuario").value.trim();
  const contrasena = document.getElementById("contrasena").value.trim();

  fetch("alumnos.csv")
    .then(response => {
      if (!response.ok) throw new Error("Error leyendo CSV");
      return response.text();
    })
    .then(data => {
      const lineas = data.split("\n").map(l => l.trim()).filter(l => l);
      let encontrado = false;

      for (let i = 0; i < lineas.length; i++) {
        const [email, pass, rol] = lineas[i].split(",");
        if (email === correo && pass === contrasena) {
          encontrado = true;
          localStorage.setItem("rol", rol);
          localStorage.setItem("usuario", email);
          window.location.href = "roles.html";
          break;
        }
      }

      if (!encontrado) {
        alert("⚠️ Usuario o contraseña incorrectos");
      }
    })
    .catch(() => {
      alert("❌ Error al leer alumnos.csv — usa Live Server para abrir la página.");
    });
}
