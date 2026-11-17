const { getPool } = require("../config/db");

exports.getEmployees = async (req, res) => {
    try {

        const pool = getPool();

        const [rows] = await pool.query(`
    SELECT
        id,
        employee_code,
        name,
        department,
        designation,
        photo
    FROM employees
    WHERE status = 'Active'
      AND photo IS NOT NULL
      AND photo <> ''
`);

        res.json({
            success: true,
            employees: rows
        });

    } catch (err) {

        console.error("Recognition API Error:", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};