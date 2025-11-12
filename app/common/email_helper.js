const nodemailer = require("nodemailer");
var handlebars = require("handlebars");
var fs = require("fs");
var moment = require("moment");
const helpers = require("./helpers");
const User = require("../../app/models/User");
module.exports = {
  sendMail: async function (req, maildata) {
    try {
      var result = {};
      let send_mail_document = {
        from:`"${process.env.APP_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
	      to: maildata.to,
        subject: maildata.subject,
      };
      switch (maildata.type) {
        case "verify-email":
          await _read_html_file(
            process.env.EMAIL_TEMPLATE_PATH + "/verify-otp.html"
          )
            .then(function (html) {
              var template = handlebars.compile(html);
              var replacements = {
                OTP: maildata.data?.otp,
                app_logo: maildata?.data?.logo,
                app_name: maildata?.data?.app_name,
                support_email: maildata?.data?.support_email,
                year:maildata?.data?.year
              };
              send_mail_document.html = template(replacements);
            })
            .catch(function (error) {
              throw error;
            });
          break;
           case "forget-password":
          await _read_html_file(
            process.env.EMAIL_TEMPLATE_PATH + "/forget-password.html"
          )
            .then(function (html) {
              var template = handlebars.compile(html);
              var replacements = {
                OTP: maildata.data?.otp,
                app_logo: maildata?.data?.logo,
                app_name: maildata?.data?.app_name,
                support_email: maildata?.data?.support_email,
                year:maildata?.data?.year
              };
              send_mail_document.html = template(replacements);
            })
            .catch(function (error) {
              throw error;
            });
          break;
          case "customer-booking-confirm":
          await _read_html_file(
            process.env.EMAIL_TEMPLATE_PATH + "/booking-confirm-user.html"
          )
            .then(function (html) {
              var template = handlebars.compile(html);
              var replacements = {
                is_monthly: maildata?.data?.is_monthly,
                company_logo_url: maildata?.data?.logo,
                company_name:maildata?.data?.company_name,
                company_address:maildata?.data?.company_address,
                booking_code: maildata?.data?.booking_code,
                parking_location: maildata?.data?.parking_location,
                parking_slot:maildata?.data?.parking_slot,
                start_at: maildata?.data?.start_at,
                end_at: maildata?.data?.end_at,
                is_ev_charing: maildata?.data?.is_ev_charing,
                total_duration_hours: maildata?.data?.total_duration_hours,
                ev_hours: maildata?.data?.ev_hours,
                currency: maildata?.data?.currency,
                service_fee: maildata?.data?.service_fee,
                ev_amount: maildata?.data?.ev_amount,
                order_total: maildata?.data?.order_total,
                subtotal:maildata?.data?.subtotal,
                manage_booking_url: maildata?.data?.manage_booking_url,
                vehicle_number:maildata?.data?.vehicle_number,
                car_type:maildata?.data?.car_type,
                total_duration_days:maildata?.data?.total_duration_days,
                ev_chargin_per_hour:maildata?.data?.ev_chargin_per_hour,


              };
              send_mail_document.html = template(replacements);

            })
            .catch(function (error) {
              throw error;
            });
          break;
          case "owner-booking-confirm":
          await _read_html_file(
            process.env.EMAIL_TEMPLATE_PATH + "/booking-confirm-owner.html"
          )
            .then(function (html) {
              var template = handlebars.compile(html);
              var replacements = {
                company_logo_url: maildata?.data?.logo,
                company_name:maildata?.data?.company_name,
                company_address:maildata?.data.company_address,
                booking_code: maildata?.data?.booking_code,
                parking_location: maildata?.data?.parking_location,
                start_at: maildata?.data?.start_at,
                end_at: maildata?.data?.end_at,
                manage_booking_url: maildata?.data?.manage_booking_url,
                user_name:maildata?.data?.user_name,
                car_type:maildata?.data?.car_type,
                vehicle_number:maildata?.data?.vehicle_number,
                car_type:maildata?.data?.car_type,
                parking_slot:maildata?.data?.parking_slot

              };

              send_mail_document.html = template(replacements);
            })
            .catch(function (error) {
              throw error;
            });
          break;
            case "customer-query":
          await _read_html_file(
            process.env.EMAIL_TEMPLATE_PATH + "/customer-request.html"
          )
            .then(function (html) {
              var template = handlebars.compile(html);
              var replacements = {
                app_logo: maildata?.data?.logo,
                app_name: maildata?.data?.app_name,
                support_email: maildata?.data?.support_email,
                year:maildata?.data?.year,
                name:maildata?.data?.name,email:maildata?.data?.email,
                phone_no:maildata?.data?.phone_no,message:maildata?.data?.message
              };
              send_mail_document.html = template(replacements);
            })
            .catch(function (error) {
              throw error;
            });
      }
      let info = await global.CONFIG.transporter.sendMail(send_mail_document);
      // console.log("info", info);
      //return true;
    } catch (e) {
      console.log(e.message);
      //return false;
    }
  },
};

async function _read_html_file(path, callback) {
  return new Promise(function (resolve, reject) {
    fs.readFile(path, { encoding: "utf-8" }, function (err, html) {
      if (err) {
        reject(err);
      } else {
        resolve(html);
      }
    });
  });
}
