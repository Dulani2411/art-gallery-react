import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Configure cloudinary with credentials from environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage (doesn't save files to disk)
const storage = new multer.memoryStorage();

// Function to upload image to cloudinary
export const imageUploadUtil = async (file) => {
    try {
        const result = await cloudinary.uploader.upload(
            file,
            {
                resource_type: 'auto'
            }
        );
        return result;
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw error;
    }
};

// Export multer middleware configured with memory storage
export const upload = multer({ storage });