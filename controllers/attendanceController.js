const { getPool } = require("../config/db");


// =====================================================
// CONVERT TIME TO MINUTES
// =====================================================

function timeToMinutes(time) {

    if (!time) {
        return 0;
    }

    const timeString = String(time);

    const [hours, minutes] =
        timeString
            .split(":")
            .map(Number);

    return (hours * 60) + minutes;
}


// =====================================================
// MARK ATTENDANCE
// =====================================================

exports.markAttendance = async (req, res) => {

    try {

        const { employee_id } = req.body;


        // =====================================================
        // VALIDATE EMPLOYEE ID
        // =====================================================

        if (!employee_id) {

            return res.status(400).json({

                success: false,

                message: "Employee ID is required"

            });

        }


        const pool = getPool();


        // =====================================================
        // CHECK EMPLOYEE
        // =====================================================

        const [employeeRows] = await pool.query(

            `SELECT
                id,
                name,
                status
             FROM employees
             WHERE id = ?`,

            [employee_id]

        );


        if (employeeRows.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Employee not found"

            });

        }


        const employee = employeeRows[0];


        // =====================================================
        // CHECK EMPLOYEE STATUS
        // =====================================================

        if (employee.status !== "Active") {

            return res.status(403).json({

                success: false,

                message: "Employee is not active"

            });

        }


        // =====================================================
        // GET TODAY'S ATTENDANCE
        // =====================================================

        const [existing] = await pool.query(

            `SELECT *
             FROM attendance
             WHERE employee_id = ?
             AND attendance_date = CURDATE()`,

            [employee_id]

        );


        // =====================================================
        // GET ATTENDANCE SETTINGS
        // =====================================================

        const [settingsRows] = await pool.query(

            `SELECT
                late_after
             FROM attendance_settings
             ORDER BY id DESC
             LIMIT 1`

        );


        if (settingsRows.length === 0) {

            return res.status(500).json({

                success: false,

                message: "Attendance settings are not configured"

            });

        }


        const settings = settingsRows[0];


        // =====================================================
        // FIRST SCAN → CHECK-IN
        // =====================================================

        if (existing.length === 0) {


            // Get current time safely
            const [timeRows] = await pool.query(

                `SELECT CURTIME() AS scanTime`

            );


            const currentTime =
                timeRows[0].scanTime;


            const currentMinutes =
                timeToMinutes(currentTime);


            const lateAfterMinutes =
                timeToMinutes(settings.late_after);


            // -----------------------------------------------
            // DETERMINE STATUS
            // -----------------------------------------------

            let attendanceStatus = "Present";


            if (currentMinutes >= lateAfterMinutes) {

                attendanceStatus = "Late";

            }


            // -----------------------------------------------
            // INSERT CHECK-IN
            // -----------------------------------------------

            await pool.query(

                `INSERT INTO attendance
                (
                    employee_id,
                    attendance_date,
                    check_in,
                    status
                )
                VALUES
                (
                    ?,
                    CURDATE(),
                    CURTIME(),
                    ?
                )`,

                [

                    employee_id,

                    attendanceStatus

                ]

            );


            return res.json({

                success: true,

                action: "check_in",

                status: attendanceStatus,

                message:

                    attendanceStatus === "Late"

                        ? "Late Check-In successful"

                        : "Check-In successful"

            });

        }


        // =====================================================
        // EXISTING ATTENDANCE
        // =====================================================

        const attendance =
            existing[0];


        // =====================================================
        // ALREADY CHECKED OUT
        // =====================================================

        if (attendance.check_out) {

            return res.json({

                success: false,

                action: "completed",

                message:
                    "Attendance already completed for today"

            });

        }


        // =====================================================
        // CHECKOUT PROTECTION
        // Minimum 5 minutes after check-in
        // =====================================================

        const [timeDifferenceRows] = await pool.query(

            `SELECT
                TIMESTAMPDIFF(
                    MINUTE,
                    check_in,
                    CURTIME()
                ) AS minutes_passed
             FROM attendance
             WHERE id = ?`,

            [attendance.id]

        );


        const minutesPassed =
            Number(
                timeDifferenceRows[0].minutes_passed
            );


        if (minutesPassed < 5) {

            const remainingMinutes =
                5 - minutesPassed;


            return res.json({

                success: false,

                action: "waiting",

                message:

                    `Check-out is available after 5 minutes. ` +

                    `Please wait ${remainingMinutes} more minute(s).`

            });

        }


        // =====================================================
        // CHECK-OUT
        // =====================================================

        await pool.query(

            `UPDATE attendance
             SET
                check_out = CURTIME(),
                working_hours =
                    TIMEDIFF(
                        CURTIME(),
                        check_in
                    )
             WHERE id = ?`,

            [attendance.id]

        );


        return res.json({

            success: true,

            action: "check_out",

            message:
                "Check-Out successful"

        });

    }


    catch (err) {

        console.error(

            "Attendance Error:",

            err

        );


        if (err && err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'Attendance has already been recorded for this employee today. Refresh and check the current status.' });
        }
        return res.status(500).json({
            success: false,
            message: 'Unable to record attendance. Check the server log for details.'
        });

    }

};