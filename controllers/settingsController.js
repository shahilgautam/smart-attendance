const {

    getAttendanceSettings,

    updateAttendanceSettings

} = require("../models/settingsModel");


// ============================
// GET SETTINGS
// ============================

async function getSettings(req, res) {

    try {

        const settings =
            await getAttendanceSettings();


        res.json({

            success: true,

            data: settings

        });

    }

    catch (error) {

        console.error(error);


        res.status(500).json({

            success: false,

            message:
                "Failed to load attendance settings."

        });

    }

}


// ============================
// UPDATE SETTINGS
// ============================

async function updateSettings(req, res) {

    try {

        const {
            officeStart,
            lateAfter,
            officeEnd
        } = req.body;

        if (
            !officeStart ||
            lateAfter === undefined ||
            lateAfter === null ||
            !officeEnd
        ) {
            return res.status(400).json({
                success: false,
                message: "All attendance settings are required."
            });
        }

        await updateAttendanceSettings(
            officeStart,
            Number(lateAfter),
            officeEnd
        );

        res.json({
            success: true,
            message: "Attendance settings saved successfully."
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to save attendance settings."
        });

    }

}


module.exports = {

    getSettings,

    updateSettings

};