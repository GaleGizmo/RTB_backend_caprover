const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;


const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'rockthebarrio',
        allowedFormats: ["jpg", "png", "jpeg", "gif", "pdf"]
    }
});

const upload = multer({ storage });

module.exports = upload;