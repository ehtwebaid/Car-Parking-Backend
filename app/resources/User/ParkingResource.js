const Resource = require("resources.js");
const ParkingSlot = require("../../models/ParkingSlot");
const ParkingSlotResource = require("../../resources/User/ParkingSlotResource");

class ParkingResource extends Resource {
  toArray() {
    const activeSlots=this.parkingslots.filter(resp=>resp.status=='A');
    const{id,created_at,updated_at,slot_code,available_days,...restSlotData}=activeSlots[0];
    return {
      id: this.id || null,                    // ✅ MySQL uses `id` instead of `_id`
      owner_id: this.owner_id || null,
      parking_type_id: this.parking_type_id || null,
      state_id: this.state_id || null,
      title: this.title || null,
      photos: this.photos?this.photos.split(',').map(resp=>process.env.SITE_URL+resp) :[],
      status: this.status || null,
      address: this.address || null,
      ev_charing_slot:this.ev_charing_slot || 0,
      parkingslots:activeSlots?ParkingSlotResource.collection(activeSlots): null,
      city: this.city || null,
      zip: this.zip || null,
      lat: this.lat || null,
      lang: this.lang || null,
      min_booking_duration: this.min_booking_duration || null,


    };
  }
}

module.exports = ParkingResource;
