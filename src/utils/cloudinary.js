import { v2 as cloudinary } from "cloudinary";
import fs from "fs";


// Configuration
cloudinary.config({
    cloud_name: Process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const response = cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded sucessfully 
        console.log("file has uploaded successfully on cloudinary", response);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); // remove temporary file from server as upload failed
        return null;
    }
}