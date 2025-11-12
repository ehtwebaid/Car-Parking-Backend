
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db'); // ✅

const CarType = sequelize.define('CarType', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },

  name: {
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
  tableName: 'car_types',
  timestamps: false, // We'll handle created_at/updated_at manually
}

);
CarType.beforeUpdate(instance => {
  instance.updated_at = new Date();
});

module.exports = CarType;
