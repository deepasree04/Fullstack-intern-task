const express = require('express');
const { addFavorite, removeFavorite, getFavorites } = require('../controllers/favoriteController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// All favorites routes are protected by JWT authentication
router.use(authenticateToken);

// GET /api/favorites
router.get('/', getFavorites);

// POST /api/favorites/:templateId
router.post('/:templateId', addFavorite);

// DELETE /api/favorites/:templateId
router.delete('/:templateId', removeFavorite);

module.exports = router;
