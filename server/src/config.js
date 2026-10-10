const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  jwtSecret: process.env.JWT_SECRET,
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  dbFile: process.env.DB_FILE || 'dev.sqlite3'
};

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET || config.jwtSecret;
  if (!secret) {
    if (process.env.NODE_ENV === 'test') {
      return 'test_temporary_jwt_secret_for_tests_only';
    }
    throw new Error('JWT_SECRET is not configured. Please set JWT_SECRET in server/.env');
  }
  return secret;
};

module.exports = {
  ...config,
  getJwtSecret
};
