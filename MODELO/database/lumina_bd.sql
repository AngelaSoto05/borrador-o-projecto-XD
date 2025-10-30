
-- BASE DE DATOS LUMINA 

CREATE TABLE estudiantes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
);

CREATE TABLE asistencia (
  id INT AUTO_INCREMENT PRIMARY KEY,
  estudiante_id INT NOT NULL,
  fecha DATE NOT NULL,
  estado ENUM('Presente', 'Falta') NOT NULL,
  FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id)
);

CREATE TABLE notas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  estudiante_id INT NOT NULL,
  cont1 DECIMAL(5,2),
  parcial1 DECIMAL(5,2),
  cont2 DECIMAL(5,2),
  parcial2 DECIMAL(5,2),
  cont3 DECIMAL(5,2),
  final DECIMAL(5,2),
  promedio DECIMAL(5,2),
  estado VARCHAR(20),
  fecha_registro DATE DEFAULT CURRENT_DATE,
  FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id)
); 

CREATE DATABASE lumina_bd CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lumina_bd;


CREATE TABLE IF NOT EXISTS asistencia (
  id INT AUTO_INCREMENT PRIMARY KEY,
  estudiante_id INT,
  fecha DATE,
  estado ENUM('Presente', 'Falta'),
  FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id)
);

CREATE TABLE IF NOT EXISTS notas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  estudiante_id INT,
  curso VARCHAR(100),
  nota DECIMAL(5,2),
  fecha_registro DATE DEFAULT (CURRENT_DATE),
  FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id)
);
-- TABLA1 CICLOS ACADÉMICOS
CREATE TABLE ciclos_academicos (
    id_ciclo INT AUTO_INCREMENT PRIMARY KEY,
    nombre_ciclo VARCHAR(10) NOT NULL UNIQUE, -- '2025B'
    anio INT NOT NULL,
    semestre CHAR(1) NOT NULL, -- A o B
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    fecha_inicio_clases DATE NOT NULL, -- 1ra clase
    fecha_fin_clases DATE NOT NULL,-- última clase
    fecha_inicio_examenes DATE NULL,
    fecha_fin_examenes DATE NULL,
    estado ENUM('ACTIVO', 'INACTIVO', 'PLANIFICADO') DEFAULT 'PLANIFICADO',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_ciclo (anio, semestre),
    INDEX idx_activo (estado),
    INDEX idx_fechas (fecha_inicio, fecha_fin)
) ENGINE=InnoDB;

-- TABLA2 USUARIOS 
CREATE TABLE tipos_usuario (
    tipo_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_tipo ENUM('ESTUDIANTE', 'DOCENTE', 'SECRETARIA', 'ADMINISTRADOR') NOT NULL,
    descripcion TEXT,
    permisos JSON
) ENGINE=InnoDB;

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    correo_institucional VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- contraseña encriptada
    salt VARCHAR(100) NOT NULL, -- seguridad
    tipo_id INT NOT NULL, -- rol 
    estado_cuenta ENUM('ACTIVO', 'BLOQUEADO', 'ELIMINADO') DEFAULT 'ACTIVO',
    primer_acceso BOOLEAN DEFAULT TRUE, -- cambio de contraseña
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_ultimo_acceso DATETIME NULL,
    ip_ultimo_acceso VARCHAR(45) NULL,
    FOREIGN KEY (tipo_id) REFERENCES tipos_usuario(tipo_id),
    INDEX idx_correo (correo_institucional),
    INDEX idx_tipo (tipo_id),
    INDEX idx_estado (estado_cuenta)
) ENGINE=InnoDB;

CREATE TABLE estudiantes (
    cui VARCHAR(20) PRIMARY KEY,
    id_usuario INT UNIQUE NOT NULL,
    apellidos_nombres VARCHAR(150) NOT NULL,
    numero_matricula INT NOT NULL,
    estado_estudiante ENUM('VIGENTE', 'RETIRADO', 'EGRESADO') DEFAULT 'VIGENTE',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    INDEX idx_estado (estado_estudiante)
) ENGINE=InnoDB;

CREATE TABLE docentes (
    id_docente INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNIQUE NOT NULL,
    apellidos_nombres VARCHAR(150) NOT NULL,
    departamento VARCHAR(100) NOT NULL,
    es_responsable_teoria BOOLEAN DEFAULT FALSE, 
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    INDEX idx_departamento (departamento)
) ENGINE=InnoDB;

