const express = require('express');
const pool = require('../database/config');
const { verifyToken } = require('./auth');

const router = express.Router();

// Obtener horarios
router.get('/', verifyToken, async (req, res) => {
    try {
        const [horarios] = await pool.execute(`
            SELECT h.*, c.nombre_curso, gc.letra_grupo, gc.tipo_clase,
                   d.apellidos_nombres as docente, s.numero_salon
            FROM horarios h
            JOIN grupos_curso gc ON h.grupo_id = gc.grupo_id
            JOIN cursos c ON gc.codigo_curso = c.codigo_curso
            JOIN docentes d ON h.id_docente = d.id_docente
            JOIN salones s ON h.numero_salon = s.numero_salon
            WHERE h.estado = 'ACTIVO'
            ORDER BY h.dia_semana, h.hora_inicio
        `);

        res.json({ success: true, data: horarios });
    } catch (error) {
        console.error('Error al obtener horarios:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

// Asignar horario
router.post('/', verifyToken, async (req, res) => {
    try {
        const { grupoId, salon, dia, horaInicio, horaFin, docenteId } = req.body;

        // Verificar disponibilidad del salón
        const [conflictos] = await pool.execute(`
            SELECT * FROM horarios 
            WHERE numero_salon = ? AND dia_semana = ? AND estado = 'ACTIVO'
            AND ((hora_inicio BETWEEN ? AND ?) OR (hora_fin BETWEEN ? AND ?))
        `, [salon, dia, horaInicio, horaFin, horaInicio, horaFin]);

        if (conflictos.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'El salón no está disponible en ese horario' 
            });
        }

        // Crear horario
        await pool.execute(`
            INSERT INTO horarios (grupo_id, numero_salon, dia_semana, hora_inicio, hora_fin, id_docente)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [grupoId, salon, dia, horaInicio, horaFin, docenteId]);

        res.json({ success: true, message: 'Horario asignado exitosamente' });

    } catch (error) {
        console.error('Error al asignar horario:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

// Obtener grupos disponibles
router.get('/grupos', verifyToken, async (req, res) => {
    try {
        const [grupos] = await pool.execute(`
            SELECT gc.grupo_id, c.codigo_curso, c.nombre_curso, gc.letra_grupo, gc.tipo_clase
            FROM grupos_curso gc
            JOIN cursos c ON gc.codigo_curso = c.codigo_curso
            WHERE gc.estado = 'ACTIVO'
        `);

        res.json({ success: true, data: grupos });
    } catch (error) {
        console.error('Error al obtener grupos:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

module.exports = router;