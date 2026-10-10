const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { clientOrigin } = require('./config');
const authRoutes = require('./routes/authRoutes');
const templateRoutes = require('./routes/templateRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

// CORS configuration supporting Vite frontend development origins
const allowedOrigins = [
  clientOrigin,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or matching allowed origins
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev, origin-aware
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Express JSON body parser
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Mount application API routes
app.use('/api/auth', authRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/favorites', favoriteRoutes);

// Path to compiled frontend assets in client/dist
const clientDistPath = path.resolve(__dirname, '../../client/dist');

// Serve static assets from client/dist if the directory exists
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

// React SPA fallback for client-side routing on non-API GET requests
app.use((req, res, next) => {
  // Never intercept API routes; allow them to fall through to notFoundHandler
  if (req.path.startsWith('/api')) {
    return next();
  }

  // Handle client-side routing requests (GET)
  if (req.method === 'GET') {
    const indexPath = path.join(clientDistPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }

    // Return a helpful response if frontend has not been compiled yet without crashing
    return res.status(503).send(
      '<!DOCTYPE html><html><head><title>Frontend Build Not Found</title></head>' +
      '<body style="font-family:system-ui,-apple-system,sans-serif;padding:3rem;text-align:center;color:#0f172a;background:#f8fafc;">' +
      '<h2>Frontend Build Not Found</h2>' +
      '<p style="color:#475569;margin-top:0.5rem;">The React application has not been compiled yet. Please run <code>npm run build</code> inside the <code>client/</code> directory.</p>' +
      '</body></html>'
    );
  }

  next();
});

// 404 Handler for undefined API routes or unhandled non-GET requests
app.use(notFoundHandler);

// Centralized error handling
app.use(errorHandler);

module.exports = app;
