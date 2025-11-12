const helpers = require("../../common/helpers");
const emailHelper = require("../../common/email_helper");

const CustomerQuery = require("../../models/CustomerQuery");
const CompanySetting = require("../../models/CompanySetting");
const moment = require("moment");


module.exports = {
  submitCustomerQuery: async function (req, resp) {
    let data = {};
    try {

      let rules = {
        name: `required`,
        email: `required|email`,
        phone_no: `required|numeric|minLength:10|maxLength:10`,
        message: `required`,

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

      const query=await CustomerQuery.create(req.body);
      const company_setting = await helpers.findByID(CompanySetting, 1);
      const {name,email,phone_no,message}=req.body;
      send_email = await emailHelper.sendMail(req, {
                to: company_setting?.email,
                subject: `New customer query from ${name}`,
                type: "customer-query",
                data: {
                  logo: process.env.LOGO,
                  company_name: company_setting.company_name,
                  company_address: company_setting.address,
                  year: moment().format('YYYY'),
                  support_email:company_setting?.company_setting,
                  name,email,phone_no,message

                }
              });
            return resp.status(200).json({
              status: "success",
              message: "Your Request has been sent successfully",
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


};
