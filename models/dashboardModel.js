const { getPool } = require("../config/db");


// =====================================================
// DASHBOARD STATISTICS
// =====================================================

async function getDashboardStats() {

    const db = getPool();


    // Total active employees
    const [employees] = await db.query(

        `SELECT COUNT(*) AS totalEmployees
         FROM employees
         WHERE status = 'Active'`

    );


    // Present = Present + Late
    const [present] = await db.query(

        `SELECT COUNT(*) AS presentToday
         FROM attendance
         WHERE attendance_date = CURDATE()
         AND status IN ('Present', 'Late')`

    );


    // Absent employees
    const [absent] = await db.query(

`SELECT COUNT(*) AS absentToday
 FROM employees
 WHERE status = 'Active'
 AND id NOT IN (
     SELECT employee_id
     FROM attendance
     WHERE attendance_date = CURDATE()
 )`

);


    // Late employees
    const [late] = await db.query(

        `SELECT COUNT(*) AS lateToday
         FROM attendance
         WHERE attendance_date = CURDATE()
         AND status = 'Late'`

    );


    return {

        totalEmployees:
            employees[0].totalEmployees,

        presentToday:
            present[0].presentToday,

        absentToday:
            absent[0].absentToday,

        lateToday:
            late[0].lateToday

    };

}


// =====================================================
// RECENT ATTENDANCE
// =====================================================

async function getRecentAttendance() {

    const db = getPool();


    const [rows] = await db.query(`

        SELECT

            e.name,

            e.department,

            TIME(a.check_in) AS check_in,

            TIME(a.check_out) AS check_out,

            a.status


        FROM attendance a


        JOIN employees e

            ON a.employee_id = e.id


        WHERE a.attendance_date = CURDATE()


        ORDER BY a.check_in DESC


        LIMIT 10

    `);


    return rows;

}


module.exports = {

    getDashboardStats,

    getRecentAttendance

};