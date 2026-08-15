const express = require("express");
const router = express.Router();

const {
    getAttendanceReport
} = require("../controllers/attendanceReportController");

router.get("/", getAttendanceReport);

module.exports = router;