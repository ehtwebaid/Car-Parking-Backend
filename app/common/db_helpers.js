// const { Validator } = require('node-input-validator');
const sequelize = require('../../config/db');
const helpers = require("./helpers");
const ParkingSpace = require("../models/ParkingSpace");
const ParkingSlot = require("../models/ParkingSlot");
const Booking = require("../models/Booking");
const Billing = require("../models/Billing");
const moment = require("moment");

const { fn, col, literal, Op, Sequelize, where } = require("sequelize");


const ParkingOwnerResource = require("../resources/User/ParkingOwnerResource");

module.exports = {
  paginateView: async function (table, options = {}, page = 1, limit = 40) {
    const offset = (page - 1) * limit;
    const where = options.where || {};
    const order = options.order || [['created_at', 'DESC']];
    const groupBy = options.groupBy || null;

    const replacements = { limit, offset };
    let paramIndex = 0;

    const buildCondition = (key, operator, value) => {
      const paramKey = `param_${paramIndex++}`;
      let sqlOp;

      switch (operator) {
        case 'ne': sqlOp = '!='; break;
        case 'like': sqlOp = 'LIKE'; break;
        case 'gt': sqlOp = '>'; break;
        case 'lt': sqlOp = '<'; break;
        case 'gte': sqlOp = '>='; break;
        case 'lte': sqlOp = '<='; break;
        case 'in':
          if (!Array.isArray(value) || value.length === 0) return '0=1'; // empty IN list is always false
          const inParams = value.map(v => {
            const pk = `param_${paramIndex++}`;
            replacements[pk] = v;
            return `:${pk}`;
          });
          return `${key} IN (${inParams.join(', ')})`;
          break;
        default: sqlOp = '='; break;
      }

      replacements[paramKey] = value;
      return `${key} ${sqlOp} :${paramKey}`;
    };

    const parseWhere = (whereObj) => {
      const clauses = [];

      for (const key in whereObj) {
        const value = whereObj[key];

        if (key === '$or' || key === '$and') {
          const logic = key === '$or' ? 'OR' : 'AND';
          const nestedClauses = value.map(parseWhere).filter(Boolean);
          if (nestedClauses.length) {
            clauses.push(`(${nestedClauses.join(` ${logic} `)})`);
          }
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          for (const op in value) {
            clauses.push(buildCondition(key, op, value[op]));
          }
        } else {
          clauses.push(buildCondition(key, '=', value));
        }
      }

      return clauses.join(' AND ');
    };

    const whereClauseBody = parseWhere(where);
    const whereClause = whereClauseBody ? `WHERE ${whereClauseBody}` : '';
    const groupClause = groupBy ? `GROUP BY ${groupBy}` : '';

    const orderClause = order.length
      ? `ORDER BY ${order.map(([col, dir]) => `${col} ${dir.toUpperCase()}`).join(', ')}`
      : '';

    const rows = await sequelize.query(
      `
      SELECT * FROM ${table}
      ${whereClause}
      ${groupClause}
      ${orderClause}
      LIMIT :limit OFFSET :offset
      `,
      {
        replacements,
        type: sequelize.QueryTypes.SELECT
      }
    );

    const countResult = await sequelize.query(
      `
  SELECT COUNT(*) AS total FROM (
      SELECT 1
      FROM ${table}
      ${whereClause}
      ${groupClause}
  ) AS sub
  `,
      {
        replacements,
        type: sequelize.QueryTypes.SELECT
      }
    );

    const total = countResult[0]?.total || 0;

    return {
      status: 'success',
      message: rows.length === 0 ? 'No data found' : '',
      data: rows,
      meta: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: rows.length === 0 ? 0 : page,
        perPage: limit
      }
    };
  },
  fetchPriceRange: async function (table, options = {}) {
    const where = options.where || {};
    const order = options.order || [['created_at', 'DESC']];
    const groupBy = options.groupBy || null;
    const attributes = options.attributes ? options.attributes.toString() : '*';

    let paramIndex = 0;

    const buildCondition = (key, operator, value) => {
      const paramKey = `param_${paramIndex++}`;
      let sqlOp;

      switch (operator) {
        case 'ne': sqlOp = '!='; break;
        case 'like': sqlOp = 'LIKE'; break;
        case 'gt': sqlOp = '>'; break;
        case 'lt': sqlOp = '<'; break;
        case 'gte': sqlOp = '>='; break;
        case 'lte': sqlOp = '<='; break;
        default: sqlOp = '='; break;
      }

      replacements[paramKey] = value;
      return `${key} ${sqlOp} :${paramKey}`;
    };

    const parseWhere = (whereObj) => {
      const clauses = [];

      for (const key in whereObj) {
        const value = whereObj[key];

        if (key === '$or' || key === '$and') {
          const logic = key === '$or' ? 'OR' : 'AND';
          const nestedClauses = value.map(parseWhere).filter(Boolean);
          if (nestedClauses.length) {
            clauses.push(`(${nestedClauses.join(` ${logic} `)})`);
          }
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          for (const op in value) {
            clauses.push(buildCondition(key, op, value[op]));
          }
        } else {
          clauses.push(buildCondition(key, '=', value));
        }
      }

      return clauses.join(' AND ');
    };

    const whereClauseBody = parseWhere(where);
    const whereClause = whereClauseBody ? `WHERE ${whereClauseBody}` : '';
    const groupClause = groupBy ? `GROUP BY ${groupBy}` : '';

    const orderClause = order.length
      ? `ORDER BY ${order.map(([col, dir]) => `${col} ${dir.toUpperCase()}`).join(', ')}`
      : '';

    const rows = await sequelize.query(
      `
      SELECT
      ${attributes}
      FROM ${table}
      ${whereClause}
      ${groupClause}
      ${orderClause}
      LIMIT 1
      `,
      {
        type: sequelize.QueryTypes.SELECT
      }
    );

    const resultArray = rows.length > 0 ? Object.values(rows[0]) : [];

    return resultArray.length > 0 ? resultArray[0] : 0;
  },
  findBySLUG: async function (model, slug, submodels = []) {
    try {
      const data = await model.findOne({
        include: submodels, // dynamically include associations
        where: { slug: slug }

      });

      if (!data) {
        return {
          status: "error",
          message: `No ${model.name} found with ID ${id}`,
          data: null,
        };
      }

      return data.get({ plain: true });
    } catch (error) {
      return {
        status: "error",
        message: error.message,
        data: null,
      };
    }
  },
  viewParking: async function (id) {
    try {
      const parking_space = await helpers.findByID(ParkingSpace, id, [
        {
          model: ParkingSlot,
          as: "parkingslots",
        },

      ]);

      return parking_space;

    } catch (error) {
      return {
        status: "error",
        message: error.message,
        data: null,
      };
    }
  },
  paymentSummary: async function (owner_id) {
    try {

      const total_income = await Booking.findOne({
        attributes: [

          [fn("SUM", col("billing.net_fees")), "total_income"],
        ],
        include: [
          {
            model: Billing,
            as: "billing", // must match the alias used in `belongsTo`,
            attributes: [],
          }
        ],

        raw: true
      });
      const this_month_income = await Booking.findOne({
        attributes: [[fn("SUM", col("billing.net_fees")), "montly_income"]],
        where: {
          [Op.and]: [
            where(fn("MONTH", col("Booking.created_at")), moment().utc().format('MM')),   // September
            where(fn("YEAR", col("Booking.created_at")), moment().utc().format('YYYY'))  // Year 2025
          ]
        },
        include: [
          {
            model: Billing,
            as: "billing", // must match the alias used in `belongsTo`,
            attributes: [],
          }
        ],
        raw: true
      });
      const this_year_income = await Booking.findOne({
        attributes: [[fn("SUM", col("billing.net_fees")), "yearly_income"]],
        where: where(fn("YEAR", col("Booking.created_at")), moment().utc().format('YYYY')),
        include: [
          {
            model: Billing,
            as: "billing", // must match the alias used in `belongsTo`,
            attributes: [],
          },
          {
            model: ParkingSlot,
            as: "parking_slot", // must match the alias used in `belongsTo`,
            attributes: [],
            include: [{
              model: ParkingSpace,
              as: "parking_space", // must match the alias used in `belongsTo`,
              attributes: [],
              where: { owner_id: owner_id }
            }],
          }
        ],

        raw: true
      });
      const today_income = await Booking.findOne({
        attributes: [[fn("SUM", col("billing.net_fees")), "today_income"]],
        where: where(fn("DATE", col("Booking.created_at")), moment().utc().format('YYYY-MM-DD')),
        include: [
          {
            model: Billing,
            as: "billing", // must match the alias used in `belongsTo`,
            attributes: [],
          },
          {
            model: ParkingSlot,
            as: "parking_slot", // must match the alias used in `belongsTo`,
            attributes: [],
            include: [{
              model: ParkingSpace,
              as: "parking_space", // must match the alias used in `belongsTo`,
              attributes: [],
              where: { owner_id: owner_id }
            }],
          }
        ],

        raw: true
      });
      return { total_income, this_month_income, this_year_income, today_income };


    } catch (error) {
      return {
        status: "error",
        message: error.message,
        data: null,
      };
    }
  },
  paymentSummaryAdmin: async function () {
    try {
      const total_income = await Booking.findOne({
        attributes: [

          [fn("SUM", col("billing.net_fees")), "total_income"],
        ],
        include: [
          {
            model: Billing,
            as: "billing", // must match the alias used in `belongsTo`,
            attributes: [],
          }
        ],

        raw: true
      });
      const this_month_income = await Booking.findOne({
        attributes: [[fn("SUM", col("billing.net_fees")), "montly_income"]],
        where: {
          [Op.and]: [
            where(fn("MONTH", col("Booking.created_at")), moment().utc().format('MM')),   // September
            where(fn("YEAR", col("Booking.created_at")), moment().utc().format('YYYY'))  // Year 2025
          ]
        },
        include: [
          {
            model: Billing,
            as: "billing", // must match the alias used in `belongsTo`,
            attributes: [],
          }
        ],
        raw: true
      });
      const this_year_income = await Booking.findOne({
        attributes: [[fn("SUM", col("billing.net_fees")), "yearly_income"]],
        where: where(fn("YEAR", col("Booking.created_at")), moment().utc().format('YYYY')),
        include: [
          {
            model: Billing,
            as: "billing", // must match the alias used in `belongsTo`,
            attributes: [],
          },

        ],

        raw: true
      });
      const today_income = await Booking.findOne({
        attributes: [[fn("SUM", col("billing.net_fees")), "today_income"]],
        where: where(fn("DATE", col("Booking.created_at")), moment().utc().format('YYYY-MM-DD')),
        include: [
          {
            model: Billing,
            as: "billing", // must match the alias used in `belongsTo`,
            attributes: [],
          },

        ],

        raw: true
      });
      return { total_income, this_month_income, this_year_income, today_income };


    } catch (error) {
      return {
        status: "error",
        message: error.message,
        data: null,
      };
    }
  },
  monthlyCollection: async function (year, owner_id) {
    try {
      const data = await Booking.findAll({
        attributes: [
          [fn("MONTH", col("Booking.created_at")), "month"],
          [fn("SUM", col("billing.net_fees")), "total_income"],
        ],
        where: sequelize.where(fn("YEAR", col("Booking.created_at")), year),
        group: [fn("MONTH", col("Booking.created_at"))],
        include: [
          {
            model: Billing,
            as: "billing", // must match the alias used in `belongsTo`,
            attributes: [],
          },
          {
            model: ParkingSlot,
            as: "parking_slot", // must match the alias used in `belongsTo`,
            attributes: [],
            include: [{
              model: ParkingSpace,
              as: "parking_space", // must match the alias used in `belongsTo`,
              attributes: [],
              where: { owner_id: owner_id }
            }],
          }
        ],

        raw: true
      });
      // Fill missing months
      let results = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const found = data.find(d => d.month == month);
        return {
          month,
          total_income: found ? found.total_income : 0,
        };
      });

      return { results };


    } catch (error) {
      return {
        status: "error",
        message: error.message,
        data: null,
      };
    }
  },
  quarterlyCollection: async function (year, owner_id) {
    try {
      const data = await Booking.findAll({
        attributes: [
          [fn("QUARTER", col("Booking.created_at")), "quarter"],
          [fn("SUM", col("billing.net_fees")), "total_income"],
        ],
        where: sequelize.where(fn("YEAR", col("Booking.created_at")), year),
        group: [fn("QUARTER", col("Booking.created_at"))],
        include: [
          {
            model: Billing,
            as: "billing", // must match the alias used in `belongsTo`,
            attributes: [],
          },
          {
            model: ParkingSlot,
            as: "parking_slot", // must match the alias used in `belongsTo`,
            attributes: [],
            include: [{
              model: ParkingSpace,
              as: "parking_space", // must match the alias used in `belongsTo`,
              attributes: [],
              where: { owner_id: owner_id }
            }],
          }
        ],

        raw: true
      });
      // Fill missing months
      let results = Array.from({ length: 4 }, (_, i) => {
        const quarter = i + 1;
        const found = data.find(d => d.quarter == quarter);
        return {
          label: quarter,
          total_income: found ? found.total_income : 0,
        };
      });

      return { results };


    } catch (error) {
      return {
        status: "error",
        message: error.message,
        data: null,
      };
    }
  },
  dailyCollection: async function (year, month, owner_id) {
    try {
      const data = await Booking.findAll({
        attributes: [
          [fn("DAY", col("Booking.created_at")), "day"],
          [fn("SUM", col("billing.net_fees")), "total_income"],
        ],
        where: {
          [Op.and]: [
            where(fn("YEAR", col("Booking.created_at")), year),
            where(fn("MONTH", col("Booking.created_at")), month),
          ],
        },
        group: [fn("DAY", col("Booking.created_at"))],
        include: [
          {
            model: Billing,
            as: "billing", // must match the alias used in `belongsTo`,
            attributes: [],
          },
          {
            model: ParkingSlot,
            as: "parking_slot", // must match the alias used in `belongsTo`,
            attributes: [],
            include: [{
              model: ParkingSpace,
              as: "parking_space", // must match the alias used in `belongsTo`,
              attributes: [],
              where: { owner_id: owner_id }
            }],
          }
        ],

        raw: true
      });
      // Step 2: Fill missing days
      const daysInMonth = moment(`${year}-${month}`, "YYYY-MM").daysInMonth();

      let results = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const found = data.find(d => d.day == day);
        return {
          label: `${String(day).padStart(2, "0")}`,
          total_income: found ? found.total_income : 0,
        };
      });
      return { results };


    } catch (error) {
      return {
        status: "error",
        message: error.message,
        data: null,
      };
    }
  },
  monthlyCollectionAdmin: async function (year) {
    try {
      const data = await Booking.findAll({
        attributes: [
          [fn("MONTH", col("Booking.created_at")), "month"],
          [fn("SUM", col("billing.net_fees")), "total_income"],
        ],
        where: sequelize.where(fn("YEAR", col("Booking.created_at")), year),
        group: [fn("MONTH", col("Booking.created_at"))],
        include: [
          {
            model: Billing,
            as: "billing", // must match the alias used in `belongsTo`,
            attributes: [],
          },

        ],

        raw: true
      });
      // Fill missing months
      let results = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const found = data.find(d => d.month == month);
        return {
          month,
          total_income: found ? found.total_income : 0,
        };
      });

      return { results };


    } catch (error) {
      return {
        status: "error",
        message: error.message,
        data: null,
      };
    }
  },
  quarterlyCollectionAdmin: async function (year) {
    try {
      const data = await Booking.findAll({
        attributes: [
          [fn("QUARTER", col("Booking.created_at")), "quarter"],
          [fn("SUM", col("billing.net_fees")), "total_income"],
        ],
        where: sequelize.where(fn("YEAR", col("Booking.created_at")), year),
        group: [fn("QUARTER", col("Booking.created_at"))],
        include: [
          {
            model: Billing,
            as: "billing", // must match the alias used in `belongsTo`,
            attributes: [],
          },

        ]
      });
      // Fill missing months
      let results = Array.from({ length: 4 }, (_, i) => {
        const quarter = i + 1;
        const found = data.find(d => d.quarter == quarter);
        return {
          label: quarter,
          total_income: found ? found.total_income : 0,
        };
      });

      return { results };


    } catch (error) {
      return {
        status: "error",
        message: error.message,
        data: null,
      };
    }
  },
  dailyCollectionAdmin: async function (year, month) {
    try {
      const data = await Booking.findAll({
        attributes: [
          [fn("DAY", col("Booking.created_at")), "day"],
          [fn("SUM", col("billing.net_fees")), "total_income"],
        ],
        where: {
          [Op.and]: [
            where(fn("YEAR", col("Booking.created_at")), year),
            where(fn("MONTH", col("Booking.created_at")), month),
          ],
        },
        group: [fn("DAY", col("Booking.created_at"))],
        include: [
          {
            model: Billing,
            as: "billing", // must match the alias used in `belongsTo`,
            attributes: [],
          },

        ],

        raw: true
      });
      // Step 2: Fill missing days
      const daysInMonth = moment(`${year}-${month}`, "YYYY-MM").daysInMonth();

      let results = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const found = data.find(d => d.day == day);
        return {
          label: `${String(day).padStart(2, "0")}`,
          total_income: found ? found.total_income : 0,
        };
      });
      return { results };


    } catch (error) {
      return {
        status: "error",
        message: error.message,
        data: null,
      };
    }
  },
  monthlyBooking: async function (year, owner_id) {
    try {
      const data = await Booking.findAll({
        attributes: [
          [fn("MONTH", col("Booking.created_at")), "month"],
          [fn("COUNT", col("billing.id")), "total_booking"],
        ],
        where: sequelize.where(fn("YEAR", col("Booking.created_at")), year),
        group: [fn("MONTH", col("Booking.created_at"))],
        include: [
          {
            model: Billing,
            as: "billing", // must match the alias used in `belongsTo`,
            attributes: [],
          },
          {
            model: ParkingSlot,
            as: "parking_slot", // must match the alias used in `belongsTo`,
            attributes: [],
            include: [{
              model: ParkingSpace,
              as: "parking_space", // must match the alias used in `belongsTo`,
              attributes: [],
              where: { owner_id: owner_id }
            }],
          }
        ],

        raw: true
      });
      // Fill missing months
      let results = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const found = data.find(d => d.month == month);
        return {
          month,
          total_booking: found ? found.total_booking : 0,
        };
      });

      return { results };


    } catch (error) {
      return {
        status: "error",
        message: error.message,
        data: null,
      };
    }
  },
  quarterlyBooking: async function (year, owner_id) {
    try {
      const data = await Booking.findAll({
        attributes: [
          [fn("QUARTER", col("Booking.created_at")), "quarter"],
          [fn("COUNT", col("billing.id")), "total_booking"],
        ],
        where: sequelize.where(fn("YEAR", col("Booking.created_at")), year),
        group: [fn("QUARTER", col("Booking.created_at"))],
        include: [
          {
            model: Billing,
            as: "billing", // must match the alias used in `belongsTo`,
            attributes: [],
          },
          {
            model: ParkingSlot,
            as: "parking_slot", // must match the alias used in `belongsTo`,
            attributes: [],
            include: [{
              model: ParkingSpace,
              as: "parking_space", // must match the alias used in `belongsTo`,
              attributes: [],
              where: { owner_id: owner_id }
            }],
          }
        ],

        raw: true
      });
      // Fill missing months
      let results = Array.from({ length: 4 }, (_, i) => {
        const quarter = i + 1;
        const found = data.find(d => d.quarter == quarter);
        return {
          label: quarter,
          total_booking: found ? found.total_booking : 0,
        };
      });

      return { results };


    } catch (error) {
      return {
        status: "error",
        message: error.message,
        data: null,
      };
    }
  },
  dailyBooking: async function (year, month, owner_id) {
    try {
      const data = await Booking.findAll({
        attributes: [
          [fn("DAY", col("Booking.created_at")), "day"],
          [fn("COUNT", col("billing.id")), "total_booking"],
        ],
        where: {
          [Op.and]: [
            where(fn("YEAR", col("Booking.created_at")), year),
            where(fn("MONTH", col("Booking.created_at")), month),
          ],
        },
        group: [fn("DAY", col("Booking.created_at"))],
        include: [
          {
            model: Billing,
            as: "billing", // must match the alias used in `belongsTo`,
            attributes: [],
          },
          {
            model: ParkingSlot,
            as: "parking_slot", // must match the alias used in `belongsTo`,
            attributes: [],
            include: [{
              model: ParkingSpace,
              as: "parking_space", // must match the alias used in `belongsTo`,
              attributes: [],
              where: { owner_id: owner_id }
            }],
          }
        ],

        raw: true
      });
      // Step 2: Fill missing days
      const daysInMonth = moment(`${year}-${month}`, "YYYY-MM").daysInMonth();

      let results = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const found = data.find(d => d.day == day);
        return {
          label: `${String(day).padStart(2, "0")}`,
          total_booking: found ? found.total_booking : 0,
        };
      });
      return { results };


    } catch (error) {
      return {
        status: "error",
        message: error.message,
        data: null,
      };
    }
  },
   monthlyBookingAdmin: async function (year) {
    try {
      const data = await Booking.findAll({
        attributes: [
          [fn("MONTH", col("Booking.created_at")), "month"],
          [fn("COUNT", col("billing.id")), "total_booking"],
        ],
        where: sequelize.where(fn("YEAR", col("Booking.created_at")), year),
        group: [fn("MONTH", col("Booking.created_at"))],
        include: [
          {
            model: Billing,
            as: "billing", // must match the alias used in `belongsTo`,
            attributes: [],
          },

        ],

        raw: true
      });
      // Fill missing months
      let results = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const found = data.find(d => d.month == month);
        return {
          month,
          total_booking: found ? found.total_booking : 0,
        };
      });

      return { results };


    } catch (error) {
      return {
        status: "error",
        message: error.message,
        data: null,
      };
    }
  },
  quarterlyBookingAdmin: async function (year) {
    try {
      const data = await Booking.findAll({
        attributes: [
          [fn("QUARTER", col("Booking.created_at")), "quarter"],
          [fn("COUNT", col("billing.id")), "total_booking"],
        ],
        where: sequelize.where(fn("YEAR", col("Booking.created_at")), year),
        group: [fn("QUARTER", col("Booking.created_at"))],
        include: [
          {
            model: Billing,
            as: "billing", // must match the alias used in `belongsTo`,
            attributes: [],
          },

        ],

        raw: true
      });
      // Fill missing months
      let results = Array.from({ length: 4 }, (_, i) => {
        const quarter = i + 1;
        const found = data.find(d => d.quarter == quarter);
        return {
          label: quarter,
          total_booking: found ? found.total_booking : 0,
        };
      });

      return { results };


    } catch (error) {
      return {
        status: "error",
        message: error.message,
        data: null,
      };
    }
  },
  dailyBookingAdmin: async function (year, month) {
    try {
      const data = await Booking.findAll({
        attributes: [
          [fn("DAY", col("Booking.created_at")), "day"],
          [fn("COUNT", col("billing.id")), "total_booking"],
        ],
        where: {
          [Op.and]: [
            where(fn("YEAR", col("Booking.created_at")), year),
            where(fn("MONTH", col("Booking.created_at")), month),
          ],
        },
        group: [fn("DAY", col("Booking.created_at"))],
        include: [
          {
            model: Billing,
            as: "billing", // must match the alias used in `belongsTo`,
            attributes: [],
          },

        ],

        raw: true
      });
      // Step 2: Fill missing days
      const daysInMonth = moment(`${year}-${month}`, "YYYY-MM").daysInMonth();

      let results = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const found = data.find(d => d.day == day);
        return {
          label: `${String(day).padStart(2, "0")}`,
          total_booking: found ? found.total_booking : 0,
        };
      });
      return { results };


    } catch (error) {
      return {
        status: "error",
        message: error.message,
        data: null,
      };
    }
  },
  viewVacantSlot: async function (parking_slot_id, reqStart, reqEnd, owner_id) {
    try {
      const bookedSlots = await Booking.findAll({
        where: {
          booking_start: { [Op.lt]: reqEnd },
          booking_end: { [Op.gt]: reqStart }
        },
        attributes: ["parking_slot_id"]
      });

      const bookedSlotIds = bookedSlots.map(b => b.parking_slot_id);

      // step 2: find free slots (NOT in booked list)
      const freeSlots = await ParkingSlot.findAll({
        where: {
          id: { [Op.notIn]: bookedSlotIds },
          parking_space_id: {
            [Op.in]: Sequelize.literal(
              `(SELECT id FROM parking_spaces WHERE owner_id = ${owner_id})`
            )
          }
        },
        attributes: ["id", "slot_code"],
        include: [
          {
            model: ParkingSpace,
            as: "parking_space",
            attributes: ["id"],
            where: { owner_id }
          }
        ]
      });
      return freeSlots.map(s => s.slot_code);

    } catch (error) {
      return {
        status: "error",
        message: error.message,
        data: null,
      };
    }
  },


}


