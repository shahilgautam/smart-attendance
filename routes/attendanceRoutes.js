const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const { markAttendance } = require('../controllers/attendanceController');
router.get('/test', authenticate, (req, res) => res.json({ success: true, message: 'Attendance route working' }));
router.post('/mark', authenticate, markAttendance);
module.exports = router;
