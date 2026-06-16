const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;

const envPath = path.join(__dirname, ".env");

if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, "utf8");

    for (const line of envFile.split(/\r?\n/)) {
        const trimmedLine = line.trim();

        if (!trimmedLine || trimmedLine.startsWith("#") || !trimmedLine.includes("=")) {
            continue;
        }

        const [key, ...valueParts] = trimmedLine.split("=");
        const value = valueParts.join("=").trim().replace(/^['"]|['"]$/g, "");

        if (!process.env[key]) {
            process.env[key] = value;
        }
    }
}

if (process.env.CLOUDINARY_URL) {
    cloudinary.config({
        secure: true
    });
} else {
    cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.CLOUD_API_KEY,
        api_secret: process.env.CLOUD_API_SECRET,
        secure: true
    });
}

module.exports = cloudinary;
