const helpers = require("../../common/helpers");
const db_helpers = require("../../common/db_helpers");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // API Secret Key (safe on server)
const ParkingSpace = require("../../models/ParkingSpace");
const ParkingSlot = require("../../models/ParkingSlot");
const CarType = require("../../models/CarType");

const Booking = require("../../models/Booking");
const Billing = require("../../models/Billing");
const User = require("../../models/User");

const CompanySetting = require("../../models/CompanySetting");

const emailHelper = require("../../common/email_helper");

const ParkingResource = require("../../resources/User/ParkingResource");
const moment = require("moment");

const { Op, fn, col, where } = require("sequelize");
module.exports = {
 listBookings: async function (req, resp) {
    let data = {};
    try {
      let rules = {
        page: `required`,
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
      const page = parseInt(req.body.page) || 1;
      const limit = parseInt(req.body.limit) || RULES.pagination.per_page;
      const { start_date, end_date, car_type,slot_id } = req.body;
      let whereConditions = { status: { [Op.ne]: "D" },customer_id:req.auth.id };
      if(slot_id)
      {
        whereConditions.parking_slot_id=slot_id;
      }
      if (start_date && end_date) {
        whereConditions[Op.and]  = {

                 booking_start: {
                  [Op.lte]: await helpers.toUTCEnd(end_date, req.userTimezone)

                }, booking_end: {
                  [Op.gt]: await helpers.toUTCStart(start_date, req.userTimezone)
                }
              };;
      }
      const option = {
        where: whereConditions,
        order: [["created_at", "DESC"]],
        attributes: ["id", "code", "booking_start", "booking_end","booking_type"], // Booking fields
        include: [
          {
            model: Billing,
            as: "billing", // must match the alias used in `belongsTo`,
            attributes: ["vehicle_number"],
            include: [{ model: CarType, as: "carType", attributes: ["name"] }],
            ...(car_type
              ? { where: { car_type } } // apply filter only if not empty
              : {}),
          },
          {
            model: ParkingSlot,
            as: "parking_slot", // must match the alias used in `belongsTo`,
            attributes: ["slot_code", "id"],

          },
        ],
      };
      const result = await helpers.paginateData(Booking, option, page, limit);
      result.data = await Promise.all(result.data.map(async item => {
        const plain = item.get({ plain: true }); // convert Sequelize model → plain object
        plain.durations = await helpers.timeDifference(item?.booking_start, item?.booking_end);
        plain.vacant_slots = await db_helpers.viewVacantSlot(item?.parking_slot?.id, item?.booking_start, item?.booking_end, req.auth.id);

        return plain;
      }));
      resp.json(result);
    } catch (e) {
      return resp.status(200).json({
        status: "error",
        message: e.message || "Something went wrong",
        data: data,
      });
    }
  }
};
