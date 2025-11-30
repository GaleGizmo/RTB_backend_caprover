const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { Readable } = require("node:stream");

// Almacenamiento en memoria para luego subir a Cloudinary
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedFormats = ["image/jpeg", "image/png", "image/gif", "application/pdf"];
    if (allowedFormats.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Formato de archivo no permitido"), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
});

/**
 * Sube un buffer a Cloudinary y devuelve el resultado
 */
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: "rockthebarrio",
      transformation: [
        { width: 600, crop: "limit" },
        { quality: "auto", fetch_format: "auto" },
      ],
      ...options,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    // Convertir buffer a stream y enviarlo
    const readable = Readable.from(buffer);
    readable.pipe(uploadStream);
  });
};

/**
 * Middleware que sube el archivo a Cloudinary después de multer
 */
const uploadToCloudinaryMiddleware = async (req, res, next) => {
  try {
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      req.file.path = result.secure_url;
      req.file.filename = result.public_id;
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { upload, uploadToCloudinaryMiddleware };
