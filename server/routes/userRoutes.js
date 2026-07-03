const express = require('express');
const { togglePin, getPins } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/users/pins', protect, getPins);
router.post('/users/pins/:vehicleId', protect, togglePin);

module.exports = router;
