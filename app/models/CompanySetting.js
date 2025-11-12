
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db'); // ✅

const CompanySetting = sequelize.define('CompanySetting', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  company_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  support_email: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  phone_no: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },

  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },

  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },

}, {
  tableName: 'company_settings',
  timestamps: false, // We'll handle created_at/updated_at manually
}

);
CompanySetting.beforeUpdate(instance => {
  instance.updated_at = new Date();
});

module.exports = CompanySetting;
