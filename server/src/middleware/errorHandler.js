/**
 * 404 Not Found Middleware
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  });
}

/**
 * Centralized Error Handling Middleware
 */
function errorHandler(err, req, res, next) {
  // Safe logging without exposing passwords or tokens
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message || err);

  // Handle SQLite constraint errors safely
  if (err.code === 'SQLITE_CONSTRAINT') {
    if (err.message && err.message.includes('UNIQUE')) {
      return res.status(409).json({
        success: false,
        message: 'A resource with these unique properties already exists.'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Database constraint violation.'
    });
  }

  // Handle JSON parse errors from body-parser
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON payload in request body.'
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode === 500 && process.env.NODE_ENV === 'production'
    ? 'An unexpected internal server error occurred.'
    : err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
