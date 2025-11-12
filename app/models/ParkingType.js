
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db'); // ✅
const moment = require("moment");

const ParkingType = sequelize.define('ParkingType', {
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
    defaultValue: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),

  },

  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),

  },

}, {
  tableName: 'parking_types',
  timestamps: false, // We'll handle created_at/updated_at manually
}

);
ParkingType.beforeUpdate(instance => {
  instance.updated_at = new Date();
});

module.exports = ParkingType;
