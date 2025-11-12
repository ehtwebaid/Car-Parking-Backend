const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db"); // ✅
const moment = require("moment");

const Billing = sequelize.define(
  "Billing",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    booking_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    per_hour_fees: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
     monthly_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    duration: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    ev_charing_fees: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    ev_charing_duration: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    net_ev_chagin_fees: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    net_ev_chagin_fees: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    net_parking_fees: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    net_fees: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    vehicle_number: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    car_type: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
      access_hours: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
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
      defaultValue: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')

    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    },
  },
  {
    tableName: "billings",
    timestamps: false, // We'll handle created_at/updated_at manually
  }
);
Billing.beforeUpdate((instance) => {
  instance.updated_at = new Date();
});

module.exports = Billing;
