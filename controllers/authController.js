const bcrypt = require("bcrypt");

const {
    findByUsername,
    findById,
    updateLastLogin,
    updatePassword
} = require("../models/adminModel");


// ============================
// LOGIN
// ============================

async function login(req, res) {

    try {

        const {
            username,
            password
        } = req.body;


        if (!username || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Username and password are required."

            });

        }


        const admin =
            await findByUsername(username);


        if (!admin) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid username or password."

            });

        }


        const validPassword =
            await bcrypt.compare(

                password,

                admin.password

            );


        if (!validPassword) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid username or password."

            });

        }


        await updateLastLogin(admin.id);


        req.session.user = {

            id: admin.id,

            username: admin.username,

            role: admin.role

        };


        return res.json({

            success: true,

            message:
                "Login successful"

        });

    }

    catch (error) {

        console.error(error);


        res.status(500).json({

            success: false,

            message:
                "Internal server error."

        });

    }

}


// ============================
// CHANGE PASSWORD
// ============================

async function changePassword(req, res) {

    try {

        const {

            currentPassword,

            newPassword

        } = req.body;


        if (

            !currentPassword ||

            !newPassword

        ) {

            return res.status(400).json({

                success: false,

                message:
                    "All password fields are required."

            });

        }


        if (

            newPassword.length < 6

        ) {

            return res.status(400).json({

                success: false,

                message:
                    "New password must be at least 6 characters."

            });

        }


        const adminId =
            req.session.user.id;


        const admin =
            await findById(adminId);


        if (!admin) {

            return res.status(404).json({

                success: false,

                message:
                    "Admin not found."

            });

        }


        const validPassword =
            await bcrypt.compare(

                currentPassword,

                admin.password

            );


        if (!validPassword) {

            return res.status(401).json({

                success: false,

                message:
                    "Current password is incorrect."

            });

        }


        const hashedPassword =
            await bcrypt.hash(

                newPassword,

                10

            );


        await updatePassword(

            adminId,

            hashedPassword

        );


        return res.json({

            success: true,

            message:
                "Password updated successfully."

        });

    }

    catch (error) {

        console.error(error);


        return res.status(500).json({

            success: false,

            message:
                "Failed to change password."

        });

    }

}


module.exports = {

    login,

    changePassword

};