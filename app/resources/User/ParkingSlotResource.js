const Resource = require("resources.js");

class ParkingSlotResource extends Resource {
  toArray() {
    let weekday;
    let weekend;
    if(this.twenty_four_service)
    {
      weekday=1;
      weekend=1;

    }
    else{
     if(this.available_days.split(",").length==5)
     {
      weekday=1;
      weekend=0;
     }
     else{
       weekday=0;
       weekend=1;
     }
    }

    return {
      id: this.id || null,                    // ✅ MySQL uses `id` instead of `_id`
      parking_space_id : this.parking_space_id  || null,
      slot_code: this.slot_code || null,
      available_days: this.available_days || null,
      start_time: this.start_time || null,
      end_time: this.end_time || null,
      status : this.status  || null,
      twenty_four_service: this.twenty_four_service || 0,
      is_ev_charing: this.is_ev_charing || 0,
      is_cc_tv: this.is_cc_tv || 0,
      weekday:weekday,
      weekend:weekend,
      per_hour_price: this.per_hour_price || null,
      per_month_price: this.per_month_price || null,
      ev_charging_price: this.ev_charging_price || null,
    };
  }
   static collection(dataArray) {
    return dataArray.map(item => new this(item).toArray());
  }
}

module.exports = ParkingSlotResource;
