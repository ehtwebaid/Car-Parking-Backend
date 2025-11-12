const helpers = require("../../common/helpers");
const db_helpers = require("../../common/db_helpers");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // API Secret Key (safe on server)
const ParkingSpace = require("../../models/ParkingSpace");
const ParkingSlot = require("../../models/ParkingSlot");
const CarType = require("../../models/CarType");

const Booking = require("../../models/Booking");
const Billing = require("../../models/Billing");
const User = require("../../models/User");
const Notification = require("../../models/Notification");

const CompanySetting = require("../../models/CompanySetting");

const emailHelper = require("../../common/email_helper");

const ParkingResource = require("../../resources/User/ParkingResource");
const moment = require("moment");

const { Op, fn, col, where } = require("sequelize");
module.exports = {

  availableBookingHours: async function (req, resp) {
    let data = {};
    try {
      let rules = {
        id: `required|exists:ParkingSlot,id`,
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
      let { id, start_date, end_date } = req.body;

      start_date = moment(start_date, "YYYY-MM-DD");
      end_date = moment(end_date, "YYYY-MM-DD");
      const slotDetail = await helpers.findByID(ParkingSlot, id, [{
        model: ParkingSpace,
        as: 'parking_space',   // 👈 alias from User.hasMany()
        attributes: ["id", "min_booking_duration"]

      }]);
      // Difference in days
      const diffDays = end_date.diff(start_date, "days");

      const start_time = slotDetail.start_time;
      const end_time = slotDetail.end_time == '23:59:59' ? '24:00:00' : slotDetail.end_time;
      const booking_hours = await helpers.generateTimeSlots(start_time, end_time, slotDetail.parking_space.min_booking_duration);
      let available_hours = [];
      let available_dates = [];
      let start_available_hours = [];
      let end_available_hours = [];
      if (diffDays == 0) {
        for await (let booking_hour of booking_hours) {

          const dateStr = await helpers.concatDateTimeStr(moment(start_date).format('YYYY-MM-DD'), booking_hour);
          const options = {};
          options.where = {
            parking_slot_id: slotDetail.id, status: 'A', booking_start: {
              [Op.lte]: await helpers.toUTC(dateStr, req.userTimezone)

            }, booking_end: {
              [Op.gt]: await helpers.toUTC(dateStr, req.userTimezone)
            }
          };
          const result = await helpers.fetchCount(Booking, options);
          if (!result) {
            start_available_hours.push(booking_hour);

          }

        }
      }
      else if (diffDays == 1) {
        const options = {};
        let startdateStr = await helpers.concatDateTimeStr(moment(start_date).format('YYYY-MM-DD'), booking_hours[0]);
        let enddateStr = await helpers.concatDateTimeStr(moment(start_date).format('YYYY-MM-DD'), booking_hours[booking_hours.length - 1]);
        options.where = {
          parking_slot_id: slotDetail.id, status: 'A', [Op.and]: [
            // booking start should be before or on the last moment of the end_date
            { booking_start: { [Op.lte]: await helpers.toUTC(startdateStr, req.userTimezone) } },

            // booking end should be after or on the first moment of the start_date
            { booking_end: { [Op.gte]: await helpers.toUTC(enddateStr, req.userTimezone) } }
          ]
        };
        const is_start_full_day_booked = await helpers.fetchCount(Booking, options);
        startdateStr = await helpers.concatDateTimeStr(moment(end_date).format('YYYY-MM-DD'), booking_hours[0]);
        enddateStr = await helpers.concatDateTimeStr(moment(end_date).format('YYYY-MM-DD'), booking_hours[booking_hours.length - 1]);

        options.where = {
          parking_slot_id: slotDetail.id, status: 'A', [Op.and]: [
            // booking start should be before or on the last moment of the end_date
            { booking_start: { [Op.lte]: await helpers.toUTC(startdateStr, req.userTimezone) } },

            // booking end should be after or on the first moment of the start_date
            { booking_end: { [Op.gte]: await helpers.toUTC(enddateStr, req.userTimezone) } }
          ]
        };


        const is_end_full_day_booked = await helpers.fetchCount(Booking, options);
        if (!is_start_full_day_booked && !is_end_full_day_booked) {
          for await (let booking_hour of booking_hours) {

            const dateStr = await helpers.concatDateTimeStr(moment(start_date).format('YYYY-MM-DD'), booking_hour);
            const options = {};
            options.where = {
              parking_slot_id: slotDetail.id, status: 'A', booking_start: {
                [Op.lte]: await helpers.toUTC(dateStr, req.userTimezone)
              }, booking_end: {
                [Op.gte]: await helpers.toUTC(dateStr, req.userTimezone)
              }
            };
            const result = await helpers.fetchCount(Booking, options);


            available_hours.push({ time_slot: booking_hour, available: !result });

          }
          let firstUnavailableIndex = available_hours.findLastIndex(slot => slot.available == false);
          if (firstUnavailableIndex !== -1) {
            for (let i = firstUnavailableIndex; i < (booking_hours.length); i++) {
              start_available_hours.push(booking_hours[i]);
            }
          }
          else {
            start_available_hours = booking_hours;
          }
          available_hours = [];
          for await (let booking_hour of booking_hours) {
            const dateStr = await helpers.concatDateTimeStr(moment(end_date).format('YYYY-MM-DD'), booking_hour);
            const options = {};
            options.where = {
              parking_slot_id: slotDetail.id, status: 'A', booking_start: {
                [Op.lte]: await helpers.toUTC(dateStr, req.userTimezone)

              }, booking_end: {
                [Op.gte]: await helpers.toUTC(dateStr, req.userTimezone)
              }
            };
            const result = await helpers.fetchCount(Booking, options);

            available_hours.push({ time_slot: booking_hour, available: !result });


          }
          firstUnavailableIndex = available_hours.findIndex(slot => slot.available == 0);
          //console.log(end_available_hours);
          if (firstUnavailableIndex !== -1) {
            for (let i = 0; i <= firstUnavailableIndex; i++) {
              end_available_hours.push(booking_hours[i]);
            }
          }
          else {
            end_available_hours = booking_hours;

          }
        }

      }
      else if (diffDays >= 2) {
        const between_dates = await helpers.getDatesBetween(start_date, end_date);
        for (let dateStr of between_dates) {
          const booking_start = (await helpers.toUTCStart(dateStr, req.userTimezone));
          const booking_end = (await helpers.toUTCEnd(dateStr, req.userTimezone));
          const options = {};
          options.where = {
            parking_slot_id: slotDetail.id, status: 'A',
            booking_start: { [Op.lte]: booking_start },
            booking_end: { [Op.gte]: booking_end },
          };
          //console.log(options);
          const result = await helpers.fetchCount(Booking, options);
          available_dates.push({ date_slot: dateStr, available: !result });
        }
        const is_middle_days_available = available_dates.every(item => item.available == 1);


        options = {};
        let startdateStr = await helpers.concatDateTimeStr(moment(start_date).format('YYYY-MM-DD'), booking_hours[0]);
        let enddateStr = await helpers.concatDateTimeStr(moment(start_date).format('YYYY-MM-DD'), booking_hours[booking_hours.length - 1]);

        options.where = {
          parking_slot_id: slotDetail.id, status: 'A', [Op.and]: [
            // booking start should be before or on the last moment of the end_date
            { booking_start: { [Op.lte]: await helpers.toUTC(startdateStr, req.userTimezone) } },

            // booking end should be after or on the first moment of the start_date
            { booking_end: { [Op.gte]: await helpers.toUTC(enddateStr, req.userTimezone) } }
          ]
        };
        const is_start_full_day_booked = await helpers.fetchCount(Booking, options);

        startdateStr = await helpers.concatDateTimeStr(moment(end_date).format('YYYY-MM-DD'), booking_hours[0]);
        enddateStr = await helpers.concatDateTimeStr(moment(end_date).format('YYYY-MM-DD'), booking_hours[booking_hours.length - 1]);

        options.where = {
          parking_slot_id: slotDetail.id, status: 'A', [Op.and]: [
            // booking start should be before or on the last moment of the end_date
            { booking_start: { [Op.lte]: await helpers.toUTC(startdateStr, req.userTimezone) } },

            // booking end should be after or on the first moment of the start_date
            { booking_end: { [Op.gte]: await helpers.toUTC(enddateStr, req.userTimezone) } }
          ]
        };


        const is_end_full_day_booked = await helpers.fetchCount(Booking, options);




        if (is_middle_days_available && !is_start_full_day_booked && !is_end_full_day_booked) {
          for await (let booking_hour of booking_hours) {

            const dateStr = await helpers.concatDateTimeStr(moment(start_date).format('YYYY-MM-DD'), booking_hour);
            const options = {};
            options.where = {
              parking_slot_id: slotDetail.id, status: 'A', booking_start: {
                [Op.lte]: await helpers.toUTC(dateStr, req.userTimezone)

              }, booking_end: {
                [Op.gte]: await helpers.toUTC(dateStr, req.userTimezone)
              }
            };
            const result = await helpers.fetchCount(Booking, options);

            available_hours.push({ time_slot: booking_hour, available: !result });

          }

          let firstUnavailableIndex = available_hours.findLastIndex(slot => slot.available == 0);

          if (firstUnavailableIndex !== -1) {
            for (let i = firstUnavailableIndex; i < (booking_hours.length); i++) {
              start_available_hours.push(booking_hours[i]);
            }
          }
          else {
            start_available_hours = booking_hours;
          }
          available_hours = [];
          for await (let booking_hour of booking_hours) {
            const dateStr = await helpers.concatDateTimeStr(moment(end_date).format('YYYY-MM-DD'), booking_hour);
            const options = {};
            options.where = {
              parking_slot_id: slotDetail.id, status: 'A', booking_start: {
                [Op.lte]: await helpers.toUTC(dateStr, req.userTimezone)

              }, booking_end: {
                [Op.gt]: await helpers.toUTC(dateStr, req.userTimezone)
              }
            };
            const result = await helpers.fetchCount(Booking, options);

            available_hours.push({ time_slot: booking_hour, available: !result });


          }
          firstUnavailableIndex = available_hours.findIndex(slot => slot.available == 0);
          //console.log(end_available_hours);
          if (firstUnavailableIndex !== -1) {
            for (let i = 0; i <= firstUnavailableIndex; i++) {
              end_available_hours.push(booking_hours[i]);
            }
          }
          else {
            end_available_hours = booking_hours;

          }
        }
      }

      return resp.status(200).json({
        status: "success",
        message: "",
        data: { start_available_hours, end_available_hours, diffDays },
      });
    } catch (e) {
      return resp.status(200).json({
        status: "error",
        message: e.message || "Something went wrong",
        data: data,
      });
    }
  },
  availableMonthlyBooking: async function (req, resp) {
    let data = {};
    try {
      let rules = {
        id: `required|exists:ParkingSlot,id`,
        start_date: `required|date`,
        end_date: `required|date`,
        weekday: `required|integer|between:0,1`,
        weekend: `required|integer|between:0,1`,

      };

      const v = await helpers.customvalidator(rules, req.body);
      if (!v.status) {
        data.errors = v.errors;
        return resp.status(200).json({
          status: "val_error",
          message: "Validation Error",
          data: data,
        });
      }
      let disable_dates = [];
      let active_dates = [];
      let { id, start_date, end_date, weekday, weekend } = req.body;
      const alldays = await helpers.getDatesBetween(start_date, end_date);
      const weekDays = await helpers.getsWeekDays(start_date, end_date);
      const weekEnds = await helpers.getsWeekends(start_date, end_date);
      if (!weekday) {
        disable_dates = weekDays;
        active_dates = alldays.filter(item => !weekDays.includes(item));
      }
      if (!weekend) {
        disable_dates = weekEnds;
        active_dates = alldays.filter(item => !weekEnds.includes(item));
      }
      if (active_dates.length <= 0) {
        active_dates = alldays;
      }
      const options = {};
      for (const current_date of active_dates) {
        const month_end=moment(current_date).add(30, 'days');
        const startOfDay = await helpers.toUTCStart(current_date, req.userTimezone);
        const endOfDay = await helpers.toUTCEnd(month_end, req.userTimezone);
        options.where =
        {
          parking_slot_id: id,
          status: 'A',
          [Op.and]: [
            { booking_start: { [Op.lt]: endOfDay } },
            { booking_end: { [Op.gt]: startOfDay } },
          ],
        }
        const overlap = await helpers.fetchCount(Booking, options);
        if (overlap) {
          disable_dates.push(current_date);
        }

      }
      return resp.status(200).json({
        status: "success",
        message: "",
        data: disable_dates

      });
    } catch (e) {
      return resp.status(200).json({
        status: "error",
        message: e.message || "Something went wrong",
        data: data,
      });
    }
  },
  createBooking: async function (req, resp) {
    let data = {};
    try {
      let rules = {
        id: `required|exists:ParkingSlot,id`,
        start_date: `required|datetime`,
        end_date: `required|datetime|afterDate:start_date`,
        vehicle_number: `required|required`,
        booking_type: `required|in:hourly,monthly`,
        car_type: `required|exists:CarType,id`,
        token: `required`,

      };
      let messages = {

        "end_date.afterDate": "End date must be greater than start date.",

      };
      let { id, start_date, end_date, is_ev_charing, ev_charing_duration, token, vehicle_number, car_type,booking_type,access_hours } = req.body;
      if(booking_type=='monthly')
      {
        rules.access_hours='required';
      }
      if (is_ev_charing) {
        rules.ev_charing_duration = 'required|integer';
      }

      const v = await helpers.validator(rules, req.body, messages);

      if (!v.status) {
        data.errors = v.errors;
        return resp.status(200).json({
          status: "val_error",
          message: "Validation Error",
          data: data,
        });
      }

      start_date = moment(start_date, "YYYY-MM-DD");
      end_date = moment(end_date, "YYYY-MM-DD");
      const slotDetail = await helpers.findByID(ParkingSlot, id, [
        {
          model: ParkingSpace,
          as: 'parking_space',   // 👈 alias from User.hasMany()
          attributes: ["id", "min_booking_duration", "address"],
          include: [
            {
              model: User,
              as: 'owner',   // alias from ParkingSpace.belongsTo()
              attributes: ["id", "name", "email"]   // pick owner fields you need
            }
          ]

        },


      ]);
      // Difference in days
      const diffDays = end_date.diff(start_date, "days");

      const start = moment(req.body.start_date, "YYYY-MM-DD HH:mm:ss");
      const end = moment(req.body.end_date, "YYYY-MM-DD HH:mm:ss");
      const bookingDurations = end.diff(start, 'hours'); // whole hours

      const options = {};
      options.where = {
        parking_slot_id: slotDetail.id,
        status: 'A',
        booking_start: { [Op.lt]: await helpers.toUTC(end, req.userTimezone) },
        booking_end: { [Op.gt]: await helpers.toUTC(start, req.userTimezone) }
      };

      const result = await helpers.fetchCount(Booking, options);

      if (result) {
        return resp.status(200).json({
          status: "error",
          message: "!!Sorry Slot is already booked",

        });
      }

      net_parking_fees = bookingDurations * slotDetail.per_hour_price
      if(booking_type=='monthly')
      {
        net_parking_fees=slotDetail.per_month_price;
      }
      const net_ev_chagin_fees = ev_charing_duration * slotDetail.ev_charging_price;
      const net_fees = net_ev_chagin_fees + net_parking_fees;
      const charge = await stripe.charges.create({
        amount: net_fees * 100,
        currency: 'usd',
        source: token,
      });
      if (charge.id) {
        const user = await helpers.findByID(User, req.auth.id);
        codeToUse = await helpers.generate6DigitCode();
        const bookingData = {
          customer_id: req.auth.id, parking_slot_id: slotDetail.id, booking_start: await helpers.toUTC(start, req.userTimezone),
          booking_end: await helpers.toUTC(end, req.userTimezone),
          stripe_trans_id: charge.id, code: 'BK' + codeToUse,booking_type:booking_type
        };
        const booking = await Booking.create(bookingData);
        const billingData = {
          booking_id: booking.id, per_hour_fees: slotDetail.per_hour_price, duration: bookingDurations, ev_charing_fees: slotDetail.ev_charging_price,
          ev_charing_duration: ev_charing_duration ? ev_charing_duration : 0, net_ev_chagin_fees: net_ev_chagin_fees, net_parking_fees: net_parking_fees,
          net_fees: net_fees,vehicle_number, car_type,access_hours,monthly_price:slotDetail.per_month_price
        };
        const car_type_detail = await helpers.findByID(CarType, car_type);
        await Billing.create(billingData);
        const company_setting = await helpers.findByID(CompanySetting, 1);
        const service_fee = 0;
        let send_email = await emailHelper.sendMail(req, {
          to: user?.email,
          subject: `Parking Booking Confirmed – ${slotDetail.address}`,
          type: "customer-booking-confirm",
          data: {
            is_monthly: false,
            logo: process.env.LOGO,
            company_name: company_setting.company_name,
            company_address: company_setting.address,
            booking_code: booking.code,
            parking_location: slotDetail.parking_space.address,
            start_at: booking_type=='hourly'?moment(start).format('MM-DD-YYYY hh:mm A'):moment(start).format('dddd D MMMM YYYY'),
            end_at: booking_type=='hourly'?moment(end).format('MM-DD-YYYY hh:mm A'):moment(end).format('dddd D MMMM YYYY'),
            next_payment_date: moment(end).format('MM/DD/YYYY'),
            first_payment:'Today',
            billing_frequency:'Monthly',
            access_hours:access_hours+' a day',
            is_ev_charing: is_ev_charing,
            ev_chargin_per_hour:slotDetail.ev_charging_price,
            total_duration_hours: bookingDurations,
            ev_hours: ev_charing_duration,
            currency: '$',
            service_fee: service_fee.toLocaleString(),
            ev_amount: net_ev_chagin_fees.toLocaleString(),
            subtotal: net_parking_fees.toLocaleString(),
            order_total: net_fees.toLocaleString(),
            car_type: car_type_detail?.name,
            vehicle_number: vehicle_number,
            total_duration_days:'30',
            manage_booking_url: process.env.FRONTEND_URL + 'find-parking',
            parking_slot: slotDetail?.slot_code,
            booking_type:booking_type

          }
        });

        send_email = await emailHelper.sendMail(req, {
          to: slotDetail?.parking_space?.owner?.email,
          subject: `New Parking Slot Booking Received - ${codeToUse}`,
          type: "owner-booking-confirm",
          data: {
            logo: process.env.LOGO,
            company_name: company_setting.company_name,
            company_address: company_setting.address,
            booking_code: booking.code,
            parking_location: slotDetail.parking_space.address,
            start_at: booking_type=='hourly'?moment(start).format('MM-DD-YYYY hh:mm A'):moment(start).format('dddd D MMMM YYYY'),
            end_at: booking_type=='hourly'?moment(end).format('MM-DD-YYYY hh:mm A'):moment(end).format('dddd D MMMM YYYY'),
            vehicle_number: vehicle_number,
            car_type: car_type_detail?.name,
            user_name: user.name,
            manage_booking_url: process.env.FRONTEND_URL + 'find-parking',
            parking_slot: slotDetail?.slot_code

          }
        });
        const notification_data = { sender_id: req.auth.id, receiver_id: slotDetail?.parking_space?.owner?.id };
        notification_data.message = `Has requested a parking slot for ${moment(start).format('DD MMMM YYYY hh A')} - ${moment(end).format('DD MMMM YYYY hh A')}`;
        await Notification.create(notification_data);
      }
      return resp.status(200).json({
        status: "success",
        message: "Your booking has been created successfully",
        data: { diffDays, net_parking_fees },
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
