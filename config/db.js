// app/config/sequelize.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  host: process.env.DB_HOSTNAME,
  dialect: 'mysql',
  logging: false,
  timezone: '+00:00',

 // ✅ Store and read everything in UTC
});

module.exports = sequelize;