-- TABLA6 SESIONES 
CREATE TABLE sesiones (
    id_sesion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    token_sesion VARCHAR(255) UNIQUE NOT NULL, -- JSON Web Tokens
    ip_sesion VARCHAR(45) NOT NULL,
    fecha_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion DATETIME NOT NULL,
    activo BOOLEAN DEFAULT TRUE, -- estado de sesión
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    INDEX idx_token (token_sesion),
    INDEX idx_usuario_activo (id_usuario, activo),
    INDEX idx_expiracion (fecha_expiracion)
) ENGINE=InnoDB;

-- TABLA7 ACADÉMICAS 
CREATE TABLE cursos (
    codigo_curso VARCHAR(20) PRIMARY KEY,
    nombre_curso VARCHAR(200) NOT NULL,
    tiene_laboratorio BOOLEAN DEFAULT FALSE,
    numero_grupos_teoria INT DEFAULT 2,
    numero_grupos_laboratorio INT DEFAULT 0,
    estado ENUM('ACTIVO', 'INACTIVO') DEFAULT 'ACTIVO',
    INDEX idx_nombre (nombre_curso),
    INDEX idx_estado (estado)
) ENGINE=InnoDB;

CREATE TABLE tipos_evaluacion (
    tipo_eval_id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE, 
    nombre VARCHAR(50) NOT NULL,
    tipo ENUM('PARCIAL', 'CONTINUA') NOT NULL,
    INDEX idx_codigo (codigo)
) ENGINE=InnoDB;

CREATE TABLE porcentajes_evaluacion (
    id_porcentaje INT AUTO_INCREMENT PRIMARY KEY,
    codigo_curso VARCHAR(20) NOT NULL,
    id_ciclo INT NOT NULL,
    tipo_eval_id INT NOT NULL,
    porcentaje DECIMAL(5,2) NOT NULL,
    FOREIGN KEY (codigo_curso) REFERENCES cursos(codigo_curso) ON DELETE CASCADE,
    FOREIGN KEY (id_ciclo) REFERENCES ciclos_academicos(id_ciclo) ON DELETE CASCADE,
    FOREIGN KEY (tipo_eval_id) REFERENCES tipos_evaluacion(tipo_eval_id),
    UNIQUE KEY uk_curso_ciclo_evaluacion (codigo_curso, id_ciclo, tipo_eval_id),
    INDEX idx_curso_ciclo (codigo_curso, id_ciclo)
) ENGINE=InnoDB;

-- TABLA10 SALONES Y HORARIOS 
CREATE TABLE tipos_aula (
    tipo_aula_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_tipo ENUM('AULA', 'LABORATORIO') NOT NULL,
    descripcion TEXT,
    INDEX idx_nombre (nombre_tipo)
) ENGINE=InnoDB;

CREATE TABLE salones (
    numero_salon VARCHAR(10) PRIMARY KEY,
    tipo_aula_id INT NOT NULL,
    capacidad INT NOT NULL,
    estado ENUM('DISPONIBLE', 'OCUPADA', 'MANTENIMIENTO') DEFAULT 'DISPONIBLE',
    FOREIGN KEY (tipo_aula_id) REFERENCES tipos_aula(tipo_aula_id),
    INDEX idx_tipo (tipo_aula_id),
    INDEX idx_estado (estado)
) ENGINE=InnoDB;

CREATE TABLE grupos_curso (
    grupo_id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_curso VARCHAR(20) NOT NULL,
    id_ciclo INT NOT NULL,
    letra_grupo CHAR(1) NOT NULL, -- A,B
    tipo_clase ENUM('TEORIA', 'LABORATORIO') NOT NULL,
    capacidad_maxima INT NOT NULL,
    estado ENUM('ACTIVO', 'CERRADO') DEFAULT 'ACTIVO',
    FOREIGN KEY (codigo_curso) REFERENCES cursos(codigo_curso) ON DELETE CASCADE,
    FOREIGN KEY (id_ciclo) REFERENCES ciclos_academicos(id_ciclo) ON DELETE CASCADE,
    UNIQUE KEY uk_grupo_curso (codigo_curso, id_ciclo, letra_grupo, tipo_clase),
    INDEX idx_curso_ciclo (codigo_curso, id_ciclo),
    INDEX idx_tipo_clase (tipo_clase)
) ENGINE=InnoDB;

