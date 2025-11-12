const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db"); // ✅
const moment = require("moment");

const Notification = sequelize.define(
  "Notification",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    sender_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    receiver_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    is_read: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("A", "I", "D"),
      allowNull: true,
      defaultValue: "A",
      comment: "A=>Active, P=>Inactive, D=>Deleted",
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
  },
  {
    tableName: "notifications",
    timestamps: false, // We'll handle created_at/updated_at manually
  }
);
Notification.beforeUpdate((instance) => {
  instance.updated_at = new Date();
});

module.exports = Notification;
