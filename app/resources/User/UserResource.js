const Resource = require("resources.js");

class UserResource extends Resource {
  toArray() {
    return {
      id: this.id || null,                    // ✅ MySQL uses `id` instead of `_id`
      name: this.name || null,
      email: this.email || null,
      phone_no: this.phone_no || null,
      role: this.role || null,
      status: this.status || null,
      address: this.address || null,
      profile_photo: this.profile_photo?process.env.SITE_URL+this.profile_photo : process.env.SITE_URL+'uploads/no-user.png',
      social_id: this.social_id || null,
      parking_space:(this.parking_spaces && this.parking_spaces.length>0)?this.parking_spaces[0].id:null,
      stripe_account_id: this.stripe_account_id || null,
      email_verified_at: this.email_verified_at || null,

    };
  }
}

module.exports = UserResource;
