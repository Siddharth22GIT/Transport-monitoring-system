const express = require('express');
const { getStats } = require('../controllers/dashboardController');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard/stats', protect, requireRole('admin'), getStats);

module.exports = router;
