
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db'); // ✅

const State = sequelize.define('State', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  code: {
    type: DataTypes.STRING(255),
    allowNull: false,
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
  tableName: 'states',
  timestamps: false, // We'll handle created_at/updated_at manually
}

);
State.beforeUpdate(instance => {
  instance.updated_at = new Date();
});

module.exports = State;
