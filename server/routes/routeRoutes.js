const express = require('express');
const {
  listRoutes,
  getRoute,
  createRoute,
  updateRoute,
  deleteRoute,
  searchRoutes,
} = require('../controllers/routeController');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/routes/search', searchRoutes);
router.get('/routes', listRoutes);
router.get('/routes/:id', getRoute);
router.post('/routes', protect, requireRole('admin'), createRoute);
router.put('/routes/:id', protect, requireRole('admin'), updateRoute);
router.delete('/routes/:id', protect, requireRole('admin'), deleteRoute);

module.exports = router;
