const Resource = require("resources.js");
const ParkingSlot = require("../../models/ParkingSlot");
const ParkingSlotResource = require("../../resources/User/ParkingSlotResource");

class ParkingOwnerResource extends Resource {
  toArray() {
    const activeSlots=this.parkingslots.filter(resp=>resp.status=='A');
    const{id,created_at,updated_at,slot_code,available_days,...restSlotData}=activeSlots[0];
    if(this.ev_charing_slot>0)
    {
      restSlotData.is_ev_charing="1";
    }
    restSlotData.is_cc_tv=restSlotData.is_cc_tv.toString();
    restSlotData.start_time=toHM(restSlotData.start_time);
    restSlotData.end_time=toHM(restSlotData.end_time);

    return {
      id: this.id || null,                    // ✅ MySQL uses `id` instead of `_id`
      title: this.title || null,
      owner_id: this.owner_id || null,
      parking_type_id:this.parking_type_id || null,
      state_id: this.state_id || null,
      photos: this.photos?this.photos:[],
      image_previews: this.photos?this.photos.split(',').map(resp=>process.env.SITE_URL+resp) :[],
      status: this.status || null,
      address: this.address || null,
      ev_charing_slot:this.ev_charing_slot || 0,
      total_slot:activeSlots.length || 0,
      weekday_slot:available_days.split(",").length>=5?1:0,
      weekend_slot:(available_days.split(",").length==2 || available_days.split(",").length==7)?1:0,
      min_booking_duration: this.min_booking_duration || null,
      city: this.city || null,
      zip: this.zip || null,
      lat: this.lat || null,
      lang: this.lang || null,
      ...restSlotData
    };
  }
}
function toHM(timeStr) {
  const [hour, minute] = timeStr.split(':').map(Number);
  return { hour, minute };
}

module.exports = ParkingOwnerResource;
