const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = {
  checkAuth: function (req, resp, next) {
    let data = {};
    try {
      const token = req.headers["x-access-token"];

      if (!token) {
        return resp.status(401).send({
          status: "unauthenticated",
          message: "Authorization token not provided",
          data: data,
        });
      }

      jwt.verify(
        token.trim(),
        process.env.JWT_SECRET,
        async function (err, decoded) {
          if (err) {
            return resp.status(401).send({
              status: "unauthenticated",
              message:
                "Unauthentication Action : " +
                (err ? err.message : "UNTRACABLE"),
              data: data,
            });
          }

          req.auth = {};

          req.auth.id = decoded.id;
          req.auth.data = decoded;
          await User.findOne({ where: { id: req.auth.id } }).then(function (
            user
          ) {
            req.auth.data = user;
          });

          // console.log(req.auth.data.status);
          switch (req.auth.data.status) {
            case "A":
              next();
              break;
            case "I":
              return resp.status(403).send({
                status: "inactive",
                message:
                  "Your account has been blocked! Please contact with admin",
                data: data,
              });
              break;
            case "D":
              return resp.status(403).send({
                status: "deleted",
                message:
                  "Your account has been Deleted!! Please contact with admin",
                data: data,
              });
              break;

            default:
              break;
          }
          if (!req.auth.data) {
            return resp.status(401).send({
              status: "unauthenticated",
              message: "Session Expired!! Please signin again to continue",
              data: data,
            });
          }
        }
      );
    } catch (e) {
      return resp.status(200).send({
        status: "error",
        message: e ? e.message : "Something went wrong",
        data: data,
      });
    }
  },
  checkToken: function (req, resp, next) {
    let data = {};
    try {
      const token = req.headers["x-access-token"];
      req.auth = {};

      if (token != undefined) {
        jwt.verify(token, process.env.JWT_TOKEN, async function (err, decoded) {
          if (!err) {
            req.auth.id = decoded.id;
            req.auth.data = decoded;

            await User.findOne({ _id: req.auth.id }, "")
              .exec()
              .then(function (user) {
                if (!user) {
                  req.auth.data = user;
                }
              });
          }

          if (!req.auth.data) {
            req.auth.id = null;
          }

          next();
        });
      } else {
        req.auth.id = null;
        req.auth.data = {};
        next();
      }
    } catch (e) {
      return resp.status(200).send({
        status: "error",
        message: e ? e.message : "Something went wrong",
        data: data,
      });
    }
  },

  checkRole(accepted_role) {
    return function (req, resp, next) {
      let data = {};
      try {
        const token = req.headers["x-access-token"];
        if (!token) {
          return resp.status(401).send({
            status: "unauthenticated",
            message: "Authorization token not provided",
            data: data,
          });
        }
        jwt.verify(
          token,
          process.env.JWT_SECRET,
          async function (err, decoded) {
            if (err) {
              return resp.status(401).send({
                status: "unauthenticated",
                message:
                  "Unauthentication Action : " +
                  (err ? err.message : "UNTRACABLE"),
                data: data,
              });
            }

            let user = null;
            await User.findOne({ where: { id: req.auth.id } }, "").then(
              function (details) {
                return (user = details);
              }
            );
            if (!user) {
              return resp.status(401).send({
                status: "unauthenticated",
                message: "Session Expired!! Please signin again to continue",
                data: data,
              });
            }
            if (
              Array.isArray(accepted_role) &&
              accepted_role.includes(user.role)
            ) {
              next();
            } else if (accepted_role == user.role) {
              next();
            } else {
              return resp.status(401).send({
                status: "error",
                message: "Oops!! Permission denied",
                data: data,
              });
            }
          }
        );
      } catch (e) {
        return resp.status(200).send({
          status: "error",
          message: e ? e.message : "Something went wrong",
          data: data,
        });
      }
    };
  },
};
