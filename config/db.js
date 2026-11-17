const mysql = require('mysql2/promise');
require('dotenv').config();
let pool;

async function initializePool() {
    if (pool) return pool;
    const host = process.env.DB_HOST || '127.0.0.1';
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    const database = process.env.DB_NAME || 'smart_attendance';
    const connection = await mysql.createConnection({ host, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database.replace(/`/g, '')}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.end();
    pool = mysql.createPool({ host, user, password, database, waitForConnections: true, connectionLimit: 10, queueLimit: 0, dateStrings: true });
    await pool.query('SELECT 1');
    console.log(`Connected to local MySQL database: ${database}`);
    return pool;
}
function getPool() {
    if (!pool) throw new Error('Database pool has not been initialized.');
    return pool;
}
module.exports = { initializePool, getPool };
