import mongoose from "mongoose";
import { Comment} from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    // const {page = 1, limit = 10} = req.query


    const AllComments = await Comment.find({ video: videoId });  //its provide  Array of comments
    if (!AllComments || AllComments.length === 0) {
        return res.status(404).json(new ApiError(404, "No comments found for this video."));
    }
    

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            AllComments,
            "Comments fetch Successfully"
        )
            
      
    )
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params
    const { content } = req.body
    const userId = req.user?._id

    if(!content){
        return res.status(401).json(new ApiError(401, "please enter a Content"))
    }

    const comment = await Comment.create({
        content,
        video : videoId,
        owner : userId
    })

    if(!comment){
        return res.status(401).json(new ApiError(401, "comment not Submited"))
    }



    return res.status(200)
    .json( new ApiResponse(201, comment, "Comment Add Successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const { content } = req.body
    const updatedComment = await Comment.findByIdAndUpdate(commentId,{content},{new: true}
    )

    if(!updatedComment){
        return res
        .status(404)
        .json(new ApiError(404, "Comment not Updated"))
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            updatedComment,
            "Comment Successfully Updated"
        )
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    const deleteComment = await Comment.findByIdAndDelete(commentId)

    if(!deleteComment){
        return res
        .status(404)
        .json(new ApiError(404, "Comment not deleted"))
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            deleteComment,
            "Comment Successfully deleted"
        )
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
