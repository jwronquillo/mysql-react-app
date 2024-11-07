const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASS,
    database: process.env.DATABASE,
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to the database.');
});

module.exports = db;