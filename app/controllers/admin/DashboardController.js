const helpers = require("../../common/helpers");
const User = require("../../models/User");
const ParkingSpace = require("../../models/ParkingSpace");
const ParkingSlot = require("../../models/ParkingSlot");
const ParkingType = require("../../models/ParkingType");

const State = require("../../models/State");
const Booking = require("../../models/Booking");
const Billing = require("../../models/Billing");
const CarType = require("../../models/CarType");

const ParkingResource = require("../../resources/User/ParkingResource");
const ParkingOwnerResource = require("../../resources/User/ParkingOwnerResource");

const UserResource = require("../../resources/User/UserResource");
const { Op, Sequelize, where, fn, col } = require("sequelize");
const db_helpers = require("../../common/db_helpers");
const RULES = require("../../../config/rules");
const moment = require("moment");

module.exports = {

  dashboardSummary: async function (req, resp) {
    let data = {};
    try {
      data = await db_helpers.paymentSummaryAdmin();
      let options = { where: { status: 'A' }, include: [{ model: ParkingSlot, as: "parkingslots" }] };
      const total_slot = await helpers.fetchCount(ParkingSpace, options);
      options = { where: { status: 'A' }, include: [{ model: ParkingSlot, as: "parkingslots", where: { status: 'A' } }] };
      const total_active_slot = await helpers.fetchCount(ParkingSpace, options);

      options = { where: { status: 'A' }, include: [{ model: ParkingSlot, as: "parkingslots", where: { is_ev_charing: 1 } }] };
      const total_ev_slot = await helpers.fetchCount(ParkingSpace, options);

      options = {
        where: { status: 'A'}, include: [
          { model: ParkingSlot, as: "parkingslots", where: { is_ev_charing: 1, status: 'A' } }
        ]
      };
      const total_active_ev_slot = await helpers.fetchCount(ParkingSpace, options);
      options = {
        include:[
            {
            model: ParkingSlot,
            as: "parking_slot", // must match the alias used in `belongsTo`,
            attributes: [],
            include: [{
              model: ParkingSpace,
              as: "parking_space", // must match the alias used in `belongsTo`,
              attributes: [],
              where: {status:'A' }
            }],
          }
        ]
      };
      const life_time_booking=await helpers.fetchCount(Booking, options);
      const total_owner=await helpers.fetchCount(User, {where:{role:'O'}});
      const total_user=await helpers.fetchCount(User, {where:{role:'U'}});
      data = { ...data, total_slot, total_active_slot, total_ev_slot, total_active_ev_slot,life_time_booking,total_owner,total_user};
      return resp.status(200).json({
        status: "success",
        message: "",
        data: data,
      });
    } catch (e) {
      return resp.status(200).json({
        status: "error",
        message: e.message || "Something went wrong",
        data: data,
      });
    }
  },
  dashboardBookingChart: async function (req, resp) {
    let data = {};
    try {
      let rules = {
        data_type: `required|in:monthly,quarterly,daily`,
      };

      const v = await helpers.validator(rules, req.body);
      if (!v.status) {
        data.errors = v.errors;
        return resp.status(200).json({
          status: "val_error",
          message: "Validation Error",
          data: data,
        });
      }
      const{data_type}=req.body;
      const current_year=moment().utc().format('YYYY');
      const current_month=moment().utc().format('MM');

      if(data_type=='monthly')
      {
      data = await db_helpers.monthlyBookingAdmin(current_year);
      }
      else if(data_type=='quarterly')
      {
        data = await db_helpers.quarterlyBookingAdmin(current_year)
      }
       else if(data_type=='daily')
      {
        data = await db_helpers.dailyBookingAdmin(current_year,current_month)
      }
      return resp.status(200).json({
        status: "success",
        message: "",
        data: data?.results,
      });

    } catch (e) {
      return resp.status(200).json({
        status: "error",
        message: e.message || "Something went wrong",
        data: data,
      });
    }
  },
  dashboardBookingCollection: async function (req, resp) {
    let data = {};
    try {
        let rules = {
        data_type: `required|in:monthly,quarterly,daily`,
      };

      const v = await helpers.validator(rules, req.body);
      if (!v.status) {
        data.errors = v.errors;
        return resp.status(200).json({
          status: "val_error",
          message: "Validation Error",
          data: data,
        });
      }
      const{data_type}=req.body;
      const current_year=moment().utc().format('YYYY');
      const current_month=moment().utc().format('MM');

      const owner_id=req.auth.id;
      if(data_type=='monthly')
      {
      data = await db_helpers.monthlyCollectionAdmin(current_year);
      }
      else if(data_type=='quarterly')
      {
        data = await db_helpers.quarterlyCollectionAdmin(current_year)
      }
        else if(data_type=='daily')
      {
        data = await db_helpers.dailyCollectionAdmin(current_year,current_month)
      }
      return resp.status(200).json({
        status: "success",
        message: "",
        data: data?.results,
      });
    } catch (e) {
      return resp.status(200).json({
        status: "error",
        message: e.message || "Something went wrong",
        data: data,
      });
    }
  },
};
