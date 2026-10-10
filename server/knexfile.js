const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const dbPath = path.resolve(__dirname, process.env.DB_FILE || 'dev.sqlite3');

const config = {
  client: 'sqlite3',
  connection: {
    filename: dbPath
  },
  useNullAsDefault: true,
  pool: {
    afterCreate: (conn, done) => {
      // Enable SQLite foreign key constraint enforcement
      conn.run('PRAGMA foreign_keys = ON', done);
    }
  },
  migrations: {
    directory: path.resolve(__dirname, 'src/migrations')
  },
  seeds: {
    directory: path.resolve(__dirname, 'src/seeds')
  }
};

module.exports = {
  development: config,
  production: config,
  test: config,
  ...config
};
