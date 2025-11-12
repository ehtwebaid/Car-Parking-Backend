
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db'); // ✅
const moment = require("moment");

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  customer_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  parking_slot_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  booking_start: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  },
  booking_end: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  },
  stripe_trans_id: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('A', 'I', 'D'),
    allowNull: true,
    defaultValue: 'A',
    comment: 'A=>Active, P=>Inactive, D=>Deleted',
  },
  booking_type: {
    type: DataTypes.ENUM('hourly', 'monthly'),
    allowNull: true,
    defaultValue: 'hourly',
  },
   is_payout: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: true,
    defaultValue: 0,
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
  tableName: 'bookings',
  timestamps: false, // We'll handle created_at/updated_at manually
}

);
Booking.beforeUpdate(instance => {
  instance.updated_at = new Date();
});

module.exports = Booking;
