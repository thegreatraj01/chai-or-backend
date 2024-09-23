import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";


export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // console.log(req.cookies.accessToken);
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            throw new ApiError(401, "Unauthorized No token provided");
        }
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const logedInUser = await User.findById(decoded?._id).select("-password -refreshToken");
        if (!logedInUser) {
            throw new ApiError(401, "Invalid Access Token");
        }
        req.user = logedInUser;
        next();
    } catch (error) {
        throw new ApiError(401, error.message || "Invalid Access Token");
    }
})