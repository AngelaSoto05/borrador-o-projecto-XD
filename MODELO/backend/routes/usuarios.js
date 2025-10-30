const express = require('express');
const pool = require('../database/config');
const { verifyToken } = require('./auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Obtener todos los usuarios
router.get('/', verifyToken, async (req, res) => {
    try {
        const [users] = await pool.execute(`
            SELECT u.id_usuario, u.correo_institucional, t.nombre_tipo, 
                   u.estado_cuenta, u.fecha_ultimo_acceso, u.fecha_creacion
            FROM usuarios u
            JOIN tipos_usuario t ON u.tipo_id = t.tipo_id
            ORDER BY u.fecha_creacion DESC
        `);

        res.json({ success: true, data: users });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

// Crear nuevo usuario
router.post('/', verifyToken, [
    body('correo').isEmail(),
    body('tipo').isIn(['ESTUDIANTE', 'DOCENTE', 'SECRETARIA', 'ADMINISTRADOR']),
    body('nombre').notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: 'Datos inválidos' });
        }

        const { correo, tipo, nombre, dni } = req.body;

        // Obtener tipo_id
        const [tipos] = await pool.execute(
            'SELECT tipo_id FROM tipos_usuario WHERE nombre_tipo = ?',
            [tipo]
        );

        if (tipos.length === 0) {
            return res.status(400).json({ success: false, message: 'Tipo de usuario inválido' });
        }

        const tipoId = tipos[0].tipo_id;

        // Crear usuario (usar DNI como contraseña inicial)
        const [result] = await pool.execute(
            `INSERT INTO usuarios (correo_institucional, password_hash, salt, tipo_id, estado_cuenta) 
             VALUES (?, ?, ?, ?, 'ACTIVO')`,
            [correo, dni, 'salt', tipoId]
        );

        // Crear estudiante o docente según el tipo
        if (tipo === 'ESTUDIANTE') {
            await pool.execute(
                `INSERT INTO estudiantes (cui, id_usuario, apellidos_nombres, numero_matricula) 
                 VALUES (?, ?, ?, ?)`,
                [dni, result.insertId, nombre, Math.floor(Math.random() * 10000)]
            );
        } else if (tipo === 'DOCENTE') {
            await pool.execute(
                `INSERT INTO docentes (id_usuario, apellidos_nombres, departamento) 
                 VALUES (?, ?, 'Departamento Académico')`,
                [result.insertId, nombre]
            );
        }

        res.json({ success: true, message: 'Usuario creado exitosamente' });

    } catch (error) {
        console.error('Error al crear usuario:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ success: false, message: 'El correo ya está registrado' });
        } else {
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }
});

// Bloquear/Desbloquear usuario
router.put('/:id/estado', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        if (!['ACTIVO', 'BLOQUEADO'].includes(estado)) {
            return res.status(400).json({ success: false, message: 'Estado inválido' });
        }

        await pool.execute(
            'UPDATE usuarios SET estado_cuenta = ? WHERE id_usuario = ?',
            [estado, id]
        );

        res.json({ success: true, message: `Usuario ${estado.toLowerCase()} exitosamente` });

    } catch (error) {
        console.error('Error al cambiar estado:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

module.exports = router;