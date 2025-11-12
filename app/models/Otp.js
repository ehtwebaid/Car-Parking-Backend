
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db'); // ✅
const moment = require("moment");

const Otp = sequelize.define('Otp', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
     type: DataTypes.BIGINT.UNSIGNED,
     allowNull: false,

  },
   otp: {
     type: DataTypes.STRING(55),
     allowNull: false,

  },
   otp_type: {
    type: DataTypes.ENUM('E', 'M','F'),
    allowNull: true,
    defaultValue: 'E',
    comment: 'E=>Email Verification, M=>Mobile Verification,F=>Forget Password',
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
  tableName: 'otps',
  timestamps: false, // We'll handle created_at/updated_at manually
}

);
Otp.beforeUpdate(instance => {
  instance.updated_at = new Date();
});

module.exports = Otp;
