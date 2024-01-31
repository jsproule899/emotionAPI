const mysql = require('mysql');
require('dotenv').config();

const dbPool = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DB_PORT,
    charset: 'utf8mb4_unicode_ci',
    multipleStatements: true
})

dbPool.getConnection((err, conn) => {
    if (err) return console.log('\x1b[31m', 'Database not connected, please start the DB server', '\x1b[0m');
    console.log('\x1b[32m', "db status:" + conn.state, '\x1b[0m');
    conn.release();
})

module.exports = dbPool;
