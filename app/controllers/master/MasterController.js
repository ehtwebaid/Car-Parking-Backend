const helpers = require("../../common/helpers");
const db_helpers = require("../../common/db_helpers");

const User = require("../../models/User");

const State = require("../../models/State");
const ParkingType = require("../../models/ParkingType");
const CarType = require("../../models/CarType");


const { Op } = require('sequelize');
module.exports = {
  listState: async function (req, resp) {
    let data = {};
    try {
      const states = await helpers.fetchallData(State, { attributes: ['id', 'code', 'name'] });
      return resp.status(200).json({
        status: "success",
        message: "Parking Space has been saved Successfully",
        data: states?.data
      });
    } catch (e) {
      console.log(e);
      return resp.status(200).json({
        status: "error",
        message: e.message || "Something went wrong",
        data: data
      });
    }
  },
  listParkingType: async function (req, resp) {
    let data = {};
    try {
      const parking_types = await helpers.fetchallData(ParkingType, { attributes: ['id', 'name'] });
      return resp.status(200).json({
        status: "success",
        message: "Parking Space has been saved Successfully",
        data: parking_types?.data
      });
    } catch (e) {
      console.log(e);
      return resp.status(200).json({
        status: "error",
        message: e.message || "Something went wrong",
        data: data
      });
    }
  },
  fetchMinMAXRentPrice: async function (req, resp) {
    let data = {};
    try {
      const lower = await db_helpers.fetchPriceRange('parking_lists', { attributes: ['MIN(per_month_price) as price'] });
      const upper = await db_helpers.fetchPriceRange('parking_lists', { attributes: ['MAX(per_month_price) as price'] });

      return resp.status(200).json({
        status: "success",
        message: "Parking Space has been saved Successfully",
        data: { lower, upper }
      });
    } catch (e) {
      console.log(e);
      return resp.status(200).json({
        status: "error",
        message: e.message || "Something went wrong",
        data: data
      });
    }
  },
  listCarType: async function (req, resp) {
    let data = {};
    try {
      const car_types = await helpers.fetchallData(CarType, { attributes: ['id','name'] });
      return resp.status(200).json({
        status: "success",
        message: "",
        data: car_types?.data
      });
    } catch (e) {
      console.log(e);
      return resp.status(200).json({
        status: "error",
        message: e.message || "Something went wrong",
        data: data
      });
    }
  },
};
