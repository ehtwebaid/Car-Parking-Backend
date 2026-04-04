// app/config/sequelize.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  host: process.env.DB_HOSTNAME,
  dialect: 'mysql',
  logging: false,
  timezone: '+00:00',

 // ✅ Store and read everything in UTC
});
// ✅ Hook: runs every time a new connection is created
sequelize.afterConnect(async (connection) => {
  await connection.query(`
    SET SESSION sql_mode = (SELECT REPLACE(@@sql_mode, 'ONLY_FULL_GROUP_BY', ''))
  `);
});

module.exports = sequelize;

