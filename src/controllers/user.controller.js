import { asyncHandler } from '../utils/asyncHandler.js';
import User from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';
import fs from "fs";

export const genrateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforesave: false })
        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, 'Something went wrong while generating access token and refresh token');
    }

}

export const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email if user already exists remove images upload by multer in public folder 
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

    const avaterLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if (req.files && req.files.coverImage && req.files.coverImage[0]) {
        coverImageLocalPath = req.files.coverImage[0].path;
    };
    if (existedUser) {
        fs.unlink(avaterLocalPath, (err) => {
            console.log(err, 'file was deleted')
        });
        coverImageLocalPath && fs.unlink(coverImageLocalPath, (err) => {
            console.log(err, 'file was deleted')
        });
        throw new ApiError(409, "user with this email or username already exists");
    };
    if (!avaterLocalPath) {
        throw new ApiError(400, "avatar image is required")
    };
    const avatar = await uploadOnCloudinary(avaterLocalPath);
    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : "";
    if (!avatar) {
        throw new ApiError(400, "avater image is required")
    }
    const user = await User.create({
        fullName,
        userName,
        email,
        password,
        avatar: avatar.secure_url,
        coverImage: coverImage?.secure_url || "",
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    return res.status(201).json(new ApiResponse(200, createdUser, "user registered  successfuly"))
});

export const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie
    const { userName, email, password } = req.body;
    // if(!userName && !email)  we can use it if userName and email both not provided then if block code will be executed
    if (!(userName || email)) {
        throw new ApiError(400, "userName or email is required");
    }
    if (!password.trim()) {
        throw new ApiError(400, "password is required");
    }
    const user = await User.findOne({
        $or: [{ userName }, { email }]
    });
    if (!user) {
        throw new ApiError(404, "No user found please check username or email")
    }
    const isPasswordValid = user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid User credintial")
    }
    const { refreshToken, accessToken } = await genrateAccessAndRefreshTokens(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    const options = {
        httpOnly: true,
        secure: true
    }
    res.status(200)
        .cookie('refreshToken', refreshToken, options)
        .cookie('accessToken', accessToken, options)
        .json(new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully"
        ));

})


export const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    );
    const options = {
        httpOnly: true,
        secure: true
    }
    res.status(200)
        .clearCookie("refreshToken", options)
        .clearCookie("accessToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));

});

export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request No token provided");
    };
    try {
        const decoded = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decoded?._id);
        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        };
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "refresh token is expired or used");
        }
        const option = {
            httpOnly: true,
            secure: true,
        };
        const { accessToken, refreshToken } = genrateAccessAndRefreshTokens(user?._id);
        res.status(200)
            .cookie("refreshToken", refreshToken, option)
            .cookie("accessToken", accessToken, option)
            .json(
                new ApiResponse(200,
                    { accessToken, refreshToken },
                    "token refreshed successfully"
                )
            )

    } catch (error) {
        throw new ApiError(error?.message || "invalid refresh token");
    }

});