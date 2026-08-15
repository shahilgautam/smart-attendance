const { getPool } = require("../config/db");


// ============================
// GET ATTENDANCE SETTINGS
// ============================

async function getAttendanceSettings() {

    const db = getPool();

    const [rows] = await db.query(
    `SELECT
        office_start_time,
        office_end_time,
        late_after_minutes,
        working_minutes
     FROM attendance_settings
     WHERE id = 1`
);

    return rows[0];

}


// ============================
// UPDATE ATTENDANCE SETTINGS
// ============================

async function updateAttendanceSettings(

    officeStart,

    lateAfter,

    officeEnd

) {

    const db = getPool();

    await db.query(

    `UPDATE attendance_settings
     SET
        office_start_time = ?,
        late_after_minutes = ?,
        office_end_time = ?
     WHERE id = 1`,

    [
        officeStart,
        lateAfter,
        officeEnd
    ]

);

}


module.exports = {

    getAttendanceSettings,

    updateAttendanceSettings

};