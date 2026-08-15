const { getPool } = require("../config/db");


// ============================
// FIND ADMIN BY USERNAME
// ============================

async function findByUsername(username) {

    const db = getPool();

    const [rows] = await db.query(

        "SELECT * FROM admins WHERE username = ?",

        [username]

    );

    return rows[0];

}


// ============================
// FIND ADMIN BY ID
// ============================

async function findById(id) {

    const db = getPool();

    const [rows] = await db.query(

        "SELECT * FROM admins WHERE id = ?",

        [id]

    );

    return rows[0];

}


// ============================
// UPDATE LAST LOGIN
// ============================

async function updateLastLogin(id) {

    const db = getPool();

    await db.query(

        "UPDATE admins SET last_login = NOW() WHERE id = ?",

        [id]

    );

}


// ============================
// UPDATE PASSWORD
// ============================

async function updatePassword(

    id,

    password

) {

    const db = getPool();

    await db.query(

        `UPDATE admins
         SET password = ?
         WHERE id = ?`,

        [

            password,

            id

        ]

    );

}


// ============================
// EXPORT
// ============================

module.exports = {

    findByUsername,

    findById,

    updateLastLogin,

    updatePassword

};