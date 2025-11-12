
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db'); // ✅

const User = sequelize.define('User', {
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
    allowNull: true,
  },

  password: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },

  role: {
    type: DataTypes.ENUM('A', 'O', 'U'),
    allowNull: false,
    comment: 'A=>Admin, O=>Parking Owner, U=>Normal User',

  },
  social_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  stripe_account_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('A', 'P', 'S', 'D'),
    allowNull: true,
    defaultValue: 'A',
    comment: 'A=>Active, P=>Pending, S=>Suspend, D=>Deleted',
  },


  profile_photo: {
    type: DataTypes.STRING(55),
    allowNull: true,
    defaultValue: null
  },
  email_verified_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
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
  tableName: 'users',
  timestamps: false, // We'll handle created_at/updated_at manually
}

);
User.beforeUpdate(instance => {
  instance.updated_at = new Date();
});

module.exports = User;
