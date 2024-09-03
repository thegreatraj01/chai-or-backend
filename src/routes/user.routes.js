import { Router } from "express";
const router = Router();
import { upload } from "../middlewares/multar.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { loginUser, logOutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT,logOutUser);
router.route("/refresh-token").post(refreshAccessToken);


export default router;