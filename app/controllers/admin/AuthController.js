const helpers = require("../../common/helpers");
const emailHelper = require("../../common/email_helper");

const User = require("../../models/User");
const ParkingSpace = require("../../models/ParkingSpace");

const Otp = require("../../models/Otp");

const UserResource = require("../../resources/User/UserResource");
const { Op } = require('sequelize');
module.exports = {
  login: async function (req, resp) {
    let data = {};
    try {

      let rules = {
        email: `required|email`,
        password: `required|length:${global.CONFIG.rules.password.maxlength},${global.CONFIG.rules.password.minlength}`
      };

      const v = await helpers.validator(rules, req.body);
      if (!v.status) {
        data.errors = v.errors;
        return resp.status(200).json({
          status: "val_error",
          message: "Validation Error",
          data: data
        });
      }

      // Sequelize-based user query
      const user = await User.findOne({
        where: {
          email: req.body.email,
          status: { [Op.ne]: 'D' },  // ✅ not equal to 'D'
          role:'A'
        },
      });


      if (!user) {
        return resp.status(200).json({
          status: "error",
          message: "The email you entered is invalid",
          data: data
        });
      }


      const passwordValid = await helpers.bcryptCheck(req.body.password, user.password);
      if (!passwordValid) {
        return resp.status(200).json({
          status: "error",
          message: "The password you entered is invalid",
          data: data
        });
      }

      data.user = new UserResource(user).toArray(); // No .exec() needed
      data.token = await helpers.generateJwtToken({
        id: data.user.id,
        email: data.user.email,
        role: data.user.role
      });

      return resp.status(200).json({
        status: "success",
        message: "Logged in Successfully",
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

  verifyOtp: async function (req, resp) {
    let data = {};
    try {

      let rules = {
        user_id: `required|exists:User,id`,
        otp: `required|exists:Otp,otp`,
        otp_type: `required|in:E,M`,

      };

      const v = await helpers.validator(rules, req.body);
      if (!v.status) {
        data.errors = v.errors;
        return resp.status(200).json({
          status: "val_error",
          message: "Validation Error",
          data: data
        });
      }
      const { otp, user_id, otp_type } = req.body;
      const option = {
        where: { otp, user_id, otp_type }, order: [['created_at', 'DESC']],
        limit: 1
      }
      const otpData = await helpers.fetchallData(Otp, option);
      if (!otpData.data) {
        return resp.status(200).json({
          status: "error",
          message: "Sorry!! Otp Mismatch",
          data: data
        });
      }
      await User.update({ email_verified_at: new Date() }, {
        where: { id: user_id }
      });
      const user = await helpers.findByID(User, user_id, [{
        model: ParkingSpace,
        as: "parking_spaces",
      }]);

      data.user = new UserResource(user).toArray(); // No .exec() needed
      data.token = await helpers.generateJwtToken({
        id: user.id,
        email: user.email,
        user_type: user.role
      });
      return resp.status(200).json({
        status: "success",
        message: "Logged in Successfully",
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
  resendOtp: async function (req, resp) {
    let data = {};
    try {

      let rules = {
        user_id: `required|exists:User,id`,
        otp_type: `required|in:E,M,F`,
      };

      const v = await helpers.validator(rules, req.body);
      if (!v.status) {
        data.errors = v.errors;
        return resp.status(200).json({
          status: "val_error",
          message: "Validation Error",
          data: data
        });
      }
      const { user_id, otp_type } = req.body;
      const result = await helpers.createOtp({ user_id, otp_type });
      const options = [
        {
          model: ParkingSpace,
          as: "parking_spaces",
        },
      ]
      const newUser = await helpers.findByID(User, user_id, options);
      if (!result) {
        return resp.status(200).json({
          status: "error",
          message: "Something went wrong with otp.",
          data: data
        });
      }
      let send_email;
      if (otp_type == 'E') {
        send_email = await emailHelper.sendMail(req, {
          to: newUser?.email,
          subject: process.env.APP_NAME + ` - Confirm your login with code ${result}`,
          type: "verify-email",
          data: {
            year: new Date().getFullYear(),
            otp: result,
            logo: process.env.LOGO,
            app_name: process.env.APP_NAME,
            support_email: process.env.SUPPORT_EMAIL

          }
        });
      }
      else if (otp_type == 'F') {
        const send_email = await emailHelper.sendMail(req, {
        to: newUser?.email,
        subject: process.env.APP_NAME + ` - Password reset with code ${result}`,
        type: "forget-password",
        data: {
          year: new Date().getFullYear(),
          otp: result,
          logo: process.env.LOGO,
          app_name: process.env.APP_NAME,
          support_email: process.env.SUPPORT_EMAIL

        }
      });
      }

      return resp.status(200).json({
        status: "success",
        message: "Please check your email for the new OTP.",
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
  forgetPassword: async function (req, resp) {
    let data = {};
    try {

      let rules = {
        email: `required|email`,
      };

      const v = await helpers.validator(rules, req.body);
      if (!v.status) {
        data.errors = v.errors;
        return resp.status(200).json({
          status: "val_error",
          message: "Validation Error",
          data: data
        });
      }

      // Sequelize-based user query

      const options = {
        where: {
          email: req.body.email,
          status: { [Op.ne]: 'D' }  // ✅ not equal to 'D'
        },
        attribites: ['id', 'name', 'email']
      };

      const user = await helpers.fetchsingleData(User, options);

      if (!user) {
        return resp.status(200).json({
          status: "error",
          message: "The email you entered is invalid",
          data: data
        });
      }

      const otp = await helpers.createOtp({ user_id: user?.id, 'otp_type': 'F' });
      const send_email = await emailHelper.sendMail(req, {
        to: user?.email,
        subject: process.env.APP_NAME + ` - Password reset with code ${otp}`,
        type: "forget-password",
        data: {
          year: new Date().getFullYear(),
          otp: otp,
          logo: process.env.LOGO,
          app_name: process.env.APP_NAME,
          support_email: process.env.SUPPORT_EMAIL

        }
      });
      data = { id: user?.id };
      return resp.status(200).json({
        status: "success",
        message: "OTP Sent Successfully",
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
  resetPassword: async function (req, resp) {
    let data = {};
    try {

      let rules = {
        user_id: `required|exists:User,id`,
        otp: `required|exists:Otp,otp`,
        password: `required|minLength:6`,
        confirm_password: `required|same:password`,
        otp_type: `required|in:F`,

      };
      let messages = {
        'confirm_password.same': 'Passwords do not match.',
        'password.minLength': 'Password must be at least 6 characters.',
        'otp.exists': 'OTP Mismatch.',
        'user_id.exists': 'Not a Valid User ID.'

      };
      const v = await helpers.validator(rules, req.body, messages);
      if (!v.status) {
        data.errors = v.errors;
        return resp.status(200).json({
          status: "val_error",
          message: "Validation Error",
          data: data
        });
      }
      const { otp, user_id, otp_type,password } = req.body;
      const option = {
        where: { otp, user_id, otp_type }, order: [['created_at', 'DESC']],
        limit: 1
      }
      const otpData = await helpers.fetchsingleData(Otp, option);
      if (!otpData) {
        return resp.status(200).json({
          status: "error",
          message: "Sorry!! Otp Mismatch",
          data: data
        });
      }
      const userData = { id: user_id, password: await helpers.bcryptMake(password) };
      await User.upsert(userData);
      return resp.status(200).json({
        status: "success",
        message: "Password has been reset Successfully",
        data: data,
      });

    } catch (e) {
      return resp.status(200).json({
        status: "error",
        message: e.message || "Something went wrong",
        data: data
      });
    }
  }

};
