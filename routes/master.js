const express = require("express");
const router = express.Router();

// Importing Middleware

// Importing Controllers
const MasterController = require("../app/controllers/master/MasterController");

router.get("/state",MasterController.listState);
router.get("/parking-type",MasterController.listParkingType);
router.get("/price-range",MasterController.fetchMinMAXRentPrice);
router.get("/car-type",MasterController.listCarType);

module.exports = router;
