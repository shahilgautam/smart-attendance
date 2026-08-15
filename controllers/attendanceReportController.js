const { getPool } = require("../config/db");

exports.getAttendanceReport = async (req, res) => {
    try {

        const pool = getPool();

        const [rows] = await pool.query(`
            SELECT
                a.id,
                e.employee_code,
                e.name,
                e.department,
                a.attendance_date,
                a.check_in,
                a.check_out,
                a.status
            FROM attendance a
            JOIN employees e
                ON a.employee_id = e.id
            ORDER BY
                a.attendance_date DESC,
                a.check_in DESC
        `);

        res.json({
            success: true,
            records: rows
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};