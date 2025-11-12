const helpers = require("../../common/helpers");
const User = require("../../models/User");
const UserResource = require("../../resources/admin/UserResource");
const { Op, Sequelize, where, fn, col } = require("sequelize");
const db_helpers = require("../../common/db_helpers");
const RULES = require("../../../config/rules");
const moment = require("moment");

module.exports = {
  saveUser: async function (req, resp) {
    let data = {};
    try {

      let rules = {
        email: `required|email|unique:User,email`,
        name: `required`,
        address: `required`,
        phone_no: `required|numeric|minLength:10|maxLength:10|unique:User,phone_no`,
        role: `required|in:O,U`,
      };
      const { id } = req.body;
      if (id) {
        rules.email = `required|email|unique:User,email,${id}`
        rules.phone_no = `required|numeric|minLength:10|maxLength:10|unique:User,phone_no,${id}`;
        rules.password = `nullable|length:${global.CONFIG.rules.password.maxlength},${global.CONFIG.rules.password.minlength}`
      }
      else {
        rules.password = `required|length:${global.CONFIG.rules.password.maxlength},${global.CONFIG.rules.password.minlength}`
      }
      const v = await helpers.validator(rules, req.body);
      if (!v.status) {
        data.errors = v.errors;
        return resp.status(200).json({
          status: "val_error",
          message: "Validation Error",
          data: data
        });
      }
      req.body.password = await helpers.bcryptMake(req.body.password);
      if (!id) {
        req.body.email_verified_at = moment().utc().format('YYYY-MM-DD HH:mm:ss');
      }
      // ✅ Handle image upload
      let photos = [];
      const filesInfo = req.uploadedFiles;

      if (filesInfo.length > 0) {
        // Loop and save file paths to DB if needed
        filesInfo.forEach((file) => {
          // Unique filename
          photos.push(`uploads/profile_photo/${file.name}`);
        });
        req.body.profile_photo = photos.toString();
      }


      const newUser = await User.upsert(req.body);
      return resp.status(200).json({
        status: "success",
        message: "Welcome aboard! Your account has been created successfully.",
        data: data
      });

    } catch (e) {
      return resp.status(200).json({
        status: "error",
        message: e.message || "Something went wrong",
        data: data
      });
    }
  },
  listUsers: async function (req, resp) {
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
      let whereConditions = { status: { [Op.ne]: "D" }, role: { [Op.ne]: "A" } };
      const{searchKey,role,status}=req.body;
      if (searchKey) {
        whereConditions.$or = [
          { name: { like: `%${searchKey}%` } },
          { email: { like: `%${searchKey}%` } },
          { phone_no: { like: `%${searchKey}%` } },

        ]
      }

      const option = {
        where: whereConditions,
        order: [["created_at", "DESC"]],

      };
      const result = await helpers.paginateData(User, option, page, limit);
      result.data=UserResource.collection(result.data)
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
