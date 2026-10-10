const db = require('../db');

/**
 * GET /api/templates
 * Retrieve all templates with optional search and category filtering
 */
async function getAllTemplates(req, res, next) {
  try {
    const { search, category } = req.query;

    let query = db('templates').select('*').orderBy('id', 'asc');

    // Filter by category if supplied (excluding 'All' or empty)
    if (category && typeof category === 'string' && category.trim() && category.trim().toLowerCase() !== 'all') {
      query = query.where('category', category.trim());
    }

    // Filter by keyword in name or description
    if (search && typeof search === 'string' && search.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      query = query.where(function() {
        this.whereRaw('LOWER(name) LIKE ?', [term])
            .orWhereRaw('LOWER(description) LIKE ?', [term]);
      });
    }

    const templates = await query;

    return res.status(200).json({
      success: true,
      count: templates.length,
      data: templates
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/templates/:id
 * Retrieve a single template by ID
 */
async function getTemplateById(req, res, next) {
  try {
    const templateId = parseInt(req.params.id, 10);

    if (isNaN(templateId) || templateId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid template ID provided.'
      });
    }

    const template = await db('templates').where({ id: templateId }).first();

    if (!template) {
      return res.status(404).json({
        success: false,
        message: `Template with ID ${templateId} not found.`
      });
    }

    return res.status(200).json({
      success: true,
      data: template
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllTemplates,
  getTemplateById
};
