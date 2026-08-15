const { getPool } = require("../config/db");

// ======================================
// Convert HH:MM:SS to minutes
// ======================================

function timeToMinutes(time) {
    if (!time) return 0;

    const [hours, minutes] = String(time)
        .split(":")
        .map(Number);

    return (hours * 60) + minutes;
}

// ======================================
// Mark Attendance
// ======================================

exports.markAttendance = async (req, res) => {

    try {

        const { employee_id } = req.body;

        if (!employee_id) {
            return res.status(400).json({
                success: false,
                message: "Employee ID is required"
            });
        }

        const pool = getPool();

        // ======================================
        // Employee
        // ======================================

        const [employeeRows] = await pool.query(
            `SELECT id,name,status
             FROM employees
             WHERE id=?`,
            [employee_id]
        );

        if (employeeRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        const employee = employeeRows[0];

        if (employee.status !== "Active") {
            return res.status(403).json({
                success: false,
                message: "Employee is not active"
            });
        }

        // ======================================
        // Existing attendance
        // ======================================

        const [existing] = await pool.query(
            `SELECT *
             FROM attendance
             WHERE employee_id=?
             AND attendance_date=CURDATE()`,
            [employee_id]
        );

        // ======================================
        // Attendance Settings
        // ======================================

        const [settingsRows] = await pool.query(`
            SELECT
                office_start_time,
                office_end_time,
                late_after_minutes,
                working_minutes
            FROM attendance_settings
            ORDER BY id DESC
            LIMIT 1
        `);

        if (settingsRows.length === 0) {
            return res.status(500).json({
                success: false,
                message: "Attendance settings not found."
            });
        }

        const settings = settingsRows[0];
        console.log("===== Attendance Settings =====");
        console.log(settings);
        console.log("office_start_time:", settings.office_start_time);
        console.log("late_after_minutes:", settings.late_after_minutes);
        console.log("===============================");

        // ======================================
        // First Scan = Check In
        // ======================================

        if (existing.length === 0) {

            const [timeRows] = await pool.query(
                `SELECT CURTIME() AS currentTime`
            );

            const currentTime = timeRows[0].currentTime;

            const currentMinutes = timeToMinutes(currentTime);

            const officeStartMinutes =
                timeToMinutes(settings.office_start_time);

            const lateThreshold =
                officeStartMinutes +
                Number(settings.late_after_minutes);

            let status = "Present";
            let lateMinutes = 0;

            if (currentMinutes > lateThreshold) {
                status = "Late";
                lateMinutes = currentMinutes - lateThreshold;
            }

            console.log("Current:", currentTime);
            console.log("Office Start:", settings.office_start_time);
            console.log("Late Threshold:", lateThreshold);
            console.log("Status:", status);
            console.log("Late Minutes:", lateMinutes);

            await pool.query(

                `INSERT INTO attendance
                (
                    employee_id,
                    attendance_date,
                    check_in,
                    status,
                    late_minutes
                )
                VALUES
                (
                    ?,
                    CURDATE(),
                    CURTIME(),
                    ?,
                    ?
                )`,

                [
                    employee_id,
                    status,
                    lateMinutes
                ]

            );

            return res.json({

                success: true,

                action: "check_in",

                status,

                message:
                    status === "Late"
                        ? "Late Check-In Successful"
                        : "Check-In Successful"

            });

        }

        // ======================================
        // Check Out
        // ======================================

        const attendance = existing[0];

        if (attendance.check_out) {

            return res.json({

                success: false,

                action: "completed",

                message: "Attendance already completed."

            });

        }

        // ======================================
        // Minimum 5 minutes
        // ======================================

        const [diffRows] = await pool.query(

            `SELECT
                TIMESTAMPDIFF(
                    MINUTE,
                    check_in,
                    CURTIME()
                ) AS worked
             FROM attendance
             WHERE id=?`,

            [attendance.id]

        );

        const worked = Number(diffRows[0].worked);

        if (worked < 5) {

            return res.json({

                success: false,

                action: "waiting",

                message:
                    `Please wait ${5 - worked} minute(s) before Check-Out.`

            });

        }

        // ======================================
        // Update Check Out
        // ======================================

        await pool.query(

            `UPDATE attendance
             SET
                check_out = CURTIME(),
                working_hours = TIMEDIFF(CURTIME(), check_in)
             WHERE id=?`,

            [attendance.id]

        );

        return res.json({

            success: true,

            action: "check_out",

            message: "Check-Out Successful"

        });

    }

    catch (err) {

        console.error("Attendance Error:", err);

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};