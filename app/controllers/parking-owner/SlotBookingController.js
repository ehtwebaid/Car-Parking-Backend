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
      let whereConditions = { status: { [Op.ne]: "D" } };
      if(slot_id)
      {
        whereConditions.parking_slot_id=slot_id;
      }
      if (start_date && end_date) {
        whereConditions[Op.and] = [
          where(fn("DATE", col("Booking.booking_start")), {
            [Op.gte]: start_date,
          }),
          where(fn("DATE", col("Booking.booking_end")), {
            [Op.lte]: end_date,
          }),
        ];
      }
      const option = {
        where: whereConditions,
        order: [["created_at", "DESC"]],
        attributes: ["id", "code", "booking_start", "booking_end"], // Booking fields
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
            include: [
              {
                model: ParkingSpace,
                where: { owner_id: req.auth.id }, // filter by owner_id
                as: "parking_space",
                attributes: [],
              },
            ],
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
  },
  viewBooking: async function (req, resp) {
    let data = {};
    try {
      let rules = {
        id: `required|exists:Booking,id`,
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
      const { id } = req.body;
      const option = [
        { model: User, as: 'customer', attributes: ['id', 'name'] },

        {
          model: Billing,
          as: "billing", // must match the alias used in `belongsTo`,
          attributes: ["vehicle_number","net_parking_fees","net_fees","ev_charing_fees","net_ev_chagin_fees",
            "ev_charing_duration","access_hours","monthly_price"],
          include: [{ model: CarType, as: "carType", attributes: ["name"] }],
        },
        {
          model: ParkingSlot,
          as: "parking_slot", // must match the alias used in `belongsTo`,
          attributes: ["slot_code", "id"],
          include: [
            {
              model: ParkingSpace,

              as: "parking_space",
              attributes: ["title","address"],
            },
          ],
        },

      ];
      const result = await helpers.findByID(Booking, id, option);
      result.durations= await helpers.timeDifference(result?.booking_start, result?.booking_end);
      result.next_payment_date=moment(await helpers.toLocal(result?.booking_end,req.userTimezone)).format('DD');
      return resp.json({
        status: 'success',
        data: result
      });
    } catch (e) {
      return resp.status(200).json({
        status: "error",
        message: e.message || "Something went wrong",
        data: data,
      });
    }
  },
  listPayments: async function (req, resp) {
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
      let whereConditions = { status: { [Op.ne]: "D" } };
      if (start_date && end_date) {
        whereConditions[Op.and] = [
          where(fn("DATE", col("Booking.booking_start")), {
            [Op.gte]: start_date,
          }),
          where(fn("DATE", col("Booking.booking_end")), {
            [Op.lte]: end_date,
          }),
        ];
      }
      if(slot_id)
      {
        whereConditions.parking_slot_id=slot_id;
      }

      const option = {
        where: whereConditions,
        order: [["created_at", "DESC"]],
        attributes: ["id", "code", "booking_start", "booking_end"], // Booking fields
        include: [
          {
            model: Billing,
            as: "billing", // must match the alias used in `belongsTo`,
            attributes: ["vehicle_number", "duration", "ev_charing_fees", "ev_charing_duration", "net_ev_chagin_fees", "net_parking_fees", "net_fees"],
            include: [{ model: CarType, as: "carType", attributes: ["name"] }],
            ...(car_type
              ? { where: { car_type } } // apply filter only if not empty
              : {}),
          },
          {
            model: ParkingSlot,
            as: "parking_slot", // must match the alias used in `belongsTo`,
            attributes: ["slot_code", "id"],
            include: [
              {
                model: ParkingSpace,
                where: { owner_id: req.auth.id }, // filter by owner_id
                as: "parking_space",
                attributes: [],
              },
            ],
          },
        ],
      };
      const result = await helpers.paginateData(Booking, option, page, limit);
      result.data = await Promise.all(result.data.map(async item => {
        const plain = item.get({ plain: true }); // convert Sequelize model → plain object
        plain.durations = await helpers.timeDifference(item?.booking_start, item?.booking_end);
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
  },
  paymentSummary: async function (req, resp) {
    let data = {};
    try {
      data = await db_helpers.paymentSummary(req.auth.id);
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
  dashboardSummary: async function (req, resp) {
    let data = {};
    try {
      data = await db_helpers.paymentSummary(req.auth.id);
      let options = { where: { status: 'A', owner_id: req.auth.id }, include: [{ model: ParkingSlot, as: "parkingslots" }] };
      const total_slot = await helpers.fetchCount(ParkingSpace, options);
      options = { where: { status: 'A', owner_id: req.auth.id }, include: [{ model: ParkingSlot, as: "parkingslots", where: { status: 'A' } }] };
      const total_active_slot = await helpers.fetchCount(ParkingSpace, options);

      options = { where: { status: 'A', owner_id: req.auth.id }, include: [{ model: ParkingSlot, as: "parkingslots", where: { is_ev_charing: 1 } }] };
      const total_ev_slot = await helpers.fetchCount(ParkingSpace, options);

      options = {
        where: { status: 'A', owner_id: req.auth.id }, include: [
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
              where: { owner_id: req.auth.id,status:'A' }
            }],
          }
        ]
      };
      const life_time_booking=await helpers.fetchCount(Booking, options);

      data = { ...data, total_slot, total_active_slot, total_ev_slot, total_active_ev_slot,life_time_booking };
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
      const current_year=moment().format('YYYY');
      const current_month=moment().format('MM');

      const owner_id=req.auth.id;
      if(data_type=='monthly')
      {
      data = await db_helpers.monthlyBooking(current_year,owner_id);
      }
      else if(data_type=='quarterly')
      {
        data = await db_helpers.quarterlyBooking(current_year,owner_id)
      }
       else if(data_type=='daily')
      {
        data = await db_helpers.dailyBooking(current_year,current_month,owner_id)
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
      const current_year=moment().format('YYYY');
      const current_month=moment().format('MM');

      const owner_id=req.auth.id;
      if(data_type=='monthly')
      {
      data = await db_helpers.monthlyCollection(current_year,owner_id);
      }
      else if(data_type=='quarterly')
      {
        data = await db_helpers.quarterlyCollection(current_year,owner_id)
      }
       else if(data_type=='daily')
      {
        data = await db_helpers.dailyCollection(current_year,current_month,owner_id)
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
   calendarView: async function (req, resp) {
    let data = {};
    try {
       let rules = {
        start_date: `required|date`,
        end_date: `required|date`,

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
      let whereConditions={};
      whereConditions={status: { [Op.ne]: "D" }};
      const{start_date,end_date}=req.body;
      if (start_date && end_date) {
       whereConditions[Op.and]  = {
          booking_start: {
            [Op.lte]: await helpers.toUTCEnd(end_date, req.userTimezone)

          }, booking_end: {
            [Op.gt]: await helpers.toUTCStart(start_date, req.userTimezone)
          }
        };
      }

      const option = {
        where: whereConditions,
        order: [["created_at", "DESC"]],
        attributes: ["id", "code", "booking_start", "booking_end"], // Booking fields
        include: [
          {
            model: ParkingSlot,
            as: "parking_slot", // must match the alias used in `belongsTo`,
            attributes: ["slot_code", "id"],
            include: [
              {
                model: ParkingSpace,
                where: { owner_id: req.auth.id }, // filter by owner_id
                as: "parking_space",
                attributes: [],
              },
            ],
          },
          {
             model: User,
             as: "customer", // must match the alias used in `belongsTo`,
             attributes: ["id", "name"],
          }
        ],
      };
     const result = await helpers.fetchallData(Booking, option);

// Transform result.data

const plainData = result.data.map(item =>
  item.get ? item.get({ plain: true }) : item
);

const data = plainData.map(item => ({
  id:item?.id,
  title: `${item.customer?.name} (${item?.parking_slot?.slot_code})`,
  start: item.booking_start,
  end: item.booking_end,
}));
return resp.status(200).json({   // ✅ use res, not resp
  status: "success",
  message: "",
  data
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
