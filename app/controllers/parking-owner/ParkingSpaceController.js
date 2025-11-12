const helpers = require("../../common/helpers");
const User = require("../../models/User");
const ParkingSpace = require("../../models/ParkingSpace");
const ParkingSlot = require("../../models/ParkingSlot");
const ParkingType = require("../../models/ParkingType");

const State = require("../../models/State");

const ParkingResource = require("../../resources/User/ParkingResource");
const ParkingOwnerResource = require("../../resources/User/ParkingOwnerResource");

const UserResource = require("../../resources/User/UserResource");
const { Op, Sequelize } = require("sequelize");
const db_helpers = require("../../common/db_helpers");
const path = require("path");
const fs = require("fs").promises;

module.exports = {
  addParkingSpace: async function (req, resp) {
    let data = {};
    try {
      let rules = {
        title: `required`,
        parking_type_id: `required|exists:ParkingType,id`,
        state_id: `required|exists:State,id`,
        total_slot: `required|integer|min:1`,
        address: `required`,
        city: `required`,
        zip: `required|integer`,
        min_booking_duration: `required|integer|min:30`,
        per_hour_price: `required|numeric|min:1`,
        per_month_price: `required|numeric|min:1`,
      };
      if (req.body.is_ev_charing == 1) {
        rules.ev_charging_price = `required|numeric|min:1`;
        rules.ev_charing_slot = `required|numeric|min:1`;
      }
      if (req.body?.twenty_four_service == 0) {
        rules.start_time = `required`;
        rules.end_time = `required`;
      }

      const v = await helpers.parkingvalidator(rules, req.body);

      if (!v.status) {
        data.errors = v.errors;
        return resp.status(200).json({
          status: "val_error",
          message: "Validation Error",
          data: data,
        });
      }

      // ✅ Handle image upload
      let photos = req.body.photos ? req.body.photos.split(",") : [];
      const filesInfo = req.uploadedFiles;
      if (filesInfo.length > 0) {
        // Loop and save file paths to DB if needed
        filesInfo.forEach((file) => {
          // Unique filename
          photos.push(`uploads/parking_photo/${file.name}`);
        });
      }
      if (!req.body.id) {
        if (photos.length <= 0) {
          return resp.status(200).json({
            status: "error",
            message: `At least 1 file is required.`,
          });
        }
      }


      const owner_id = req.auth.id;
      let {
        id,
        parking_type_id,
        state_id,
        address,
        city,
        zip,
        lat,
        lang,
        total_slot,
        ev_charing_slot,
        title,
        min_booking_duration,
        ...slotData
      } = req.body;
      if (req.body.is_ev_charing != 1) {
        slotData.ev_charging_price = 0;
      }
      photos=photos.filter(Boolean);
      photos = photos.toString();
      const [parkingspace] = await ParkingSpace.upsert({
        id,
        title,
        photos,
        owner_id,
        parking_type_id,
        state_id,
        address,
        city,
        zip,
        lat,
        lang,
        ev_charing_slot,
        min_booking_duration
      });

      let slug = await helpers.createSlug(title) + '-' + parkingspace?.id;
      ParkingSpace.update({ slug }, {
        where: { id: parkingspace?.id }
      });
      const totalActiveSlot = await helpers.fetchCount(ParkingSlot, {
        where: { status: "A", parking_space_id: parkingspace?.id },
      });
      const totalInActiveSlot = await helpers.fetchCount(ParkingSlot, {
        where: { status: "I", parking_space_id: parkingspace?.id },
      });
      let parking_deatil;
      if (req.body.twenty_four_service == 1) {
        slotData.start_time = "00:00:00";
        slotData.end_time = "23:59:59";
      }
      if (id) {
        parking_deatil = await helpers.findByID(ParkingSpace, id, [
          {
            model: ParkingSlot,
            as: "parkingslots",
          },
        ]);
        parking_deatil = new ParkingResource(parking_deatil).toArray();
      }

      if (slotData.weekday_slot == 1) {
        slotData.available_days = "0,1,2,3,4";
      }
      if (slotData.weekend_slot == 1) {
        slotData.available_days =
          (slotData.available_days ? slotData.available_days + "," : "") +
          "5,6";
      }

      let slot_code_prefix;
      let slot_rows = [];

      if (!id) {
        for (let i = 1; i <= total_slot; i++) {
          if (slotData?.is_ev_charing && ev_charing_slot >= 1) {
            slot_code_prefix = "SA";
            ev_charing_slot = ev_charing_slot - 1;
            slotData.is_ev_charing=1;

          } else {
            slot_code_prefix = "CA";
            slotData.is_ev_charing = 0;
            slotData.ev_charging_price=0;

          }
          slot_rows.push({
            ...slotData,
            ...{
              parking_space_id: parkingspace?.id,
              slot_code: `${slot_code_prefix}${i}`,
            },
          });
        }

        await ParkingSlot.bulkCreate(slot_rows);
      }
      else {
        let slot_index=1;
        for (let slot of parking_deatil?.parkingslots) {
        if (slotData?.is_ev_charing && ev_charing_slot >= 1) {
            slot_code_prefix = "SA";
            ev_charing_slot = ev_charing_slot - 1;
            slotData.is_ev_charing=1;
            slotData.slot_code=`${slot_code_prefix}${slot_index}`;

          } else {
            slot_code_prefix = "CA";
            slotData.is_ev_charing = 0;
            slotData.ev_charging_price=0;
            slotData.slot_code=`${slot_code_prefix}${slot_index}`;

          }
          slot_index++;
          slot_rows.push({ ...slot, ...slotData });
        }
        //console.log(slot_rows);
        //return;
        await ParkingSlot.bulkCreate(slot_rows, {
          updateOnDuplicate: [
            "slot_code",
            "available_days",
            "start_time",
            "end_time",
            "twenty_four_service",
            "is_ev_charing",
            "per_hour_price",
            "per_month_price",
            "ev_charging_price",
            "is_cc_tv"
          ], // fields to update if duplicate found
        });
        if (total_slot != totalActiveSlot) {
          if (total_slot > totalActiveSlot) {
            if (totalInActiveSlot > 0) {
              const lastNRows = await helpers.fetchallData(ParkingSlot, {
                order: [["id", "DESC"]], // or 'createdAt' if you prefer
                limit: totalInActiveSlot,
                attributes: ["id"],
                where:{parking_space_id: parkingspace?.id}
              });
              const ids = lastNRows.data.map((row) => row.id);
              await ParkingSlot.update(
                { status: "A", ...slotData },
                {
                  where: {
                    id: {
                      [Op.in]: ids,
                    },
                  },
                }
              );
            }
            const extraSlot =
              total_slot - (totalActiveSlot + totalInActiveSlot);
            if (extraSlot > 0) {
              const slot_extra_rows = [];
              const currentActiveSlot = +(totalActiveSlot + totalInActiveSlot);

              for (
                let counter = currentActiveSlot;
                counter < total_slot;
                counter++
              ) {
                if (slotData?.is_ev_charing && ev_charing_slot >= 1) {
                slot_code_prefix = "SA";
                ev_charing_slot = ev_charing_slot - 1;
                slotData.is_ev_charing=1;
              } else {
                slot_code_prefix = "CA";
                slotData.is_ev_charing = 0;
                slotData.ev_charging_price=0;
              }
                slot_extra_rows.push({
                  ...slotData,
                  ...{
                    parking_space_id: parkingspace?.id,
                    slot_code: `${slot_code_prefix}${counter + 1}`,
                  },
                });
              }
              await ParkingSlot.bulkCreate(slot_extra_rows);
            }
          }
          else {
            const deletedSlots = totalActiveSlot - total_slot;
            const lastNRows = await helpers.fetchallData(ParkingSlot, {
              order: [["id", "DESC"]], // or 'createdAt' if you prefer
              limit: deletedSlots,
              attributes: ["id"],
            });
            const ids = lastNRows.data.map((row) => row.id);
            await ParkingSlot.update(
              { status: "I" },
              {
                where: {
                  id: {
                    [Op.in]: ids,
                  },
                },
              }
            );
          }
        }
      }
      let parking_space = await db_helpers.viewParking(parkingspace?.id);
      const parking_space_data = new ParkingOwnerResource(
        parking_space
      ).toArray();
      if (req.body.deleted_files) {
        const deleted_files = req.body.deleted_files.split(",").map(f => f.trim());
        if(deleted_files.length>0)
        {
          await deleted_files.forEach(filePath => {
          const fullPath = path.join(filePath); // adjust if needed
          fs.unlink(fullPath)
        });
        }

      }
      return resp.status(200).json({
        status: "success",
        message: "Parking Space has been saved Successfully",
        data: parking_space_data,
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
  viewParkingSpace: async function (req, resp) {
    let data = {};
    try {
      let rules = { id: `required|exists:ParkingSpace,id` };
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
      let parking_space = await db_helpers.viewParking(id);
      const parking_space_data = new ParkingOwnerResource(
        parking_space
      ).toArray();
      return resp.status(200).json({
        status: "success",
        message: "Parking Space has been saved Successfully",
        data: parking_space_data,
      });
    } catch (e) {
      console.log(e);
      return resp.status(200).json({
        status: "error",
        message: e.message || "Something went wrong",
        data: data,
      });
    }
  },
  addSlot: async function (req, resp) {
    let data = {};
    try {
      let rules = {
        id: `required|exists:ParkingSpace,id`,
        total_slot: `required|integer|min:1`,
      };
      let { id: parking_space_id, total_slot, ev_charing_slot, is_ev_charing } = req.body;
      if (is_ev_charing == 1) {
        rules.ev_charing_slot = `required|numeric|min:1`;
      }
      let options = {};
      let ev_charging = null;
      if (parking_space_id) {
        options.where = { is_ev_charing: 1, status: 'A', parking_space_id: parking_space_id };
        options.attributes = ["ev_charging_price"]
        ev_charging = await helpers.fetchsingleData(ParkingSlot, options);
        if (is_ev_charing == 1 && !ev_charging) {
          rules.ev_charging_price = `required|numeric|min:1`;
        }

      }

      const v = await helpers.validator(rules, req.body);

      if (!v.status) {
        data.errors = v.errors;
        return resp.status(200).json({
          status: "val_error",
          message: "Validation Error",
          data: data,
        });
      }
      options = {}
      options.where = { status: 'A', parking_space_id: parking_space_id };
      const last_active_data = await helpers.fetchCount(ParkingSlot, options);

      const slotDetail = await helpers.fetchsingleData(ParkingSlot, options);
      if (ev_charging && is_ev_charing) {
        slotDetail.ev_charging_price = ev_charging?.ev_charging_price;
      }
      else if (!ev_charging && is_ev_charing) {
        slotDetail.ev_charging_price = req.body?.ev_charging_price;
      }

      else if (!ev_charging && !is_ev_charing) {
        slotDetail.ev_charging_price = 0;
      }
      const { id, slot_code, created_at, updated_at, ...slotData } = slotDetail;

      let slot_code_prefix;
      let slot_rows = [];
      let count_ev_slot = 0;
      if (ev_charing_slot > 0) {
        count_ev_slot = ev_charing_slot;
      }
      for (let i = 1; i <= total_slot; i++) {
        if (is_ev_charing && ev_charing_slot >= 1) {
          slot_code_prefix = "SA";
          ev_charing_slot = ev_charing_slot - 1;
          slotData.is_ev_charing = 1;
        } else {
          slot_code_prefix = "CA";
          slotData.is_ev_charing = 0;
        }
        slot_rows.push({
          ...slotData,
          ...{
            parking_space_id: parking_space_id,
            slot_code: `${slot_code_prefix}${last_active_data + i}`,
          },
        });
      }

      await ParkingSlot.bulkCreate(slot_rows);
      if (is_ev_charing) {
        await ParkingSpace.increment(
          { ev_charing_slot: count_ev_slot },              // increment by 1
          { where: { id: id } }
        );
      }
      return resp.status(200).json({
        status: "success",
        message: "Parking Space has been saved Successfully",
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
  addPhoto: async function (req, resp) {
    let data = {};
    try {
      let rules = {
        id: `required|exists:ParkingSpace,id`,
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
      let photos = [];
      const filesInfo = req.uploadedFiles;
      if (filesInfo.length > 0) {
        // Loop and save file paths to DB if needed
        filesInfo.forEach((file) => {
          // Unique filename
          photos.push(`uploads/parking_photo/${file.name}`);
        });
      }
      if (photos.length <= 0) {
        return resp.status(200).json({
          status: "error",
          message: `At least 1 file is required.`,
        });
      }
      let existing_photos=req.body.photos?req.body.photos.split(","):[];

      if(existing_photos.length>0)
      {
        photos=[...existing_photos,...photos]
      }
      await ParkingSpace.update(
        {
          //photos: Sequelize.literal(`CONCAT(photos, ',${photos.toString()}')`)
          photos:photos.toString()
        },
        { where: { id: req.body.id } }
      );
         if (req.body.deleted_files && req.body.deleted_files!='null') {
        const deleted_files = req.body.deleted_files.split(",").map(f => f.trim());
        if(deleted_files.length>0)
        {
          await deleted_files.forEach(filePath => {
          const fullPath = path.join(filePath); // adjust if needed
          fs.unlink(fullPath)
        });
        }

      }

      let parking_space = await db_helpers.viewParking(req.body.id);
      data = new ParkingOwnerResource(
        parking_space
      ).toArray();
      return resp.status(200).json({
        status: "success",
        message: "Site Photo has been uploaded Successfully",
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
  slotLists: async function (req, resp) {
    let data = {};
    try {
      let rules = {
        id: `required|exists:ParkingSpace,id`,
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
      options = {}
      const { id } = req.body;
      let parking_space = await db_helpers.viewParking(id);
      let { ev_charing_slot, parkingslots } = parking_space;
      let without_ev_slots = parkingslots.filter(resp => !resp.is_ev_charing);
      let evcharging_slots = parkingslots.filter(resp => resp.is_ev_charing == 1)
      parkingslots = await parkingslots.map(item => ({ slot_code: item.slot_code, status: item.status, }));
      evcharging_slots = await evcharging_slots.map(item => ({ slot_code: item.slot_code, status: item.status, }));
      without_ev_slots = await without_ev_slots.map(item => ({ slot_code: item.slot_code, status: item.status, }))
      return resp.status(200).json({
        status: "success",
        message: "Parking Space has been saved Successfully",
        data: { parkingslots, ev_charing_slot, evcharging_slots, without_ev_slots },
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
    slotMaster: async function (req, resp) {
    let data = {};
    try {

      options = {
        attributes:["id","slot_code"],
        include:[
        {
           model: ParkingSpace, as: "parking_space", attributes: ["id","title"],where:{owner_id:req.auth.id,status:'A'}
        }
      ]}
      const result=await helpers.fetchallData(ParkingSlot,options);
      return resp.status(200).json({
        status: "success",
        message: "",
        data: result.data,
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
