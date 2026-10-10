const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Public auth routes
router.post('/register', register);
router.post('/login', login);

// Protected auth route
router.get('/me', authenticateToken, getMe);

module.exports = router;
