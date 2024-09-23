import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import { ApiError } from "./apiError.js";


// Define folder paths for images and videos
const imagesFolder = "ChaiOrCode/images";
const videosFolder = "ChaiOrCode/videos";

// Function to check if the file is an image or a video
const getFolderBasedOnFileType = (localFilePath) => {
    const ext = path.extname(localFilePath).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif', '.bmp'].includes(ext)) {
        return imagesFolder;
    } else if (['.mp4', '.mkv', '.avi', '.mov'].includes(ext)) {
        return videosFolder;
    } else {
        return null;  // Handle unsupported file types
    }
};

const uploadOnCloudinary = async (localFilePath) => {
    // Configuration
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    try {
        if (!localFilePath) return null;
        const folderName = getFolderBasedOnFileType(localFilePath);

        if (!folderName) {
            console.log("Unsupported file type.");
            throw new ApiError(400, "Unsupported file type");
        }

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: folderName,  // Upload to respective folder
        });

        // File has been uploaded successfully 
        fs.unlinkSync(localFilePath);  // Remove the local file after successful upload
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath);  // Remove local file if upload fails
        console.log("Error during upload:", error.message);
        return null;
    }
};


// Function to delete a file from Cloudinary pass old file link as a parameter
const deleteFromCloudinary = async (link) => {
    // Configuration
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    const parts = link.split("/"); // Split by "/"
    // Extract the relevant part from the URL (starting from the folder path)
    const publicId = parts.slice(-3).join("/").replace(/\.[^/.]+$/, ""); // Remove the file extension

    try {
        const response = await cloudinary.uploader.destroy(publicId, {});
        // console.log("File deleted successfully:", response);
        return response;
    } catch (error) {
        throw new ApiError(500, error.message);
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };
