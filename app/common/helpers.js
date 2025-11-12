// const { Validator } = require('node-input-validator');
const niv = require("node-input-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const http = require("http");
const { Op } = require("sequelize");
const sequelize = require("../../config/db");
const Otp = require("../models/Otp");
const moment = require("moment");
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

dayjs.extend(utc);
dayjs.extend(timezone);


module.exports = {
  bcryptMake: async function (string) {
    if (string) {
      return bcrypt.hashSync(string, parseInt(global.CONFIG.bcrypt.saltrounds));
    } else {
      return false;
    }
  },
  decodeBase64: async function (str) {
    try {
      return Buffer.from(str, "base64").toString("utf-8");
    } catch (err) {
      return null;
    }
  },
  convertTZ: async function (date, tzString) {
    return new Date(
      (typeof date === "string" ? new Date(date) : date).toLocaleString(
        "en-US",
        { timeZone: tzString }
      )
    );
  },
  toUTC: async function (localDateTime, userTimezone) {
    return dayjs.tz(localDateTime, userTimezone).utc().toDate();
  },

  toLocal: async function (utcDateTime, userTimezone) {
    return dayjs.utc(utcDateTime).tz(userTimezone).format('YYYY-MM-DD HH:mm');
  },
  toUTCStart: async function (userDate, userTz) {
    const utcStart = dayjs.tz(userDate, userTz).startOf('day').utc().format('YYYY-MM-DD HH:mm:ss');
    return utcStart;
  },
  toUTCEnd: async function (userDate, userTz) {
    const utcEnd = dayjs.tz(userDate, userTz).endOf('day').utc().format('YYYY-MM-DD HH:mm:ss');
    return utcEnd;

  },
  toLocal: async function (utcDateTime, userTimezone) {
    return dayjs.utc(utcDateTime).tz(userTimezone).format('YYYY-MM-DD HH:mm');
  },
  getAllDays: async function (start, end) {
    const result = [];
    let current = dayjs(start);
    const last = dayjs(end);

    while (current.isBefore(last) || current.isSame(last, 'day')) {
      result.push(current.format('YYYY-MM-DD'));
      current = current.add(1, 'day');
    }

    return result;
  },
  getWeekdaysBetween: async function (start, end) {
    const days = [];
    let current = dayjs(start);
    const last = dayjs(end);

    while (current.isBefore(last) || current.isSame(last, 'day')) {
      const dayOfWeek = current.day(); // 0 = Sunday, 6 = Saturday
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        days.push(current.format('YYYY-MM-DD'));
      }
      current = current.add(1, 'day');
    }

    return days;
  },
  bcryptCheck: async function (string, hash) {
    if (string && hash) {
      return bcrypt.compareSync(string, hash);
    } else {
      return false;
    }
  },

  validator: async function (rules, request, messages = {}) {
    const v = new niv.Validator(request, rules, messages);
    const matched = await v.check();
    if (!matched) {
      return { status: false, errors: v.errors };
    } else {
      return { status: true };
    }
  },
  customvalidator: async function (rules, request, messages = {}) {
    const v = new niv.Validator(request, rules, messages);
    v.addPostRule(async function (input) {
      if (!request.weekday && !request.weekend) {
        v.addError(
          'weekday',               // attach error to a field
          'atLeastOne',            // custom rule name
          'At least one of weekday or weekend must be checked.' // message
        );
      }
    });
    const matched = await v.check();
    if (!matched) {
      return { status: false, errors: v.errors };
    } else {
      return { status: true };
    }
  },
  parkingvalidator: async function (rules, request) {
    const v = new niv.Validator(request, rules);
    v.addPostRule(async (validatorInstance) => {
      const weekdaySlot = validatorInstance.inputs["weekday_slot"];
      const weekendSlot = validatorInstance.inputs["weekend_slot"];

      if (!weekdaySlot && !weekendSlot) {
        validatorInstance.addError(
          "weekday_slot",
          "oneSlotRequired",
          "At least one of weekday_slot or weekend_slot must be true."
        );
        validatorInstance.addError(
          "weekend_slot",
          "oneSlotRequired",
          "At least one of weekday_slot or weekend_slot must be true."
        );
      }
    });
    const matched = await v.check();
    if (!matched) {
      return { status: false, errors: v.errors };
    } else {
      return { status: true };
    }
  },

  generateJwtToken: async function (document) {
    // const options = { expiresIn: '365d' };
    const options = {};
    const token = jwt.sign(document, process.env.JWT_SECRET, options);
    return token;
  },
  isEmptyObject: async function (obj) {
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        return false;
      }
    }
    return true;
  },
  sleep: async function (millis) {
    return new Promise((resolve) => setTimeout(resolve, millis));
  },
  generateRandomString: async function (length = 10) {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  },
  generate6DigitCode: async function () {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },
  createSlug: async function (text) {
    // Convert to lowercase
    let slug = text.toLowerCase();

    // Remove leading/trailing whitespace
    slug = slug.trim();

    // Replace special characters with spaces (excluding alphanumeric and hyphens)
    slug = slug.replace(/[^a-z0-9\s-]/g, "");

    // Replace spaces and multiple hyphens with a single hyphen
    slug = slug.replace(/\s+/g, "-").replace(/-+/g, "-");

    // Remove leading/trailing hyphens
    slug = slug.replace(/^-+|-+$/g, "");

    return slug;
  },
  generateTimeSlots: async function (start, end, stepMinutes) {
    const slots = [];
    let current = new Date(`1970-01-01T${start}`);
    const endTime = new Date(`1970-01-01T${end}`);

    while (current < endTime) {
      // Format as hh:mm A
      let hours = current.getHours();
      let minutes = current.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 becomes 12
      const strTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${ampm}`;

      slots.push(strTime);

      // add step
      current.setMinutes(current.getMinutes() + stepMinutes);
    }
    return slots;
  },
  getDatesBetween: async function (startDate, endDate) {
    const moment = require("moment");

    const dates = [];
    let current = moment(startDate).add(1, "day"); // start from +1 day
    const last = moment(endDate);

    while (current.isSameOrBefore(last, "day")) {
      dates.push(current.format("YYYY-MM-DD"));
      current.add(1, "day");
    }

    return [startDate,...dates];
  },
  getsWeekDays: async function (start, end) {
    const days = [];
    let current = dayjs(start);
    const last = dayjs(end);

    while (current.isBefore(last) || current.isSame(last, 'day')) {
      const dayOfWeek = current.day(); // 0 = Sunday, 6 = Saturday
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        days.push(current.format('YYYY-MM-DD'));
      }
      current = current.add(1, 'day');
    }

    return days;
  },
  getsWeekends: async function (start, end) {
    const days = [];
    let current = dayjs(start);
    const last = dayjs(end);

    while (current.isBefore(last) || current.isSame(last, 'day')) {
      const dayOfWeek = current.day(); // 0 = Sunday, 6 = Saturday
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        days.push(current.format('YYYY-MM-DD'));
      }
      current = current.add(1, 'day');
    }

    return days;
  },
  concatDateTimeStr: async function (dateStr, timeStr) {
    // Ensure time is in 24-hour format
    let [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    return `${dateStr} ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
  },
  createOtp: async function (otpData) {
    try {
      otpData.otp = await this.generate6DigitCode();
      await Otp.create(otpData);
      return otpData.otp;
    } catch (error) {
      //console.log(error);
      return false;
    }
  },
  fetchallData: async function (model, options = {}) {
    options.where = {
      ...options.where,
    };
    if (!options.attributes) {
      delete options.attributes; // ensures all fields are returned
    }

    const rows = await model.findAll(options);

    return {
      status: "success",
      message: rows.length === 0 ? "No data found" : "",
      data: rows,
      meta: {
        totalItems: rows.length,
      },
    };
  },
  paginateData: async function (model, options = {}, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    options.where = {
      ...options.where,
    };
    if (!options.attributes) {
      delete options.attributes; // ensures all fields are returned
    }

    const { count, rows } = await model.findAndCountAll({
      ...options,
      offset,
      limit,
    });

    // 🧠 Override count if no rows returned for current page
    const overrideCount = rows.length === 0 ? 0 : count;
    const totalPages = Math.ceil(overrideCount / limit);

    return {
      status: "success",
      message: rows.length === 0 ? "No data found" : "",
      data: rows,
      meta: {
        totalItems: overrideCount,
        totalPages: rows.length === 0 ? 0 : totalPages,
        currentPage: rows.length === 0 ? 0 : page,
        perPage: limit,
      },
    };
  },
  findByID: async function (model, id, submodels = []) {
    try {
      const data = await model.findByPk(id, {
        include: submodels, // dynamically include associations
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

  fetchsingleData: async function (model, options = {}) {
    options.where = {
      ...options.where,
    };
    if (!options.attributes) {
      delete options.attributes; // ensures all fields are returned
    }

    const row = await model.findOne(options);

    return row;
  },
  fetchCount: async function (model, options = {}) {
    options.where = {
      ...options.where,
    };
    if (!options.attributes) {
      delete options.attributes; // ensures all fields are returned
    }

    const { count } = await model.findAndCountAll({
      ...options,
    });
    return count || 0;
  },
  timeDifference: async function (start, end) {
    const startTime = moment(start);
    const endTime = moment(end);

    const diffMinutes = endTime.diff(startTime, "minutes"); // total minutes
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours >= 24) {
      const remainingHours = diffHours % 24;
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ${remainingHours} hour${remainingHours !== 1 ? "s" : ""}`;
    } else {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""}`;
    }
  },
};

// Node-Input-Validator Unique Rule Function
niv.extend("unique", async ({ value, args }) => {
  const modelName = args[0]; // Sequelize model name
  const field = args[1]; // Field to check
  const ignoreId = args[2]; // Optional ID to exclude

  // Get the Sequelize model
  const Model = require(`../models/${modelName}`);
  // Build the condition
  let condition = {};
  condition[field] = value;

  if (ignoreId) {
    condition.id = { [Op.ne]: ignoreId }; // assuming primary key is `id`
  }
  // Check if a record already exists
  const rowExists = await Model.findOne({
    where: condition,
    attributes: [field],
  });
  return !rowExists;
});

niv.extend("allExists", async ({ value, args }) => {
  if (!Array.isArray(value)) return false;

  const column = args[1]; // 'id'

  const Model = require(`../models/${args[0]}`);

  const existingRecords = await Model.findAll({
    where: { [column]: value },
    attributes: [column],
    raw: true,
  });

  const existingIds = existingRecords.map((r) => r[column]);

  // All sent IDs must exist
  return value.every((id) => existingIds.includes(id));
});

niv.extend("exists", async ({ value, args }) => {
  const [modelName, field] = args;
  const Model = require(`../models/${modelName}`);
  let condition = {};
  condition[field] = value;
  const rowExists = await Model.findOne({
    where: condition,
    attributes: [field],
  });
  return !!rowExists;
});
niv.extend(
  "oneSlotRequired",
  function ({ value, args }) {
    const inputs = this.validator.inputs;
    const weekdaySlot = inputs["weekday_slot"];
    const weekendSlot = inputs["weekend_slot"];

    if (weekdaySlot || weekendSlot) {
      return true;
    }
    return false;
  },
  "At least one of weekday_slot or weekend_slot must be true."
);

niv.extend(
  "lessThanOrEqualToField",
  function ({ value, args }) {
    const inputs = this.validator.inputs;
    const compareValue = inputs["total_slot"];
    return +(value) <= (+(compareValue));


  },
  "The Parking Slot must be less than or equal to Total Slot"
);
niv.extend('afterDate', async ({ value, args }, validator) => {
  const [field] = args; // e.g. "start_date"
  const startDate = validator.inputs[field];
  if (!startDate) return false;

  const start = new Date(startDate);
  const end = new Date(value);

  return end > start; // must be greater

}, "End date must be greater than start date");

