-- =========================================================
-- SMART ATTENDANCE SYSTEM
-- Complete Database Setup
-- =========================================================

-- ---------------------------------------------------------
-- 1. CREATE DATABASE
-- ---------------------------------------------------------

CREATE DATABASE IF NOT EXISTS smart_attendance;

USE smart_attendance;


-- ---------------------------------------------------------
-- 2. DROP TABLES
-- Drop child table first because of foreign key
-- ---------------------------------------------------------

DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS attendance_settings;
DROP TABLE IF EXISTS system_settings;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS admins;


-- ---------------------------------------------------------
-- 3. ADMINS TABLE
-- ---------------------------------------------------------

CREATE TABLE admins (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) DEFAULT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('Super Admin', 'Admin') DEFAULT 'Admin',
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    last_login DATETIME DEFAULT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY username (username)
);


-- ---------------------------------------------------------
-- 4. EMPLOYEES TABLE
-- Must be created before ATTENDANCE
-- ---------------------------------------------------------

CREATE TABLE employees (
    id INT NOT NULL AUTO_INCREMENT,
    employee_code VARCHAR(20) DEFAULT NULL,
    name VARCHAR(100) DEFAULT NULL,
    department VARCHAR(100) DEFAULT NULL,
    designation VARCHAR(100) DEFAULT NULL,
    email VARCHAR(100) DEFAULT NULL,
    phone VARCHAR(20) DEFAULT NULL,

    gender ENUM('Male', 'Female', 'Other') DEFAULT NULL,

    photo VARCHAR(255) DEFAULT NULL,

    face_embedding LONGTEXT DEFAULT NULL,
    face_descriptor LONGTEXT DEFAULT NULL,

    status ENUM('Active', 'Inactive') DEFAULT 'Active',

    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY employee_code (employee_code)
);


-- ---------------------------------------------------------
-- 5. ATTENDANCE SETTINGS TABLE
-- ---------------------------------------------------------

CREATE TABLE attendance_settings (
    id INT NOT NULL AUTO_INCREMENT,

    office_start_time TIME NOT NULL DEFAULT '09:00:00',
    office_end_time TIME NOT NULL DEFAULT '18:00:00',

    late_after_minutes INT NOT NULL DEFAULT 15,

    working_minutes INT NOT NULL DEFAULT 540,

    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id)
);


-- ---------------------------------------------------------
-- 6. INSERT DEFAULT ATTENDANCE SETTINGS
-- ---------------------------------------------------------

INSERT INTO attendance_settings (
    id,
    office_start_time,
    office_end_time,
    late_after_minutes,
    working_minutes
)
VALUES (
    1,
    '09:00:00',
    '18:00:00',
    15,
    540
);


-- ---------------------------------------------------------
-- 7. ATTENDANCE TABLE
-- Depends on EMPLOYEES
-- ---------------------------------------------------------

CREATE TABLE attendance (
    id INT NOT NULL AUTO_INCREMENT,

    employee_id INT DEFAULT NULL,

    attendance_date DATE DEFAULT NULL,

    check_in TIME DEFAULT NULL,
    check_out TIME DEFAULT NULL,

    working_hours TIME DEFAULT NULL,

    late_minutes INT DEFAULT 0,

    status ENUM('Present', 'Absent', 'Late') DEFAULT NULL,

    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    KEY employee_id (employee_id),

    CONSTRAINT attendance_ibfk_1
        FOREIGN KEY (employee_id)
        REFERENCES employees (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);


-- ---------------------------------------------------------
-- 8. SYSTEM SETTINGS TABLE
-- ---------------------------------------------------------

CREATE TABLE system_settings (
    id INT NOT NULL AUTO_INCREMENT,

    office_start TIME DEFAULT NULL,
    late_after TIME DEFAULT NULL,
    office_end TIME DEFAULT NULL,

    PRIMARY KEY (id)
);


-- ---------------------------------------------------------
-- 9. VERIFY TABLES
-- ---------------------------------------------------------

SHOW TABLES;


-- ---------------------------------------------------------
-- 10. VERIFY ATTENDANCE SETTINGS
-- ---------------------------------------------------------

SELECT * FROM attendance_settings;


-- ---------------------------------------------------------
-- 11. VERIFY EMPLOYEES TABLE
-- ---------------------------------------------------------

SELECT * FROM employees;


-- ---------------------------------------------------------
-- 12. VERIFY ATTENDANCE TABLE
-- ---------------------------------------------------------

SELECT * FROM attendance;