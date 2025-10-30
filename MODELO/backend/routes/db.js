const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'angela0505', 
    password: '1234',
    database: 'lumina_db'
});

db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
});

module.exports = db;