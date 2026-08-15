const { initializePool, getPool } = require("./db");
const bcrypt = require("bcrypt");

async function initializeDatabase() {
    try {
        console.log("🔄 Initializing Database...");

        await initializePool();
        const db = getPool();

        // Admins table
        await db.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100),
                password VARCHAR(255) NOT NULL,
                role ENUM('Super Admin','Admin') DEFAULT 'Admin',
                status ENUM('Active','Inactive') DEFAULT 'Active',
                last_login DATETIME NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        console.log("✅ Admins table ready");

        // Employees table
        await db.query(`
            CREATE TABLE IF NOT EXISTS employees (
                id INT AUTO_INCREMENT PRIMARY KEY,
                employee_code VARCHAR(20) UNIQUE,
                name VARCHAR(100),
                department VARCHAR(100),
                designation VARCHAR(100),
                email VARCHAR(100),
                phone VARCHAR(20),
                gender ENUM('Male','Female','Other'),
                photo VARCHAR(255),
                face_embedding LONGTEXT,
                status ENUM('Active','Inactive') DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        console.log("✅ Employees table ready");

        // Attendance table
        await db.query(`
            CREATE TABLE IF NOT EXISTS attendance (
                id INT AUTO_INCREMENT PRIMARY KEY,
                employee_id INT,
                attendance_date DATE,
                check_in TIME,
                check_out TIME,
                working_hours TIME,
                late_minutes INT DEFAULT 0,
                status ENUM('Present','Absent','Late'),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (employee_id) REFERENCES employees(id)
            )
        `);

        console.log("✅ Attendance table ready");

        // Seed default admin
        const [rows] = await db.query(
            "SELECT id FROM admins WHERE username = ?",
            ["admin"]
        );

        if (rows.length === 0) {
            const hashedPassword = await bcrypt.hash("admin123", 10);

            await db.query(
                `INSERT INTO admins
                (name, username, email, password, role)
                VALUES (?, ?, ?, ?, ?)`,
                [
                    "Super Admin",
                    "admin",
                    "admin@gmail.com",
                    hashedPassword,
                    "Super Admin"
                ]
            );

            console.log("✅ Default Admin Created");
        } else {
            console.log("ℹ️ Default Admin Already Exists");
        }

        console.log("🎉 Database Ready");

    } catch (err) {
        console.error("❌ Database Initialization Failed");
        console.error(err);
    }
}

module.exports = initializeDatabase;