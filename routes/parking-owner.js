const express = require("express");
const router = express.Router();
const uploadFile = require("../app/common/uploadFile");
const path = require('path');
const AuthMiddleware = require("../app/middleware/AuthMiddleware");
const ParkingSpaceController = require("../app/controllers/parking-owner/ParkingSpaceController");
const MasterController = require("../app/controllers/master/MasterController");
const ProfileController = require("../app/controllers/parking-owner/ProfileController");
const SlotBookingController = require("../app/controllers/parking-owner/SlotBookingController");
const ConnectedAccountController = require("../app/controllers/parking-owner/ConnectedAccountController");
const NotificationController = require("../app/controllers/common/NotificationController");

const uploadMiddleware = uploadFile({
  dest: 'uploads/parking_photo',
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.svg','.webp'],
  fieldName: 'files',
  maxSizeMB: 2
});
const uploadProfilePhoto = uploadFile({
  dest: 'uploads/profile_photo',
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.svg','.webp'],
  fieldName: 'files',
  maxSizeMB: 2,
  maxUploads:1
});
router.post("/parking-space/create", AuthMiddleware.checkRole(["O"]),uploadMiddleware,ParkingSpaceController.addParkingSpace);
router.post("/parking-space/detail", AuthMiddleware.checkRole(["O"]),ParkingSpaceController.viewParkingSpace);
router.post("/parking-space/add-slot", AuthMiddleware.checkRole(["O"]),ParkingSpaceController.addSlot);
router.post("/parking-space/add-photo", AuthMiddleware.checkRole(["O"]),uploadMiddleware,ParkingSpaceController.addPhoto);
router.post("/parking-space/slot", AuthMiddleware.checkRole(["O"]),ParkingSpaceController.slotLists);
router.post("/parking-space/slot-master", AuthMiddleware.checkRole(["O"]),ParkingSpaceController.slotMaster);

router.post("/bookings", AuthMiddleware.checkRole(["O"]),SlotBookingController.listBookings);
router.post("/booking/view", AuthMiddleware.checkRole(["O","U"]),SlotBookingController.viewBooking);
router.post("/booking/payments", AuthMiddleware.checkRole(["O"]),SlotBookingController.listPayments);
router.post("/booking/payment-summary", AuthMiddleware.checkRole(["O"]),SlotBookingController.paymentSummary);
router.post("/dashboard-summary", AuthMiddleware.checkRole(["O"]),SlotBookingController.dashboardSummary);
router.post("/chart-booking", AuthMiddleware.checkRole(["O"]),SlotBookingController.dashboardBookingChart);
router.post("/chart-collection", AuthMiddleware.checkRole(["O"]),SlotBookingController.dashboardBookingCollection);
router.post("/account-onboard", AuthMiddleware.checkRole(["O"]),ConnectedAccountController.createAccount);
router.post("/calendar-view", AuthMiddleware.checkRole(["O"]),SlotBookingController.calendarView);
router.post("/notification", AuthMiddleware.checkRole(["O","U"]),NotificationController.listNotifications);
router.post("/total-unread-notification", AuthMiddleware.checkRole(["O","U"]),NotificationController.totalUnreadNotification);
router.post("/mark-all-as-read", AuthMiddleware.checkRole(["O","U"]),NotificationController.markAllAsRead);

router.post("/edit-profile",uploadProfilePhoto,ProfileController.updateProfile);
router.post("/change-password",ProfileController.changePassword);



module.exports = router;
