
module.exports = {
  getTimeZone: function (req, resp, next) {
    let data = {};
    try {
       const userTimezone = req.headers['x-timezone'] || 'UTC'; // default UTC
      req.userTimezone = userTimezone;
      next();
    } catch (e) {
      return resp.status(200).send({
        status: "error",
        message: e ? e.message : "Something went wrong",
        data: data,
      });
    }
  },

};
