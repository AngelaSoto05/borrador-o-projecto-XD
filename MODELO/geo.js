function marcarAsistencia() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude.toFixed(5);
      const lon = pos.coords.longitude.toFixed(5);
      document.getElementById("ubicacion").innerText =
        `✅ Asistencia registrada en ubicación: [${lat}, ${lon}]`;
    }, () => {
      alert("No se pudo obtener la ubicación.");
    });
  } else {
    alert("Geolocalización no soportada por este navegador.");
  }
}
