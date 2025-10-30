# 🎓 LUMINA – Sistema de Gestión Universitaria  
## 🔐 Módulo de Autenticación UNSA

Plataforma web orientada a la Universidad Nacional de San Agustín para la gestión académica integral.  
Este módulo implementa el sistema de **inicio de sesión y autenticación de usuarios**.

---

## 🚀 Características

✅ Interfaz moderna y responsive  
✅ Validación de credenciales  
✅ Mensajes de error personalizados  
✅ Sistema de roles (Estudiante, Docente, Administración, Secretaría)  
✅ Simulación de base de datos para pruebas  
✅ Estructura lista para integrar con **Java + MySQL**

---

## 🛠️ Instalación

1. Descargar el proyecto
2. Guardarlo en tu servidor local (**XAMPP**, **WAMP**, **Tomcat**, etc.)
3. Abrir `index.html` en el navegador

> *Próxima versión:* conexión directa al backend Java + MySQL

---

## 👤 Usuarios de Prueba

| Usuario | Contraseña | Rol |
|--------|-----------|-----|
| asotohu@unsa.edu.pe | password123 | Profesor |
| dabensur@unsa.edu.pe | password123 | Administración |

---

## 🧠 Arquitectura del Proyecto

- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Java (Servlets / JDBC)  
- **Base de Datos:** MySQL  
- **Modelo:** MVC + Stored Procedures + Vistas

---

## 📁 Estructura y Responsabilidades del Equipo  

### ✨ Secretaría Académica – *Kathia*
- Creación de tablas y triggers para gestión académica  
- Desarrollo de interfaces HTML del módulo de Secretaría  
- Conexión base de datos ↔ Java ↔ interfaz  

### 🛡 Administración – *Angela - Daysi*
- Stored Procedures en MySQL  
- Interfaces HTML del módulo administrativo  
- Implementación de funcionalidades Java  

### 👨‍🏫 Profesor – *Angela*
- Tablas y vistas para gestión docente  
- Interfaces HTML del módulo Profesor  
- Funciones Java para notas, asistencia y reportes  

### 🎓 Estudiante – *Katherin*
- Revisión de conexiones y tablas complementarias  
- Interfaces HTML del módulo Estudiante  
- Controladores Java conectando BD e interfaz  

---

## 👥 Integrantes

| Integrante | Rol |
|-----------|------|
| CUEVAS APAZA, KATHIA YERARDINE | Secretaría Académica |
| JARA ARISACA, DAYSI | Administración |
| SOTO HUERTA, ANGELA SHIRLETH | Profesor |
| ZENAYUCA CORIMANYA, KATHERIN MILAGROS | Estudiante |

---

## 🌟 Objetivo del Proyecto
Desarrollar un sistema universitario modular, integrando  
**autenticación, gestión académica, docente y estudiantil**,  
con buenas prácticas y arquitectura escalable.

---

## 📌 Próximas mejoras
- Integración completa con **Java + MySQL**
- Panel de control por rol
- Historial académico en tiempo real
- Notificaciones internas
- Exportación a PDF

---

> 💬 *"La tecnología transforma la educación; nosotros construimos ese puente."*

