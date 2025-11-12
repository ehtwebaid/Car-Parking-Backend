
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db'); // ✅
const moment = require("moment");

const ParkingSpace = sequelize.define('ParkingSpace', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },

  owner_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },

  parking_type_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },

  state_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },

  photos: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  zip: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  lat: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  lang: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  ev_charing_slot: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
  },
    min_booking_duration: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
  },


  status: {
    type: DataTypes.ENUM('A', 'P', 'S', 'D'),
    allowNull: true,
    defaultValue: 'A',
    comment: 'A=>Active, P=>Pending, S=>Suspend, D=>Deleted',
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
  tableName: 'parking_spaces',
  timestamps: false, // We'll handle created_at/updated_at manually
}

);
ParkingSpace.beforeUpdate(instance => {
  instance.updated_at = new Date();
});

module.exports = ParkingSpace;
