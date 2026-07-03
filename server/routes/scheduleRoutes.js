const express = require('express');
const {
  listSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} = require('../controllers/scheduleController');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/schedules', listSchedules);
router.post('/schedules', protect, requireRole('admin'), createSchedule);
router.put('/schedules/:id', protect, requireRole('admin'), updateSchedule);
router.delete('/schedules/:id', protect, requireRole('admin'), deleteSchedule);

module.exports = router;
