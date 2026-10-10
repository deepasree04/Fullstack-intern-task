const db = require('../db');

/**
 * POST /api/favorites/:templateId
 * Add a template to the authenticated user's favorites
 */
async function addFavorite(req, res, next) {
  try {
    const userId = req.user.id;
    const templateId = parseInt(req.params.templateId, 10);

    if (isNaN(templateId) || templateId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid template ID provided.'
      });
    }

    // Verify template existence
    const template = await db('templates').where({ id: templateId }).first();
    if (!template) {
      return res.status(404).json({
        success: false,
        message: `Template with ID ${templateId} not found.`
      });
    }

    // Check if already favorited
    const existing = await db('favorites')
      .where({ user_id: userId, template_id: templateId })
      .first();

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Template is already in your favorites.',
        favoriteId: existing.id
      });
    }

    try {
      const [insertedId] = await db('favorites').insert({
        user_id: userId,
        template_id: templateId
      });

      return res.status(201).json({
        success: true,
        message: 'Template added to favorites.',
        data: {
          id: insertedId,
          user_id: userId,
          template_id: templateId
        }
      });
    } catch (insertErr) {
      // Gracefully catch unique constraint collisions (e.g. race conditions) without returning 500
      if (insertErr.code === 'SQLITE_CONSTRAINT' && insertErr.message.includes('UNIQUE')) {
        return res.status(409).json({
          success: false,
          message: 'Template is already in your favorites.'
        });
      }
      throw insertErr;
    }
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/favorites/:templateId
 * Remove a template from the authenticated user's favorites
 */
async function removeFavorite(req, res, next) {
  try {
    const userId = req.user.id;
    const templateId = parseInt(req.params.templateId, 10);

    if (isNaN(templateId) || templateId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid template ID provided.'
      });
    }

    const deletedCount = await db('favorites')
      .where({ user_id: userId, template_id: templateId })
      .del();

    if (deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Template is not in your favorites.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Template removed from favorites successfully.'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/favorites
 * Retrieve all favorited templates for the authenticated user
 */
async function getFavorites(req, res, next) {
  try {
    const userId = req.user.id;

    const favorites = await db('favorites')
      .join('templates', 'favorites.template_id', '=', 'templates.id')
      .where('favorites.user_id', userId)
      .select(
        'favorites.id as favorite_id',
        'favorites.created_at as favorited_at',
        'templates.id as id',
        'templates.name as name',
        'templates.description as description',
        'templates.thumbnail_url as thumbnail_url',
        'templates.category as category',
        'templates.created_at as created_at'
      )
      .orderBy('favorites.created_at', 'desc');

    return res.status(200).json({
      success: true,
      count: favorites.length,
      data: favorites
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  addFavorite,
  removeFavorite,
  getFavorites
};
