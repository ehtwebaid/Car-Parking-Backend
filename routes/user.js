const express = require("express");
const router = express.Router();
const AuthMiddleware = require("../app/middleware/AuthMiddleware");

// Importing Middleware

// Importing Controllers
const ParkingController = require("../app/controllers/user/ParkingController");
const BookingController = require("../app/controllers/user/BookingController");
const DashboardController = require("../app/controllers/user/DashboardController");
const SlotBookingController = require("../app/controllers/parking-owner/SlotBookingController");
const CMSController = require("../app/controllers/user/CMSController");

router.post("/parking/list",ParkingController.listParking);
router.post("/parking/view",ParkingController.viewParking);
router.post("/available-booking-hour",BookingController.availableBookingHours);
router.post("/available-monthly-booking",BookingController.availableMonthlyBooking);
router.post("/create-boking",AuthMiddleware.checkAuth,BookingController.createBooking);
router.post("/submit-customer-query",CMSController.submitCustomerQuery);

router.post("/dashboard",AuthMiddleware.checkAuth,AuthMiddleware.checkRole(["U"]),DashboardController.listBookings);

module.exports = router;
