const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../cloudConfig.js");
const ExpressError = require("./ExpressError.js");

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "major/listings",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        public_id: (req, file) => {
            const safeName = file.originalname
                .split(".")[0]
                .replace(/[^a-z0-9]/gi, "-")
                .replace(/-+/g, "-")
                .replace(/^-|-$/g, "")
                .toLowerCase();

            return `${Date.now()}-${safeName || "listing"}`;
        }
    }
});

const fileFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
        return cb(new ExpressError("Only image files are allowed.", 400));
    }

    cb(null, true);
};

module.exports = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});
