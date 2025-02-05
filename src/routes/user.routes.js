import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middlewares.js"

import { upload } from "../middlewares/multer.middlewares.js"

import {userRegister, 
        loginUser, 
        logoutUser, 
        refreshAccessToken,
        changeCurrentPassword,
        getCurrentUser,
        updateAccountDetails,
        updateUserAvatar,
        updateUserCoverImage,

        } from "../controllers/user.controllers.js";

const router = Router()

router.route("/register").post(
    upload.fields(
        [
            {
                name: "avatar",
                maxCount: 1
            },
            {
                name: "coverImage",
                maxCount: 1
            }
        ]
    ),
    userRegister
)

router.route("/login").post(loginUser)

//secure Routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(verifyJWT, refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)


router.route("/update-account").post(verifyJWT, updateAccountDetails)
router.route("/current-user").get(verifyJWT, getCurrentUser)

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)


export default router