const helpers = require("../../common/helpers");
const db_helpers = require("../../common/db_helpers");
const Notification = require("../../models/Notification");
const User = require("../../models/User");

const moment = require("moment");

const { Op, fn, col, where } = require("sequelize");
module.exports = {
 listNotifications: async function (req, resp) {
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
      let whereConditions = { status: { [Op.ne]: "D" },receiver_id:req.auth.id };
       const option = {
        where: whereConditions,
        order: [["created_at", "DESC"]],
        include: [
          {
            model: User,
            as: "sender", // must match the alias used in `belongsTo`,
            attributes: ["id","name","profile_photo"],

          },

        ],
      };
      const result = await helpers.paginateData(Notification, option, page, limit);
      result.data = await Promise.all(result.data.map(async item => {
        const plain = item.get({ plain: true }); // convert Sequelize model → plain object
        plain.sender.profile_photo = plain.sender.profile_photo?process.env.SITE_URL+plain.sender.profile_photo:process.env.SITE_URL+'uploads/no-user.png';
        return plain;
      }));
      let ids=result.data.filter(item=>!item?.is_read).map(res=>res?.id);
      if(!ids)
      {
        ids=[];
      }
      // ✅ Group by formatted date using moment
      const grouped = await result.data.reduce((acc, item) => {
        const dateStr = moment(item.created_at).format("YYYY-MM-DD"); // e.g. "2025-10-12"
        if (!acc[dateStr]) acc[dateStr] = [];
        acc[dateStr].push(item);
        return acc;
      }, {});
      result.data=grouped ?? null;
      result.meta.markasreadids=ids;
      resp.json(result);
    } catch (e) {
      return resp.status(200).json({
        status: "error",
        message: e.message || "Something went wrong",
        data: data,
      });
    }
  },
  totalUnreadNotification: async function (req, resp) {
    let data = {};
    try {
       let options = { where: { status: 'A', receiver_id: req.auth.id,is_read:0} };
        const total_unread = await helpers.fetchCount(Notification, options);
      data.total_unread=total_unread || 0;
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
  markAllAsRead: async function (req, resp)
  {
      let data = {};
    try {
      let rules = {
        ids: `required|array|minLength:1`,
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

      const{ids}=req.body;

      // ✅ Group by formatted date using moment

      if(ids.length>0)
      {
        await Notification.update(
        { is_read: 1 }, // ✅ field(s) to update
        {
          where: {
            id: {
              [Op.in]: ids, // ✅ WHERE id IN (3,2,1)
            },
          },
        }
      );
      }
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
  }
};
