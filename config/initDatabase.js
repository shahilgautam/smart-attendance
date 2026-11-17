const { initializePool, getPool } = require('./db');
const bcrypt = require('bcrypt');

async function ensureColumn(db, table, column, definition) {
    const [rows] = await db.query(
        `SELECT COUNT(*) AS count FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [table, column]
    );
    if (!rows[0].count) await db.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
}

async function initializeDatabase() {
    console.log('Initializing local MySQL database…');
    await initializePool();
    const db = getPool();

    await db.query(`CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL,
        username VARCHAR(50) NOT NULL UNIQUE, email VARCHAR(100), password VARCHAR(255) NOT NULL,
        role ENUM('Super Admin','Admin') DEFAULT 'Admin', status ENUM('Active','Inactive') DEFAULT 'Active',
        last_login DATETIME NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`);

    await db.query(`CREATE TABLE IF NOT EXISTS employees (
        id INT AUTO_INCREMENT PRIMARY KEY, employee_code VARCHAR(20) UNIQUE,
        name VARCHAR(100), department VARCHAR(100), designation VARCHAR(100), email VARCHAR(100),
        phone VARCHAR(20), gender ENUM('Male','Female','Other'), address VARCHAR(255), photo VARCHAR(255),
        face_embedding LONGTEXT, face_descriptor LONGTEXT, status ENUM('Active','Inactive') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`);
    await ensureColumn(db, 'employees', 'address', 'VARCHAR(255) NULL');
    await ensureColumn(db, 'employees', 'face_descriptor', 'LONGTEXT NULL');

    await db.query(`CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY, employee_id INT NOT NULL, attendance_date DATE NOT NULL,
        check_in TIME NULL, check_out TIME NULL, working_hours TIME NULL, late_minutes INT DEFAULT 0,
        status ENUM('Present','Absent','Late') DEFAULT 'Present', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_attendance_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        UNIQUE KEY unique_employee_attendance_day (employee_id, attendance_date)
    ) ENGINE=InnoDB`);

    // Existing installations may use system_settings or attendance_settings.
    // Normalize any historical duplicate day rows before adding the unique guard.
    const [attendanceTable] = await db.query(`SELECT COUNT(*) AS count FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'attendance'`);
    if (attendanceTable[0].count) {
        const [duplicates] = await db.query(`SELECT COUNT(*) AS count FROM (
            SELECT employee_id, attendance_date FROM attendance
            GROUP BY employee_id, attendance_date HAVING COUNT(*) > 1
        ) duplicate_days`);
        const [uniqueIndex] = await db.query(`SELECT COUNT(*) AS count FROM information_schema.STATISTICS
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'attendance' AND INDEX_NAME = 'unique_employee_attendance_day'`);
        if (!uniqueIndex[0].count && !duplicates[0].count) {
            await db.query(`ALTER TABLE attendance ADD UNIQUE KEY unique_employee_attendance_day (employee_id, attendance_date)`);
        } else if (duplicates[0].count) {
            console.warn('Existing duplicate attendance days found; records were preserved. Clean duplicates manually before adding the unique index.');
        }
    }

    await db.query(`CREATE TABLE IF NOT EXISTS attendance_settings (
        id INT PRIMARY KEY, office_start TIME NOT NULL DEFAULT '09:00:00',
        late_after TIME NOT NULL DEFAULT '09:15:00', office_end TIME NOT NULL DEFAULT '18:00:00'
    ) ENGINE=InnoDB`);
    await db.query(`INSERT INTO attendance_settings (id, office_start, late_after, office_end)
        VALUES (1, '09:00:00', '09:15:00', '18:00:00') ON DUPLICATE KEY UPDATE id = id`);
    // Preserve settings from the earlier project schema, which called this table system_settings.
    const [legacySettingsTable] = await db.query(`SELECT COUNT(*) AS count FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'system_settings'`);
    if (legacySettingsTable[0].count) {
        const [legacySettings] = await db.query('SELECT office_start, late_after, office_end FROM system_settings ORDER BY id LIMIT 1');
        if (legacySettings.length && legacySettings[0].office_start && legacySettings[0].late_after && legacySettings[0].office_end) {
            await db.query(`UPDATE attendance_settings SET office_start = ?, late_after = ?, office_end = ? WHERE id = 1`,
                [legacySettings[0].office_start, legacySettings[0].late_after, legacySettings[0].office_end]);
        }
    }

    const [admins] = await db.query('SELECT id FROM admins WHERE username = ?', ['admin']);
    if (!admins.length) {
        const password = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
        const hash = await bcrypt.hash(password, 12);
        await db.query(`INSERT INTO admins (name, username, email, password, role) VALUES (?, ?, ?, ?, ?)`,
            ['Super Admin', 'admin', process.env.DEFAULT_ADMIN_EMAIL || 'admin@localhost', hash, 'Super Admin']);
        console.log('Default admin created (username: admin). Change its password after first login.');
    }
    console.log('Database schema is ready.');
}

module.exports = initializeDatabase;
