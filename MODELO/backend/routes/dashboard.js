const express = require('express');
const pool = require('../database/config');
const { verifyToken } = require('./auth');

const router = express.Router();

// Obtener estadísticas del dashboard
router.get('/estadisticas', verifyToken, async (req, res) => {
    try {
        // Total estudiantes activos
        const [estudiantes] = await pool.execute(
            "SELECT COUNT(*) as total FROM estudiantes WHERE estado_estudiante = 'VIGENTE'"
        );

        // Total docentes
        const [docentes] = await pool.execute(
            "SELECT COUNT(*) as total FROM docentes"
        );

        // Total cursos activos
        const [cursos] = await pool.execute(
            "SELECT COUNT(*) as total FROM cursos WHERE estado = 'ACTIVO'"
        );

        // Ciclo activo
        const [ciclo] = await pool.execute(
            "SELECT nombre_ciclo FROM ciclos_academicos WHERE estado = 'ACTIVO' LIMIT 1"
        );

        res.json({
            success: true,
            data: {
                totalEstudiantes: estudiantes[0].total,
                totalDocentes: docentes[0].total,
                totalCursos: cursos[0].total,
                cicloActivo: ciclo[0]?.nombre_ciclo || 'No activo'
            }
        });

    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

// Obtener datos para gráficos
router.get('/graficos', verifyToken, async (req, res) => {
    try {
        // Rendimiento por curso (ejemplo)
        const [rendimiento] = await pool.execute(`
            SELECT c.nombre_curso, AVG(n.calificacion) as promedio
            FROM notas n
            JOIN matriculas m ON n.id_matricula = m.id_matricula
            JOIN grupos_curso gc ON m.grupo_id = gc.grupo_id
            JOIN cursos c ON gc.codigo_curso = c.codigo_curso
            GROUP BY c.codigo_curso
            LIMIT 10
        `);

        // Asistencia promedio (ejemplo)
        const [asistencia] = await pool.execute(`
            SELECT c.nombre_curso, 
                   AVG(CASE WHEN ae.estado_asistencia = 'PRESENTE' THEN 1 ELSE 0 END) * 100 as porcentaje_asistencia
            FROM asistencias_estudiante ae
            JOIN matriculas m ON ae.id_matricula = m.id_matricula
            JOIN grupos_curso gc ON m.grupo_id = gc.grupo_id
            JOIN cursos c ON gc.codigo_curso = c.codigo_curso
            GROUP BY c.codigo_curso
            LIMIT 10
        `);

        res.json({
            success: true,
            data: {
                rendimiento,
                asistencia
            }
        });

    } catch (error) {
        console.error('Error al obtener datos de gráficos:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

module.exports = router;