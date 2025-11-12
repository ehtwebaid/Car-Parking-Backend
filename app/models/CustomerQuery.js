
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db'); // ✅
const moment = require("moment");

const CustomerQuery = sequelize.define('CustomerQuery', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },

  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
   email: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  phone_no: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
  },

  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
  },

}, {
  tableName: 'customer_queries',
  timestamps: false, // We'll handle created_at/updated_at manually
}

);
CustomerQuery.beforeUpdate(instance => {
  instance.updated_at = new Date();
});

module.exports = CustomerQuery;
