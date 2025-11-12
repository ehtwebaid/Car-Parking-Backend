const helpers = require("../../common/helpers");
const User = require("../../models/User");
const ParkingSpace = require("../../models/ParkingSpace");
const UserResource = require("../../resources/User/UserResource");

const { Op, Sequelize } = require("sequelize");
module.exports = {
  updateProfile: async function (req, resp) {
    let data = {};
    try {
      let rules = {
        name: `required`,
        email: `required|unique:User,email,${req.auth.id}`,
        phone_no: `required|unique:User,phone_no,${req.auth.id}`,
        address: `required`,

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

      // ✅ Handle image upload
      let photos = [];
      const filesInfo = req.uploadedFiles;

      if (filesInfo.length > 0) {
        // Loop and save file paths to DB if needed
        filesInfo.forEach((file) => {
          // Unique filename
          photos.push(`uploads/profile_photo/${file.name}`);
        });
      }

      const id = req.auth.id;
      profile_photo = photos.toString();
      let {
        name,
        email,
        phone_no,
        address
      } = req.body;
      let userData = {
        id,
        name,
        email,
        phone_no,
        address
      };
      if (profile_photo) {
        userData.profile_photo = profile_photo;
      }
      const [userDetail] = await User.upsert(userData);
      const newUser=await helpers.findByID(User,id,[
       {
        model: ParkingSpace,
        as: 'parking_spaces',   // 👈 alias from User.hasMany()
        attributes:["id"]
      }

      ]);
      return resp.status(200).json({
        status: "success",
        message: "Profile has been updated Successfully",
        data: new UserResource(newUser).toArray(),
      });
    } catch (e) {
      //console.log(e);
      return resp.status(200).json({
        status: "error",
        message: e.message || "Something went wrong",
        data: data,
      });
    }
  },
   changePassword: async function (req, resp) {
    let data = {};
    try {
      let rules = {
       password: `required|length:${global.CONFIG.rules.password.maxlength},${global.CONFIG.rules.password.minlength}`,
       confirm_password: `required|same:password`,
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

      const id = req.auth.id;
      req.body.password = await helpers.bcryptMake(req.body.password);
      const userData={id:id,password:req.body.password};
      await User.upsert(userData);
      return resp.status(200).json({
        status: "success",
        message: "Password has been changed Successfully",
        data: data,
      });
    } catch (e) {
      //console.log(e);
      return resp.status(200).json({
        status: "error",
        message: e.message || "Something went wrong",
        data: data,
      });
    }
  },
};
