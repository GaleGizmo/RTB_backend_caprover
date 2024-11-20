const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "rockthebarrio",
    allowedFormats: ["jpg", "png", "jpeg", "gif", "pdf"],
    transformation: [
      { width: 600, crop: "limit" },
      { quality: "auto", fetch_format: "auto" },
    ],
  },
});

const upload = multer({ storage });

module.exports = upload;
