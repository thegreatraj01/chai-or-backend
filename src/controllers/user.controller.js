import { asyncHandler } from '../utils/asyncHandler.js';
import User from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import {ApiResponse} from '../utils/ApiResponse.js';

export const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res
    const { userName, fullName, email, password } = req.body;
    if (
        [userName, fullName, email, password].some(feild =>
            feild?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }
    const existedUser = await User.findOne({
        $or: [{ email }, { userName }]
    })
    if (existedUser) {
        throw new ApiError(409, "user with this email or username already exists");
    }
    const avaterLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if (!avaterLocalPath) {
        throw new ApiError(400, "avater image is required")
    }
    const avater = await uploadOnCloudinary(avaterLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!avater) {
        throw new ApiError(400, "avater image is required")
    }
    const user = await User.create({
        fullName,
        userName,
        email,
        password,
        avater: avater.url,
        coverImage: coverImage?.url || "",
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    return res.status(201).json(new ApiResponse(200,createdUser,"user registered  successfuly"))
});
