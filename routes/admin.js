const express = require("express");
const router = express.Router();
const uploadFile = require("../app/common/uploadFile");
const path = require('path');
const AuthMiddleware = require("../app/middleware/AuthMiddleware");
const DashboardController = require("../app/controllers/admin/DashboardController");
const AuthController = require("../app/controllers/admin/AuthController");
const UserController = require("../app/controllers/admin/UserController");

const uploadProfilePhoto = uploadFile({
  dest: 'uploads/profile_photo',
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.svg','.webp'],
  fieldName: 'file',
  maxSizeMB: 1
});
router.post("/login",AuthController.login);
router.post("/dashboard",AuthMiddleware.checkAuth,AuthMiddleware.checkRole(["A"]),DashboardController.dashboardSummary);
router.post("/payment-chart",AuthMiddleware.checkAuth,AuthMiddleware.checkRole(["A"]),DashboardController.dashboardBookingCollection);
router.post("/booking-chart",AuthMiddleware.checkAuth,AuthMiddleware.checkRole(["A"]),DashboardController.dashboardBookingChart);
router.post("/create-user",uploadProfilePhoto,AuthMiddleware.checkAuth,AuthMiddleware.checkRole(["A"]),UserController.saveUser);
router.post("/list-user",AuthMiddleware.checkAuth,AuthMiddleware.checkRole(["A"]),UserController.listUsers);

module.exports = router;
