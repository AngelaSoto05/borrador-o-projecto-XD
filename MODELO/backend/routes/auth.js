const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../database/config');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Middleware para verificar token
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'Token no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'lumina-secret-key');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Token inválido' });
    }
};

// Login
router.post('/login', [
    body('correo').isEmail().normalizeEmail(),
    body('password').notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: 'Datos inválidos' });
        }

        const { correo, password } = req.body;

        // Buscar usuario
        const [users] = await pool.execute(`
            SELECT u.*, t.nombre_tipo 
            FROM usuarios u 
            JOIN tipos_usuario t ON u.tipo_id = t.tipo_id 
            WHERE u.correo_institucional = ? AND u.estado_cuenta = 'ACTIVO'
        `, [correo]);

        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }

        const user = users[0];

        // Verificar contraseña (en producción usar bcrypt)
        // Para primer acceso, comparar con DNI
        const isValidPassword = user.primer_acceso ? 
            password === user.password_hash : // En tu caso, el DNI está en password_hash
            await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }

        // Generar token JWT
        const token = jwt.sign(
            { 
                id: user.id_usuario, 
                correo: user.correo_institucional,
                tipo: user.nombre_tipo 
            },
            process.env.JWT_SECRET || 'lumina-secret-key',
            { expiresIn: '24h' }
        );

        // Actualizar último acceso
        await pool.execute(
            'UPDATE usuarios SET fecha_ultimo_acceso = NOW() WHERE id_usuario = ?',
            [user.id_usuario]
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id_usuario,
                correo: user.correo_institucional,
                tipo: user.nombre_tipo,
                primerAcceso: user.primer_acceso
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

// Cambiar contraseña
router.post('/cambiar-password', verifyToken, [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: 'Contraseña debe tener al menos 8 caracteres' });
        }

        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        // Verificar usuario actual
        const [users] = await pool.execute(
            'SELECT * FROM usuarios WHERE id_usuario = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        const user = users[0];

        // Verificar contraseña actual
        const isValidCurrentPassword = user.primer_acceso ? 
            currentPassword === user.password_hash :
            await bcrypt.compare(currentPassword, user.password_hash);

        if (!isValidCurrentPassword) {
            return res.status(400).json({ success: false, message: 'Contraseña actual incorrecta' });
        }

        // Hashear nueva contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Actualizar contraseña
        await pool.execute(
            'UPDATE usuarios SET password_hash = ?, salt = ?, primer_acceso = FALSE WHERE id_usuario = ?',
            [hashedPassword, bcrypt.genSaltSync(saltRounds), userId]
        );

        res.json({ success: true, message: 'Contraseña cambiada exitosamente' });

    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

module.exports = router;