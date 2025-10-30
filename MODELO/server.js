// server.js (Ejemplo con Node.js/Express)
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Datos de ejemplo
let estudiantes = [
  {
    id: 1,
    alumno: "Juan Pérez",
    cont1: 15,
    parcial1: 12,
    cont2: 14,
    parcial2: 16,
    cont3: 13,
    final: 14
  }
];

// Endpoint para obtener estudiantes
app.get('/api/estudiantes', (req, res) => {
  res.json(estudiantes);
});

// Endpoint para guardar cambios
app.post('/api/estudiantes', (req, res) => {
  estudiantes = req.body;
  res.json({ message: 'Datos guardados exitosamente' });
});

app.listen(3001, () => {
  console.log('Servidor corriendo en puerto 3001');
});