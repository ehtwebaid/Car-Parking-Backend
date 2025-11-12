const fs = require('fs');
const path = require('path');

module.exports = function (options = {}) {
  const {
    dest = 'uploads/',
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf','.svg','.webp'],
    fieldName = 'files',  // Changed to plural (optional)
    maxSizeMB = 2,
    maxUploads = 5
  } = options;
  // Ensure destination folder exists
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  return function (req, res, next) {


    // ✅ If no files uploaded, skip processing
    if (!req.files || !req.files[fieldName]) {
      req.uploadedFiles = [];
      return next();
    }

    const files = Array.isArray(req.files[fieldName])
      ? req.files[fieldName]
      : [req.files[fieldName]]; // Ensure it's an array

     if(files.length>maxUploads)
     {
       return res.status(200).json({
          status:'error',message: `You can upload a maximum of ${maxUploads} images at a time`,
        });
     }
    const uploadedFiles = [];

    for (const file of files) {
      const ext = path.extname(file.name).toLowerCase();
      // ✅ Validate extension
      if (!allowedExtensions.includes(ext)) {
        return res.status(200).json({
          status:'error',
          message: `Only ${allowedExtensions.join(', ')} files are allowed.`,
        });
      }

      // ✅ Validate size
      if (file.size > maxSizeMB * 1024 * 1024) {
        return res.status(400).json({
          status:'error',
          message: `File size should not exceed ${maxSizeMB}MB.`,
        });
      }

      // ✅ Generate unique name and save
      const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
      const uploadPath = path.join(dest, uniqueName);
      try {
        file.mvSync ? file.mvSync(uploadPath) : fs.writeFileSync(uploadPath, file.data);
      } catch (err) {
        return res.status(500).json({ status:'error',message: 'Failed to save file.' });
      }

      uploadedFiles.push({
        name: uniqueName,
        path: uploadPath,
        size: file.size,
        mimetype: file.mimetype,
        originalName: file.name
      });
    }

    // ✅ Attach files info to req
    req.uploadedFiles = uploadedFiles;

    next(); // continue to controller
  };
};
