const sequelize = require('../../config/db');
const User = require('./User');
const Otp = require('./Otp');
const ParkingSlot = require('./ParkingSlot');
const ParkingSpace = require('./ParkingSpace');
const ParkingType = require('./ParkingType');
const Booking = require('./Booking');
const Billing = require('./Billing');
const CarType = require('./CarType');
const Notification = require('./Notification');

const State = require('./State');
ParkingSpace.hasMany(ParkingSlot, { foreignKey: 'parking_space_id', as: 'parkingslots' });
ParkingSpace.belongsTo(ParkingType, { foreignKey: 'parking_type_id', as: 'parking_type' });
ParkingSpace.belongsTo(State, { foreignKey: 'state_id', as: 'state' });
User.hasMany(ParkingSpace, { foreignKey: 'owner_id', as: 'parking_spaces' });
ParkingSpace.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });
ParkingSlot.hasMany(Booking, { as: "bookings", foreignKey: "parking_slot_id" });
ParkingSlot.belongsTo(ParkingSpace, { foreignKey: 'parking_space_id', as: 'parking_space' });
Booking.belongsTo(ParkingSlot, { foreignKey: 'parking_slot_id', as: 'parking_slot' });
Booking.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });

Billing.belongsTo(CarType, { foreignKey: 'car_type', as: 'carType' });
Notification.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
Notification.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });

Booking.hasOne(Billing, { foreignKey: 'booking_id', as: 'billing' });
const db = {
  sequelize,
  User,
  Otp,
  ParkingSlot,
  ParkingSpace,
  ParkingType,
  State
};

const syncDB = async () => {
  try {
    await sequelize.sync({ alert: true });
    console.log('✅ All models synced to MySQL.');
  } catch (err) {
    console.error('❌ DB sync failed:', err);
  }
};

module.exports = { db, syncDB };
