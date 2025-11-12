const multer = require("multer");
const path = require("path");

// configure multer for your server folder
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    //ensure that this folder already exists in your project directory
    //cb(null, "public/company_logo");
    var fs = require("fs");
    var dir = "uploads";

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

//Filter the image type
const imageFileFilter = (req, file, cb) => {
  var ext = path.extname(file.originalname);
  if (ext !== ".png" && ext !== ".jpg" && ext !== ".gif" && ext !== ".jpeg") {
    req.fileValidationError = "Forbidden extension";
    return cb(null, false, req.fileValidationError);
  }
  return cb(null, true);
};

//Here we configure what our storage and filefilter will be, which is the storage and imageFileFilter we created above
exports.upload = multer({ storage: storage, fileFilter: imageFileFilter });
