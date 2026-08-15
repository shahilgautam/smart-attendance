const { getPool } = require("../config/db");

async function getEmployeeList() {

    const db = getPool();

    const [rows] = await db.query(`
        SELECT
            id,
            employee_code,
            name
        FROM employees
        WHERE status='Active'
        ORDER BY name
    `);

    return rows;
}

module.exports = {
    getEmployeeList
};