CREATE TABLE horarios (
    id_horario INT AUTO_INCREMENT PRIMARY KEY,
    grupo_id INT NOT NULL,
    numero_salon VARCHAR(10) NOT NULL,
    dia_semana ENUM('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES') NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    id_docente INT NOT NULL,
    estado ENUM('ACTIVO', 'SUSPENDIDO') DEFAULT 'ACTIVO',
    FOREIGN KEY (grupo_id) REFERENCES grupos_curso(grupo_id) ON DELETE CASCADE,
    FOREIGN KEY (numero_salon) REFERENCES salones(numero_salon),
    FOREIGN KEY (id_docente) REFERENCES docentes(id_docente),
    INDEX idx_salon_dia (numero_salon, dia_semana),
    INDEX idx_docente_dia (id_docente, dia_semana),
    INDEX idx_dia_hora (dia_semana, hora_inicio)
) ENGINE=InnoDB;

-- TABLA14 MATRÍCULA 
CREATE TABLE matriculas (
    id_matricula INT AUTO_INCREMENT PRIMARY KEY,
    cui VARCHAR(20) NOT NULL,
    grupo_id INT NOT NULL,
    numero_matricula INT,
    prioridad_matricula BOOLEAN DEFAULT FALSE, -- evitar cruce
    estado_matricula ENUM('ACTIVO', 'RETIRADO', 'ABANDONADO') DEFAULT 'ACTIVO',
    fecha_matricula TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cui) REFERENCES estudiantes(cui) ON DELETE CASCADE,
    FOREIGN KEY (grupo_id) REFERENCES grupos_curso(grupo_id) ON DELETE CASCADE,
    UNIQUE KEY uk_estudiante_grupo (cui, grupo_id),
    INDEX idx_estado (estado_matricula),
    INDEX idx_grupo (grupo_id)
) ENGINE=InnoDB;

-- TABLA15 SÍLABO Y TEMARIO 
CREATE TABLE silabos (
    id_silabo INT AUTO_INCREMENT PRIMARY KEY,
    codigo_curso VARCHAR(20) NOT NULL,
    id_ciclo INT NOT NULL,
    grupo_teoria CHAR(1) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    id_docente INT NOT NULL,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('PENDIENTE', 'APROBADO') DEFAULT 'PENDIENTE',
    FOREIGN KEY (codigo_curso) REFERENCES cursos(codigo_curso) ON DELETE CASCADE,
    FOREIGN KEY (id_ciclo) REFERENCES ciclos_academicos(id_ciclo) ON DELETE CASCADE,
    FOREIGN KEY (id_docente) REFERENCES docentes(id_docente),
    UNIQUE KEY uk_curso_ciclo_grupo (codigo_curso, id_ciclo, grupo_teoria),
    INDEX idx_docente (id_docente)
) ENGINE=InnoDB;

CREATE TABLE unidades (
    unidad_id INT AUTO_INCREMENT PRIMARY KEY,
    id_silabo INT NOT NULL,
    numero_unidad INT NOT NULL,
    nombre_unidad VARCHAR(200) NOT NULL,
    descripcion TEXT,
    FOREIGN KEY (id_silabo) REFERENCES silabos(id_silabo) ON DELETE CASCADE,
    INDEX idx_silabo_unidad (id_silabo, numero_unidad)
) ENGINE=InnoDB;

CREATE TABLE temas (
    id_tema INT AUTO_INCREMENT PRIMARY KEY,
    unidad_id INT NOT NULL,
    numero_tema INT NOT NULL,
    nombre_tema VARCHAR(300) NOT NULL,
    duracion_estimada INT,
    estado ENUM('PENDIENTE', 'EN_CURSO', 'COMPLETADO') DEFAULT 'PENDIENTE',
    fecha_completado DATE NULL,
    FOREIGN KEY (unidad_id) REFERENCES unidades(unidad_id) ON DELETE CASCADE,
    INDEX idx_unidad_numero (unidad_id, numero_tema)
) ENGINE=InnoDB;

-- TABLA18 ASISTENCIA 
CREATE TABLE control_asistencia (
    id_control INT AUTO_INCREMENT PRIMARY KEY,
    id_horario INT NOT NULL,
    fecha DATE NOT NULL,
    hora_apertura TIME NOT NULL,
    hora_cierre TIME NOT NULL,
    estado ENUM('ABIERTO', 'CERRADO') DEFAULT 'ABIERTO',
    FOREIGN KEY (id_horario) REFERENCES horarios(id_horario) ON DELETE CASCADE,
    UNIQUE KEY uk_horario_fecha (id_horario, fecha),
    INDEX idx_fecha_estado (fecha, estado)
) ENGINE=InnoDB;

