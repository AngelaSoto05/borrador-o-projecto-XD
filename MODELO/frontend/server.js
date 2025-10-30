// ======== server.js ========
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const CSV_PATH = path.join(__dirname, 'data', 'alumnos.csv');

// Obtener todos los alumnos
app.get('/api/alumnos', (req, res) => {
  fs.readFile(CSV_PATH, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error leyendo base de datos');
    const lines = data.split('\n').slice(1).filter(line => line.trim() !== '');
    const alumnos = lines.map(line => {
      const [id, codigo, nombre, usuario, contrasena] = line.split(',');
      return { id, codigo, nombre, usuario, contrasena };
    });
    res.json(alumnos);
  });
});

// Añadir alumno
app.post('/api/alumnos', (req, res) => {
  const { id, codigo, nombre, usuario, contrasena } = req.body;
  const newLine = `\n${id},${codigo},"${nombre}",${usuario},${contrasena}`;
  fs.appendFile(CSV_PATH, newLine, err => {
    if (err) return res.status(500).send('Error al guardar');
    res.send('Alumno agregado');
  });
});

// Eliminar alumno
app.delete('/api/alumnos/:id', (req, res) => {
  const idEliminar = req.params.id;
  fs.readFile(CSV_PATH, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error al leer archivo');
    const lines = data.split('\n');
    const header = lines[0];
    const nuevas = lines.filter(line => !line.startsWith(idEliminar + ','));
    fs.writeFile(CSV_PATH, nuevas.join('\n'), err2 => {
      if (err2) return res.status(500).send('Error al eliminar');
      res.send('Alumno eliminado');
    });
  });
});

// Servidor
app.listen(PORT, () => console.log(`✅ Servidor corriendo en http://localhost:${PORT}`));
