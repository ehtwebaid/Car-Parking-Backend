const express = require("express");
const router = express.Router();

// Importing Middleware

// Importing Controllers
const AuthController = require("../app/controllers/auth/AuthController");

router.post("/login", AuthController.login);
router.post("/signup", AuthController.signup);
router.post("/verify-otp", AuthController.verifyOtp);
router.post("/resend-otp", AuthController.resendOtp);
router.post("/forget-password", AuthController.forgetPassword);
router.post("/reset-password", AuthController.resetPassword);

router.get("/",function(){});



module.exports = router;
