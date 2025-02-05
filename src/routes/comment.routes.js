import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middlewares.js"
import {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment

} from "../controllers/comment.contollers.js"

const router = Router();

router.use(verifyJWT);

router.route("/:videoId").get(getVideoComments).post(addComment)
router.route("/c/:commentId").delete(deleteComment).patch(updateComment)



export default router;