const express = require("express");
const router = express.Router();

const {
    markAttendance
} = require("../controllers/attendanceController");

router.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "Attendance Route Working"
    });
});

router.post("/mark", markAttendance);

module.exports = router;