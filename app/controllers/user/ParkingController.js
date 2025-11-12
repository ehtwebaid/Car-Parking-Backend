const helpers = require("../../common/helpers");
const db_helpers = require("../../common/db_helpers");

const User = require("../../models/User");
const ParkingSpace = require("../../models/ParkingSpace");
const ParkingSlot = require("../../models/ParkingSlot");
const ParkingType = require("../../models/ParkingType");

const State = require("../../models/State");

const ParkingResource = require("../../resources/User/ParkingResource");
const ParkingOwnerResource = require("../../resources/User/ParkingOwnerResource");

const UserResource = require("../../resources/User/UserResource");
const { Op } = require("sequelize");
module.exports = {
  listParking: async function (req, resp) {
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
      const {
        lower,
        upper,
        parking_type_id,
        is_ev_charing,
        twenty_four_service,
        weekday_slot,
        weekend_slot,
        is_cc_tv,
        state,
        city,
        zip,
        lat,
        lang,
      } = req.body;

      let where = { status: "A", per_month_price: { gte: lower, lte: upper } };
      if (state) {
        where.state_code = state;
      } else if (!state && city) {
        where.city = city;
      } else if (!city && zip) {
        where.zip = zip;
      }
      where.$or = [];
      if (is_ev_charing) {
        where.$or.push({ is_ev_charing: 1 });
      }
      if (twenty_four_service) {
        where.$or.push({ twenty_four_service: 1 });
      }
      if (weekday_slot) {
        where.$or.push({ weekday_slot: 1 });
      }
      if (weekend_slot) {
        where.$or.push({ weekend_slot: 1 });
      }
      if (is_cc_tv) {
        where.$or.push({ is_cc_tv: 1 });
      }
      if (parking_type_id.length > 0) {
        where.$or.push({ parking_type_id: { in: parking_type_id } });
      }
      if (where.$or.length <= 0) {
        delete where.$or;
      }

      const options = {
        where: where,
        order: [["created_at", "DESC"]],
        groupBy: "parking_space_id",
      };

      let result = await db_helpers.paginateView(
        "parking_lists",
        options,
        page,
        limit
      );
      // Use Promise.all to wait for all async operations to complete
      data = await Promise.all(
        result.data.map(async (item) => {
          item.photo = process.env.SITE_URL + item.photo;
          let options = {
            where: { status: "A", parking_space_id: item?.parking_space_id },
          };

          item.totalSlot = await helpers.fetchCount(ParkingSlot, options);

          return item;
        })
      );
      result.data = data;
      resp.json(result);
    } catch (e) {
      return resp.status(200).json({
        status: "error",
        message: e.message || "Something went wrong",
        data: data,
      });
    }
  },
  viewParking: async function (req, resp) {
    let data = {};
    try {
      let rules = {
        slug: `required|exists:ParkingSpace,slug`,
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
      let parking_space = await db_helpers.findBySLUG(ParkingSpace, req.body.slug, [
        {
          model: ParkingSlot,
          as: "parkingslots",
        },
        {
          model: ParkingType,
          as: "parking_type",
        },
        {
          model: State,
          as: "state",
        },
        {
          model: User,
          as: "owner",
        },
      ]);
      const parking_space_data = new ParkingResource(
        parking_space
      ).toArray();
      const start_time=parking_space_data.parkingslots[0].start_time;
      const end_time=parking_space_data.parkingslots[0].end_time=='23:59:59'?'24:00:00':parking_space_data.parkingslots[0].end_time;
      parking_space_data.booking_hours=await helpers.generateTimeSlots(start_time,end_time,parking_space_data.min_booking_duration);
      return resp.status(200).json({
        status: "success",
        message: "Parking Space has been saved Successfully",
        data: parking_space_data,
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
