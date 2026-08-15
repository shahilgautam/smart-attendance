const mysql = require("mysql2/promise");
require("dotenv").config();

let pool = null;

// Initialize MySQL Database and Connection Pool
async function initializePool() {
    // If pool already exists, don't recreate it
    if (pool) {
        return pool;
    }

    // Connect to MySQL Server
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    });

    console.log("✅ Connected to MySQL Server");

    // Create Database if it doesn't exist
    await connection.query(
        `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``
    );

    console.log(`✅ Database '${process.env.DB_NAME}' Ready`);

    await connection.end();

    // Create Connection Pool
    pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    console.log("✅ Connection Pool Ready");

    return pool;
}

// Get Connection Pool
function getPool() {
    if (!pool) {
        throw new Error("Database pool has not been initialized.");
    }

    return pool;
}

module.exports = {
    initializePool,
    getPool
};