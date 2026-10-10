const express = require('express');
const { getAllTemplates, getTemplateById } = require('../controllers/templateController');

const router = express.Router();

// GET /api/templates
router.get('/', getAllTemplates);

// GET /api/templates/:id
router.get('/:id', getTemplateById);

module.exports = router;
