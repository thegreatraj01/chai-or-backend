import { asyncHandler } from '../utils/asyncHandler.js';
import User from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';
import fs from "fs";
import exp from 'constants';

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
    return res.status(200)
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
    return res.status(200)
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
        return res.status(200)
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

export const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword?.trim() || !newPassword?.trim()) {
        throw new ApiError(400, "old password and new password is required");
    }
    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect();
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid Old password ");
    }
    user.password = newPassword;
    await user.save({ validateBeforesave: false });

    return res.status(200)
        .json(new ApiResponse(200, {}, "password changed successfully"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(404, "User not found");
    }
    return res.status(200).json(new ApiResponse(200, req.user, "Current user fatched successfully"));
});

export const updateUserDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;
    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                userName,
                email
            }
        }
        , { new: true }
    ).select("-password");
    return res.status(200)
        .json(new ApiResponse(200, user, "user updated successfully"));

});

export const updateUserAvatar = asyncHandler(async (req, res) => {
    const locaFilePtah = req.file?.path;
    if (!locaFilePtah) {
        throw new ApiError(400, "Avater file is missing");
    };

    const avatar = await uploadOnCloudinary(locaFilePtah);
    if (!avatar.secure_url) {
        throw new ApiError(400, "Eroor while uploading avatar");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.secure_url
            }
        },
        { new: true }
    ).select("-password");

    return res.status(200)
        .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

export const updateUserCoverImage = asyncHandler(async (req, res) => {
    const locaFilePtah = req.file?.path;
    if (!locaFilePtah) {
        throw new ApiError(400, "coverImage file is missing");
    };

    const coverImage = await uploadOnCloudinary(locaFilePtah);
    if (!coverImage.secure_url) {
        throw new ApiError(400, "Eroor while uploading coverImage");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.secure_url
            }
        },
        { new: true }
    ).select("-password");

    return res.status(200)
        .json(new ApiResponse(200, user, "coverImage updated successfully"));
});

export const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { userName } = req.params;
    if (!userName) {
        throw new ApiError(400, "UserName is missing");
    };
    const channel = await User.aggregate([
        {
            $match: {
                userName: userName?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers" // how many subscribers you have
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo" // how many channel you have subscribed
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                userName: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                subscribersCount: 1, // how many subscribers you have
                channelSubscribedToCount: 1, // how many channels you have subscribed
                isSubscribed: 1 // current user(who created the req ) is subscribed you or not 
            }
        }
    ]);
    console.log(channel);
    if(!channel?.length){
        throw new Error("Channel does not exist");
    };
    return res.status(200)
    .json(new ApiResponse(200, channel[0] , "user Channel fetched successfully"));
});