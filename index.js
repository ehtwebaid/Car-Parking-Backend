// Initialize DOTENV Configuration
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const hbs = require("nodemailer-express-handlebars");
const nodemailer = require("nodemailer");
const path = require("path");
const http = require("http");
const helpers = require("./app/common/helpers");
const { syncDB } = require('./app/models'); // Import sync function
// Importing Configuration files to Global
global.CONFIG = {
  rules: require("./config/rules"),
  bcrypt: require("./config/bcrypt"),
  app: require("./config/app"),
  SITE_URL: process.env.SITE_URL,
  FRONTEND_URL: process.env.FRONTEND_URL,
  transporter: nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: true,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD
    }
  })
};
// initialize nodemailer

// point to the template folder
const handlebarOptions = {
  viewEngine: {
    partialsDir: path.resolve("./views/"),
    defaultLayout: false
  },
  viewPath: path.resolve("./views/")
};
global.CONFIG.transporter.use("compile", hbs(handlebarOptions));

// Importing Middleware
const AuthMiddleware = require("./app/middleware/AuthMiddleware");
const Timezone = require("./app/middleware/Timezone");
// Initialize expressJS
const app = express();


// Initializing CORS
app.use(
  cors({
    origin: "*",
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  fileUpload({
    limits: {
      fileSize: 1000000000000000000000000000000 //1mb
    }
  })
);

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views'); // folder for EJS templates
app.use(express.static("public"));
console.log('🟡 Server booting...');

// Health check route — define early
app.get('/', (req, res) => {
  console.log('📥 GET / hit');
  res.send('✅ Car Parking backend is running');
});
// Initializing Routes
app.use(process.env.SERVER_BASEPATH + "/", require("./routes/auth"));
app.use(
  process.env.SERVER_BASEPATH + "/auth",
  require("./routes/auth")
);
app.use(
  process.env.SERVER_BASEPATH + "/master",
  require("./routes/master")
);
app.use(
  process.env.SERVER_BASEPATH + "/user",
  Timezone.getTimeZone,
  require("./routes/user")
);
app.use(
  process.env.SERVER_BASEPATH + "/admin",
  Timezone.getTimeZone,
  require("./routes/admin")
);
app.use(
  process.env.SERVER_BASEPATH + "/parking-owner",
  Timezone.getTimeZone,
  AuthMiddleware.checkAuth,
  require("./routes/parking-owner")
);

app.use(process.env.SERVER_BASEPATH + "/uploads", express.static("./uploads"));

app.use(process.env.SERVER_BASEPATH + "/downloads", express.static("./downloads"));



// Initializing the Server
syncDB()
  .then(() => {
    console.log('✅ DB Sync Successful');
    app.listen(process.env.SERVER_PORT, () => {
      console.log(`🚀 Server running on http://${process.env.SERVER_HOSTNAME}:${process.env.SERVER_PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ DB Sync Failed:', err);
  });
