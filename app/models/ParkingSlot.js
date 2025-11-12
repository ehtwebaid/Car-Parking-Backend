
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db'); // ✅
const moment = require("moment");

const ParkingSlot = sequelize.define('ParkingSlot', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },

  parking_space_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },

  slot_code: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },

  available_days: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },

  start_time: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '00:00:00',

  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false,
    defaultValue: '24:00:00',

  },
  status: {
    type: DataTypes.ENUM('A', 'I', 'D'),
    allowNull: true,
    defaultValue: 'A',
    comment: 'A=>Active, P=>Inactive, D=>Deleted',
  },
  twenty_four_service: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0
  },
  is_ev_charing: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0

  },
  is_cc_tv: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0

  },
  per_hour_price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0

  },
  per_month_price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0

  },
  ev_charging_price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0

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
  tableName: 'parking_slots',
  timestamps: false, // We'll handle created_at/updated_at manually
}

);
ParkingSlot.beforeUpdate(instance => {
  instance.updated_at = new Date();
});

module.exports = ParkingSlot;
