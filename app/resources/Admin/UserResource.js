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
      email_verified_at: this.email_verified_at || null,
      created_at: this.created_at || null,


    };
  }
   static collection(dataArray) {
    return dataArray.map(item => new this(item).toArray());
  }
}

module.exports = UserResource;