CREATE TABLE asistencias_docente (
    id_asistencia_docente INT AUTO_INCREMENT PRIMARY KEY,
    id_horario INT NOT NULL,
    id_docente INT NOT NULL,
    fecha DATE NOT NULL,
    hora_registro TIME NOT NULL,
    ip_registro VARCHAR(45) NOT NULL,
    tipo_ubicacion ENUM('PRESENCIAL', 'VIRTUAL') NOT NULL,
    presente BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_horario) REFERENCES horarios(id_horario) ON DELETE CASCADE,
    FOREIGN KEY (id_docente) REFERENCES docentes(id_docente),
    UNIQUE KEY uk_docente_horario_fecha (id_docente, id_horario, fecha),
    INDEX idx_fecha_horario (fecha, id_horario)
) ENGINE=InnoDB;

CREATE TABLE asistencias_estudiante (
    id_asistencia INT AUTO_INCREMENT PRIMARY KEY,
    id_matricula INT NOT NULL,
    id_horario INT NOT NULL,
    fecha DATE NOT NULL,
    estado_asistencia ENUM('PRESENTE', 'FALTA') NOT NULL,
    registrado_por INT NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_matricula) REFERENCES matriculas(id_matricula) ON DELETE CASCADE,
    FOREIGN KEY (id_horario) REFERENCES horarios(id_horario) ON DELETE CASCADE,
    FOREIGN KEY (registrado_por) REFERENCES docentes(id_docente),
    UNIQUE KEY uk_matricula_horario_fecha (id_matricula, id_horario, fecha),
    INDEX idx_fecha_horario (fecha, id_horario)
) ENGINE=InnoDB;

-- TABLA21 NOTAS 
CREATE TABLE notas (
    id_nota INT AUTO_INCREMENT PRIMARY KEY,
    id_matricula INT NOT NULL,
    tipo_eval_id INT NOT NULL,
    calificacion DECIMAL(5,2) CHECK (calificacion >= 0 AND calificacion <= 20),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    docente_registro_id INT,
    FOREIGN KEY (id_matricula) REFERENCES matriculas(id_matricula) ON DELETE CASCADE,
    FOREIGN KEY (tipo_eval_id) REFERENCES tipos_evaluacion(tipo_eval_id),
    FOREIGN KEY (docente_registro_id) REFERENCES docentes(id_docente),
    UNIQUE KEY uk_matricula_evaluacion (id_matricula, tipo_eval_id),
    INDEX idx_matricula (id_matricula),
    INDEX idx_tipo_eval (tipo_eval_id)
) ENGINE=InnoDB;

-- TABLA22 RESERVAS
CREATE TABLE reservas_salon (
    id_reserva INT AUTO_INCREMENT PRIMARY KEY,
    numero_salon VARCHAR(10) NOT NULL,
    id_docente INT NOT NULL,
    dia_semana ENUM('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES') NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    fecha_reserva DATE NOT NULL,
    estado_reserva ENUM('PENDIENTE', 'CONFIRMADA', 'CANCELADA') DEFAULT 'PENDIENTE',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (numero_salon) REFERENCES salones(numero_salon),
    FOREIGN KEY (id_docente) REFERENCES docentes(id_docente),
    INDEX idx_salon_fecha (numero_salon, fecha_reserva),
    INDEX idx_docente_fecha (id_docente, fecha_reserva),
    INDEX idx_estado (estado_reserva)
) ENGINE=InnoDB;

-- TABLA23 REPORTES Y LOGS
CREATE TABLE reportes_generados (
    id_reporte INT AUTO_INCREMENT PRIMARY KEY,
    tipo_reporte ENUM('ASISTENCIA_NOTAS', 'RENDIMIENTO', 'ACADEMICO_COMPLETO') NOT NULL,
    generado_por INT NOT NULL,
    tipo_usuario VARCHAR(20) NOT NULL,
    codigo_curso VARCHAR(20) NULL,
    fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ruta_archivo VARCHAR(500) NULL,
    FOREIGN KEY (generado_por) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (codigo_curso) REFERENCES cursos(codigo_curso) ON DELETE SET NULL,
    INDEX idx_fecha (fecha_generacion),
    INDEX idx_tipo (tipo_reporte)
) ENGINE=InnoDB;

