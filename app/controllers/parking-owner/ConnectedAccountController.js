const helpers = require("../../common/helpers");
const User = require("../../models/User");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // API Secret Key (safe on server)

const { Op, Sequelize } = require("sequelize");
module.exports = {
  createAccount: async function (req, resp) {
    let data = {};
    try {
          const account = await stripe.accounts.create({
            type: 'custom',
            country: 'US', // Or the relevant country
            email: 'user@example.com',
            business_type: 'individual', // Or 'company'
            // ... other required information
        });
      return resp.status(200).json({
        status: "success",
        message: "",
        data:account,
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

};
