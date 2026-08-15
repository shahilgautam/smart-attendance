const express = require("express");

const router = express.Router();

const authenticate =
    require("../middleware/authMiddleware");


const {

    login,

    changePassword

} = require("../controllers/authController");


// Login
router.post(

    "/login",

    login

);


// Change Password
router.post(

    "/change-password",

    authenticate,

    changePassword

);


// Logout
router.post(

    "/logout",

    (req, res) => {


        req.session.destroy(

            err => {


                if (err) {

                    return res.status(

                        500

                    ).json({

                        success: false

                    });

                }


                res.clearCookie(

                    "connect.sid"

                );


                res.json({

                    success: true

                });


            }

        );

    }

);


module.exports = router;