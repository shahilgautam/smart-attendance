const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const { getEmployees } = require('../controllers/recognitionController');
router.get('/employees', authenticate, getEmployees);
module.exports = router;
