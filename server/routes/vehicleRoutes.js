const express = require('express');
const {
  listVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  nearbyVehicles,
  updateStatus,
} = require('../controllers/vehicleController');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

// Public: passengers need to see vehicles/nearby without admin rights
router.get('/vehicles', listVehicles);
router.get('/vehicles/nearby', nearbyVehicles);
router.get('/vehicles/:id', getVehicle);

// Admin-only writes
router.post('/vehicles', protect, requireRole('admin'), createVehicle);
router.put('/vehicles/:id', protect, requireRole('admin'), updateVehicle);
router.put('/vehicles/:id/status', protect, requireRole('admin'), updateStatus);
router.delete('/vehicles/:id', protect, requireRole('admin'), deleteVehicle);

module.exports = router;
