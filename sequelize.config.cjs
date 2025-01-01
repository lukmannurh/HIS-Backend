const path = require('path'); // Import modul path
require('dotenv').config(); // Memuat variabel lingkungan dari .env

module.exports = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'password',
    database: process.env.DB_NAME || 'hoax_checker_db',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    migrationStorage: 'sequelize',
    seederStorage: 'sequelize',
    migrations: {
      path: path.resolve(__dirname, 'migrations'), // Path absolut ke migrations di root
    },
    models: {
      path: path.resolve(__dirname, 'src/models'), // Path absolut ke models
      pattern: /\.cjs$/, // Sesuaikan dengan ekstensi .cjs
    },
    seeders: {
      path: path.resolve(__dirname, 'src/seeders'), // Path absolut ke seeders
      pattern: /\.cjs$/, // Sesuaikan dengan ekstensi .cjs jika seeders juga ada
    },
  },
  test: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'password',
    database: process.env.DB_NAME_TEST || 'hoax_checker_db_test',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    migrationStorage: 'sequelize',
    seederStorage: 'sequelize',
    migrations: {
      path: path.resolve(__dirname, 'migrations'),
    },
    models: {
      path: path.resolve(__dirname, 'src/models'),
      pattern: /\.cjs$/,
    },
    seeders: {
      path: path.resolve(__dirname, 'src/seeders'),
      pattern: /\.cjs$/,
    },
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    migrationStorage: 'sequelize',
    seederStorage: 'sequelize',
    migrations: {
      path: path.resolve(__dirname, 'migrations'),
    },
    models: {
      path: path.resolve(__dirname, 'src/models'),
      pattern: /\.cjs$/,
    },
    seeders: {
      path: path.resolve(__dirname, 'src/seeders'),
      pattern: /\.cjs$/,
    },
  },
};