CREATE TABLE log_actividades (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    accion VARCHAR(200) NOT NULL,
    tabla_afectada VARCHAR(100) NULL,
    descripcion TEXT NULL,
    ip_origen VARCHAR(45) NULL,
    fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    INDEX idx_usuario_fecha (id_usuario, fecha_accion),
    INDEX idx_tabla (tabla_afectada),
    INDEX idx_fecha (fecha_accion)
) ENGINE=InnoDB;

-- DATOS INICIALES DEL SISTEMA

-- tipos de usuario
INSERT INTO tipos_usuario (nombre_tipo, descripcion) VALUES
('ESTUDIANTE', 'Usuario estudiante - Ver horarios, notas, asistencia'),
('DOCENTE', 'Usuario docente - Tomar asistencia, subir notas, sílabos'),
('SECRETARIA', 'Personal de secretaría - Matrículas, reportes'),
('ADMINISTRADOR', 'Administrador del sistema - Gestión completa');

-- tipos de aula
INSERT INTO tipos_aula (nombre_tipo, descripcion) VALUES
('AULA', 'Aula tradicional para clases teóricas - Capacidad 40'),
('LABORATORIO', 'Laboratorio de computación - Capacidad 20');

-- tipos de evaluación
INSERT INTO tipos_evaluacion (codigo, nombre, tipo) VALUES
('EP1', 'Evaluación Parcial 1', 'PARCIAL'),
('EP2', 'Evaluación Parcial 2', 'PARCIAL'),
('EP3', 'Evaluación Parcial 3', 'PARCIAL'),
('EC1', 'Evaluación Continua 1', 'CONTINUA'),
('EC2', 'Evaluación Continua 2', 'CONTINUA'),
('EC3', 'Evaluación Continua 3', 'CONTINUA');

-- ciclo académico activo
INSERT INTO ciclos_academicos (
    nombre_ciclo, anio, semestre, 
    fecha_inicio, fecha_fin,
    fecha_inicio_clases, fecha_fin_clases,
    estado
) VALUES (
    '2025B', 2025, 'B',
    '2025-08-25', '2025-12-19',
    '2025-09-01', '2025-12-12',
    'ACTIVO'
);

-- cursos de ejemplo
INSERT INTO cursos (codigo_curso, nombre_curso, tiene_laboratorio, numero_grupos_teoria, numero_grupos_laboratorio) VALUES
('MAT101', 'Matemática Aplicada la Computación', TRUE, 2, 2),
('ING102', 'Inglés I', FALSE, 2, 0),
('CC201', 'Ciencia de la Computación I', TRUE, 2, 3);

-- salones de ejemplo
INSERT INTO salones (numero_salon, tipo_aula_id, capacidad) VALUES
('101', 1, 40), ('102', 1, 40), ('103', 2, 20),
('201', 1, 40), ('202', 1, 40), ('203', 2, 20),
('204', 2, 20), ('301', 2, 20);

-- grupos de curso con capacidades específicas CORREGIDAS
INSERT INTO grupos_curso (codigo_curso, id_ciclo, letra_grupo, tipo_clase, capacidad_maxima) VALUES
('MAT101', 1, 'A', 'TEORIA', 40),
('MAT101', 1, 'A', 'LABORATORIO', 20),
('MAT101', 1, 'B', 'TEORIA', 40),
('MAT101', 1, 'B', 'LABORATORIO', 20),

('ING102', 1, 'A', 'TEORIA', 40),
('ING102', 1, 'B', 'TEORIA', 40),

('CC201', 1, 'A', 'TEORIA', 40),
('CC201', 1, 'A', 'LABORATORIO', 20),
('CC201', 1, 'B', 'TEORIA', 40),
('CC201', 1, 'B', 'LABORATORIO', 20),
('CC201', 1, 'C', 'LABORATORIO', 20);  -- Grupo extra de laboratorio

-- porcentajes de evaluación para MAT101
INSERT INTO porcentajes_evaluacion (codigo_curso, id_ciclo, tipo_eval_id, porcentaje) 
SELECT 'MAT101', 1, tipo_eval_id, 
    CASE codigo 
        WHEN 'EP1' THEN 12.00
        WHEN 'EP2' THEN 12.00
        WHEN 'EP3' THEN 16.00
        WHEN 'EC1' THEN 18.00
        WHEN 'EC2' THEN 18.00
        WHEN 'EC3' THEN 24.00
    END
