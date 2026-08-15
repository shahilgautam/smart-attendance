const fs = require("fs");
const path = require("path");
const { getPool } = require("../config/db");

exports.uploadFace = async (req, res) => {
    console.log("uploadFace controller called");

    try {

        const { employeeId, image } = req.body;

        if (!employeeId || !image) {

            return res.status(400).json({
                success: false,
                message: "Employee and image are required."
            });

        }

        const base64Data = image.replace(
            /^data:image\/\w+;base64,/,
            ""
        );

        const fileName =
    `EMP_${employeeId}_${Date.now()}.jpg`;

        const uploadPath = path.join(
            __dirname,
            "../public/uploads/faces",
            fileName
        );

        fs.writeFileSync(
            uploadPath,
            base64Data,
            "base64"
        );

        const db = getPool();

        await db.query(

            `UPDATE employees
             SET photo=?
             WHERE id=?`,

            [
                "/uploads/faces/" + fileName,
                employeeId
            ]

        );

        res.json({

            success: true,
            message: "Face Registered Successfully."

        });

    } catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,
            message: err.message

        });

    }

};