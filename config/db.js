// app/config/sequelize.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  host: process.env.DB_HOSTNAME,
  dialect: 'mysql',
  logging: false,
  timezone: '+00:00',
    hooks: {
    afterConnect: async (connection) => {
      // Use the raw connection to set the session sql_mode
      // Using .promise().query() because sequelize uses the mysql2 driver
      await connection.promise().query("SET SESSION sql_mode = '';");
    }
  }

 // ✅ Store and read everything in UTC
});

module.exports = sequelize;

