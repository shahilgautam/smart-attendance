const {
    getDashboardStats,
    getRecentAttendance
} = require("../models/dashboardModel");

async function dashboardStats(req, res) {

    try {

        const stats = await getDashboardStats();

        res.json({
            success: true,

            user: req.user,

            data: stats
        });

    } catch (err) {

        console.error("Dashboard stats error:", err);

        res.status(500).json({
            success: false,
            message: "Failed to load dashboard statistics."
        });

    }

}

async function recentAttendance(req, res) {

    try {

        const attendance = await getRecentAttendance();

        res.json({
            success: true,
            data: attendance
        });

    } catch (err) {

        console.error("Recent attendance error:", err);

        res.status(500).json({
            success: false,
            message: "Failed to load recent attendance."
        });

    }

}

module.exports = {
    dashboardStats,
    recentAttendance
};