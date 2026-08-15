const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const {
    dashboardStats,
    recentAttendance
} = require("../controllers/dashboardController");

router.get("/stats", authenticate, dashboardStats);

router.get(
    "/recent-attendance",
    authenticate,
    recentAttendance
);

module.exports = router;