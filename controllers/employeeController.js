const { getPool } = require("../config/db");
const { getEmployeeList } = require("../models/employeeModel");

const fs = require("fs");
const path = require("path");
// ===========================
// Get All Employees
// ===========================
exports.getEmployees = async (req, res) => {

    try {

        const pool = getPool();

        const [rows] = await pool.query(
            "SELECT * FROM employees ORDER BY id DESC"
        );

        res.json({
            success: true,
            data: rows
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

// ===========================
// Add Employee
// ===========================
exports.addEmployee = async (req, res) => {

    try {

        const pool = getPool();

        const {
    employee_code,
    name,
    department,
    designation,
    email,
    phone,
    address
} = req.body;
        await pool.query(

            `INSERT INTO employees
(employee_code, name, department, designation, email, phone, address)
VALUES (?, ?, ?, ?, ?, ?, ?)`,

           [
    employee_code,
    name,
    department,
    designation,
    email,
    phone,
    address
]

        );

        res.json({
            success: true,
            message: "Employee Added Successfully"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

// ===========================
// Delete Employee
// ===========================

exports.deleteEmployee = async (req, res) => {

    try {

        const pool = getPool();

        const { id } = req.params;


        // =====================================
        // GET EMPLOYEE PHOTO BEFORE DELETE
        // =====================================

        const [employeeRows] = await pool.query(

            `SELECT photo
             FROM employees
             WHERE id = ?`,

            [id]

        );


        if (employeeRows.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Employee not found"

            });

        }


        const photo = employeeRows[0].photo;


        // =====================================
        // DELETE EMPLOYEE FROM DATABASE
        // =====================================

        await pool.query(

            "DELETE FROM employees WHERE id = ?",

            [id]

        );


        // =====================================
        // DELETE PHOTO FILE
        // =====================================

        if (photo) {

            const photoPath = path.join(

                __dirname,
                "..",
                "public",
                photo.replace(/^\/+/, "")

            );


            if (fs.existsSync(photoPath)) {

                fs.unlinkSync(photoPath);

                console.log(

                    "Photo deleted:",

                    photoPath

                );

            }

            else {

                console.log(

                    "Photo file not found:",

                    photoPath

                );

            }

        }


        res.json({

            success: true,

            message:

                "Employee and photo deleted successfully"

        });

    }

    catch (err) {

        console.error(

            "Delete Employee Error:",

            err

        );


        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

// ===========================
// Update Employee
// ===========================

exports.updateEmployee = async (req, res) => {

    try {

        const pool = getPool();

        const { id } = req.params;

        const {
            employee_code,
            name,
            department,
            designation,
            email,
            phone
        } = req.body;


        await pool.query(

            `UPDATE employees
             SET
                employee_code = ?,
                name = ?,
                department = ?,
                designation = ?,
                email = ?,
                phone = ?
             WHERE id = ?`,

            [
                employee_code,
                name,
                department,
                designation,
                email,
                phone,
                id
            ]

        );


        res.json({

            success: true,

            message: "Employee Updated Successfully"

        });

    }

    catch (err) {

        console.error(

            "Update Employee Error:",

            err

        );


        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

// ===========================
// Get Employee Profile
// ===========================

exports.getEmployeeProfile = async (req, res) => {

    try {

        const pool = getPool();

        const { id } = req.params;


        // =========================
        // Get Employee Details
        // =========================

        const [employeeRows] = await pool.query(

            `SELECT
                id,
                employee_code,
                name,
                department,
                designation,
                email,
                phone,
                status,
                photo
             FROM employees
             WHERE id = ?`,

            [id]

        );


        if (employeeRows.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Employee not found."

            });

        }


        // =========================
        // Attendance Summary
        // =========================

        const [summaryRows] = await pool.query(

    `SELECT

        COALESCE(SUM(
    CASE
        WHEN status IN ('Present', 'Late')
        THEN 1
        ELSE 0
    END
), 0) AS present,

        COALESCE(SUM(
            CASE
                WHEN status = 'Late'
                THEN 1
                ELSE 0
            END
        ), 0) AS late,

        COALESCE(SUM(
            CASE
                WHEN status = 'Absent'
                THEN 1
                ELSE 0
            END
        ), 0) AS absent,

        COUNT(*) AS total

     FROM attendance

     WHERE employee_id = ?`,

    [id]

);
        // =========================
        // Attendance History
        // =========================

        const [attendanceRows] = await pool.query(

            `SELECT

                attendance_date,

                check_in,

                check_out,

                status

             FROM attendance

             WHERE employee_id = ?

             ORDER BY attendance_date DESC

             LIMIT 10`,

            [id]

        );


        // =========================
        // Final Response
        // =========================
        
        console.log("SUMMARY DATA:", summaryRows[0]);
        console.log("ATTENDANCE HISTORY:", attendanceRows);
        res.json({

            success: true,

            employee: employeeRows[0],

            attendance: {

                present:

                    summaryRows[0].present || 0,

                late:

                    summaryRows[0].late || 0,

                absent:

                    summaryRows[0].absent || 0,

                total:

                    summaryRows[0].total || 0,

                history:

                    attendanceRows

            }

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

// ===========================
// Employee List
// ===========================

async function employeeList(req, res) {

    try {

        const employees = await getEmployeeList();

        res.json({

            success: true,

            data: employees

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: "Failed to load employees."

        });

    }

}
exports.employeeList = employeeList;