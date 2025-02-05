import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middlewares.js"
import {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos

} from "../controllers/like.controllers.js"

const router = Router()

router.use(verifyJWT)

router.route("/toggle/v/:videoId").post(toggleVideoLike)
router.route("/toggle/c/:commentId").post(toggleCommentLike)
router.route("/toggle/t/:videoId").post(toggleTweetLike)
router.route("/videos").get(getLikedVideos)

export default router