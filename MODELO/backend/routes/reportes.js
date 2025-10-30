const express = require('express');
const PDFDocument = require('pdfkit');
const pool = require('../database/config');
const { verifyToken } = require('./auth');

const router = express.Router();

// Generar reporte PDF
router.post('/generar', verifyToken, async (req, res) => {
    try {
        const { cursoId, cicloId, tipoReporte } = req.body;

        // Obtener datos del curso
        const [cursos] = await pool.execute(`
            SELECT c.*, d.apellidos_nombres as docente
            FROM cursos c
            LEFT JOIN grupos_curso gc ON c.codigo_curso = gc.codigo_curso
            LEFT JOIN horarios h ON gc.grupo_id = h.grupo_id
            LEFT JOIN docentes d ON h.id_docente = d.id_docente
            WHERE c.codigo_curso = ? AND gc.id_ciclo = ?
            GROUP BY c.codigo_curso
        `, [cursoId, cicloId]);

        if (cursos.length === 0) {
            return res.status(404).json({ success: false, message: 'Curso no encontrado' });
        }

        const curso = cursos[0];

        // Obtener estudiantes y sus notas
        const [estudiantes] = await pool.execute(`
            SELECT e.cui, e.apellidos_nombres, 
                   n.cont1, n.parcial1, n.cont2, n.parcial2, n.cont3, n.final,
                   n.promedio, n.estado
            FROM estudiantes e
            JOIN matriculas m ON e.cui = m.cui
            JOIN grupos_curso gc ON m.grupo_id = gc.grupo_id
            LEFT JOIN notas n ON m.id_matricula = n.id_matricula
            WHERE gc.codigo_curso = ? AND gc.id_ciclo = ?
            AND m.estado_matricula = 'ACTIVO'
        `, [cursoId, cicloId]);

        // Crear PDF
        const doc = new PDFDocument();
        const filename = `reporte_${cursoId}_${Date.now()}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

        doc.pipe(res);

        // Encabezado
        doc.fontSize(20).text('SISTEMA UNIVERSITARIO LUMINA', 50, 50);
        doc.fontSize(16).text('Reporte Académico', 50, 80);
        doc.fontSize(12).text(`Generado: ${new Date().toLocaleDateString()}`, 50, 100);

        // Información del curso
        doc.fontSize(14).text(`Curso: ${curso.nombre_curso}`, 50, 130);
        doc.text(`Código: ${curso.codigo_curso}`, 50, 150);
        doc.text(`Docente: ${curso.docente || 'No asignado'}`, 50, 170);

        // Tabla de estudiantes
        let y = 220;
        doc.fontSize(10);

        // Encabezado de tabla
        doc.text('Estudiante', 50, y);
        doc.text('C1', 250, y);
        doc.text('P1', 280, y);
        doc.text('C2', 310, y);
        doc.text('P2', 340, y);
        doc.text('C3', 370, y);
        doc.text('Final', 400, y);
        doc.text('Prom', 430, y);
        doc.text('Estado', 460, y);

        y += 20;
        doc.moveTo(50, y).lineTo(500, y).stroke();

        // Datos de estudiantes
        estudiantes.forEach(est => {
            y += 20;
            if (y > 700) {
                doc.addPage();
                y = 50;
            }

            doc.text(est.apellidos_nombres.substring(0, 30), 50, y);
            doc.text(est.cont1?.toString() || '-', 250, y);
            doc.text(est.parcial1?.toString() || '-', 280, y);
            doc.text(est.cont2?.toString() || '-', 310, y);
            doc.text(est.parcial2?.toString() || '-', 340, y);
            doc.text(est.cont3?.toString() || '-', 370, y);
            doc.text(est.final?.toString() || '-', 400, y);
            doc.text(est.promedio?.toString() || '-', 430, y);
            doc.text(est.estado || '-', 460, y);
        });

        doc.end();

    } catch (error) {
        console.error('Error al generar reporte:', error);
        res.status(500).json({ success: false, message: 'Error al generar reporte' });
    }
});

module.exports = router;