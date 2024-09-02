import { v2 as cloudinary } from "cloudinary"
import fs from "fs"
// import dotenv from "dotenv";
// dotenv.config();

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const folderName = "ChaiOrCode";

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: folderName
        })
        // file has been uploaded sucessfully 
        // console.log("file has uploaded successfully on cloudinary", response.secure_url);
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); // remove temporary file from server as upload failed
        console.log(error.message, error);
        return null;
    }
}


export { uploadOnCloudinary };