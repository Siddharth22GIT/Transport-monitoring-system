const express = require('express');
const { register, login, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/users/profile', protect, getProfile);

module.exports = router;