FROM tipos_evaluacion;


CREATE TABLE alumnos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alumno VARCHAR(100) NOT NULL,
    cont1 INT NOT NULL,
    parcial1 INT NOT NULL,
    cont2 INT NOT NULL,
    parcial2 INT NOT NULL,
    cont3 INT NOT NULL,
    final INT NOT NULL,
    promedio DECIMAL(3,1) NOT NULL,
    estado VARCHAR(20) NOT NULL
);

INSERT INTO alumnos (alumno, cont1, parcial1, cont2, parcial2, cont3, final, promedio, estado) VALUES
('ABENSUR/ROMERO DIEGO DANIEL', 12, 13, 14, 15, 13, 14, 13.5, 'Aprobado'),
('ALCAZAR/MEDINA DIOGO ANDRÉ', 15, 14, 16, 15, 14, 16, 15.0, 'Aprobado'),
('ALVA/CORNEJO JOSE JAVIER', 11, 10, 12, 11, 10, 11, 10.8, 'Desaprobado'),
('CACSIRE/SANCHEZ JHOSEP ANGEL', 13, 14, 15, 14, 16, 15, 14.5, 'Aprobado'),
('CALCINA/MUCHICA SERGIO ELISEO', 14, 15, 13, 14, 15, 16, 14.5, 'Aprobado'),
('CALIZAYA/QUISPE JOSE LUIS', 12, 11, 13, 12, 14, 13, 12.5, 'Aprobado'),
('CAÑAPATAÑA/VARGAS ALEX ENRIQUE', 16, 15, 14, 16, 15, 17, 15.5, 'Aprobado'),
('CARDENAS/VILLAGOMEZ PIERO ADRIANO', 13, 12, 14, 13, 12, 14, 13.0, 'Aprobado'),
('CARI/ALMIRON JOSE RODRIGO', 15, 16, 15, 14, 16, 15, 15.2, 'Aprobado'),
('CASTELO/CHOQUE JOAQUIN ANDREÉ', 11, 12, 10, 11, 12, 11, 11.2, 'Desaprobado'),
('CHAVEZ/MEDINA FERNANDO JESUS', 14, 13, 15, 14, 13, 15, 14.0, 'Aprobado'),
('COLOMA/YUJRA RIKI SANTHER', 12, 13, 11, 12, 13, 12, 12.2, 'Aprobado'),
('CONDORIOS/CHAMBI ANTHONY RICHAR', 16, 17, 15, 16, 17, 16, 16.2, 'Aprobado'),
('CORNEJO/ALVAREZ MAURICIO ANDRES', 13, 14, 12, 13, 14, 13, 13.2, 'Aprobado'),
('CUEVAS/APAZA KATHIA YERARDINE', 15, 14, 16, 15, 14, 16, 15.0, 'Aprobado'),
('DIAZ/VASQUEZ ESDRAS AMADO', 14, 15, 13, 14, 15, 14, 14.2, 'Aprobado'),
('DUEÑAS/MANDAMIENTOS BERLY MIULER', 12, 11, 13, 12, 11, 13, 12.0, 'Aprobado'),
('ESPINOZA/BARRIOS DAVID ALEJANDRO', 15, 16, 14, 15, 16, 15, 15.2, 'Aprobado'),
('ESTEBA/FERIA SOPHIA ALEJANDRA', 17, 16, 18, 17, 16, 18, 17.0, 'Aprobado'),
('GAONA/BRICEÑO LEONARDO GUSTAVO', 13, 14, 12, 13, 14, 13, 13.2, 'Aprobado'),
('GUZMAN/AVALOS VALERIA', 16, 15, 17, 16, 15, 17, 16.0, 'Aprobado'),
('HAÑARI/CUTIPA CESAR ALEJANDRO', 14, 13, 15, 14, 13, 15, 14.0, 'Aprobado'),
('HUAYHUA/CARLOS LENIN MICHAEL', 12, 11, 13, 12, 14, 13, 12.5, 'Aprobado'),
('HUAYHUA/PEREZ ALEXANDER RAGNAR', 15, 14, 16, 15, 14, 16, 15.0, 'Aprobado'),
('HUAYHUA/QUISPE FABRICIO DEL PIERO ERNESTO', 13, 12, 14, 13, 15, 14, 13.5, 'Aprobado'),
('HUERTAS/VALVERDE JOSE JESUS', 11, 10, 12, 11, 10, 12, 11.0, 'Desaprobado'),
('JARA/ARISACA DAYSI', 16, 17, 15, 16, 17, 16, 16.2, 'Aprobado'),
('LAZO/PAXI NATALIE MARLENY', 15, 14, 16, 15, 14, 16, 15.0, 'Aprobado'),
('LOPEZ/ZEGARRA IVAN ALEXANDER', 14, 13, 15, 14, 13, 15, 14.0, 'Aprobado'),
('MEZA/PAREJA ARTHUR PATRICK', 12, 13, 11, 12, 13, 12, 12.2, 'Aprobado'),
('MONTAÑEZ/PACCO RONI EZEQUIEL', 13, 14, 12, 13, 14, 13, 13.2, 'Aprobado'),
('MUÑOZ/CURI GIOMAR DANNY', 15, 16, 14, 15, 16, 15, 15.2, 'Aprobado'),
('OLAZABAL/CHAVEZ NEILL ELVERTH', 14, 15, 13, 14, 15, 14, 14.2, 'Aprobado'),
('PALOMINO/RIVADENEYRA MISAEL JESUS', 16, 15, 17, 16, 15, 17, 16.0, 'Aprobado'),
('PAREDES/MALAGA JOSE CARLOS', 13, 12, 14, 13, 12, 14, 13.0, 'Aprobado'),
('PAXI/HUAYHUA LEONARDO ADRIANO', 15, 14, 16, 15, 14, 16, 15.0, 'Aprobado'),
('POCO/CHIRE JAFET JOEL', 12, 13, 11, 12, 13, 12, 12.2, 'Aprobado'),
('POSTIGO/CABANA JUAN CARLOS', 14, 13, 15, 14, 13, 15, 14.0, 'Aprobado'),
('QUINA/DELGADO MARCELO ADRIAN', 11, 10, 12, 11, 10, 11, 10.8, 'Desaprobado'),
('QUINTEROS/CONDORI JESUS SALVADOR', 13, 14, 12, 13, 14, 13, 13.2, 'Aprobado'),
('RIVAS/ABRIL JORGE AARON', 15, 16, 14, 15, 16, 15, 15.2, 'Aprobado'),
('RIVERA/CRUZ DIEGO BENJAMIN', 14, 15, 13, 14, 15, 14, 14.2, 'Aprobado'),
('RIVERA/TORRES JOSE ALBERTO', 12, 11, 13, 12, 11, 13, 12.0, 'Aprobado'),
('SALAZAR/ÑAUPA BRAYAN RONALDO', 16, 15, 17, 16, 15, 17, 16.0, 'Aprobado'),
('SOTO/HUERTA ANGELA SHIRLETH', 14, 15, 13, 14, 15, 16, 14.5, 'Aprobado'),
('SUPO/MOLINA GERALD STEVE', 13, 14, 12, 13, 14, 13, 13.2, 'Aprobado'),
('TAIPE/HUANCA CRISTHIAN LUIS', 15, 14, 16, 15, 14, 16, 15.0, 'Aprobado'),
('TAQUIRI/GUERREROS JORGE PATRICK', 12, 13, 11, 12, 13, 12, 12.2, 'Aprobado'),
('TICONA/PEREYRA ERIKA DAYSI', 17, 16, 18, 17, 16, 18, 17.0, 'Aprobado'),
('TORRES/ARA ALBERTO GABRIEL', 14, 13, 15, 14, 13, 15, 14.0, 'Aprobado'),
('TORRES/BARRA JAIR DAVID', 13, 12, 14, 13, 15, 14, 13.5, 'Aprobado'),
('ZAPANA/PARIAPAZA GONZALO RODRIGO', 15, 16, 14, 15, 16, 15, 15.2, 'Aprobado'),
('ZENAYUCA/CORIMANYA KATHERIN MILAGROS', 11, 12, 13, 10, 11, 12, 11.5, 'Desaprobado');


CREATE TABLE asistencia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alumno_id INT NOT NULL,
    fecha DATE NOT NULL,
    estado ENUM('Presente', 'Ausente') NOT NULL,
    profesor VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(100),
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (alumno_id) REFERENCES alumnos(id)
);

