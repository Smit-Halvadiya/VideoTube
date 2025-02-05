import mongoose from "mongoose"
import {Like} from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/videos.model.js"


const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const userId = req.user._id
    //TODO: toggle like on video

  
    const isLiked = await Like.findOne({
        $and: [{video : videoId},{likedBy: userId}]    
      });
    console.log("isLiked", isLiked);
    
    if(!isLiked){
        await Like.create({
            video: videoId,
            likedBy: userId
        })


        return res.status(200)
        .json(new ApiResponse (200, {}, "Liked Successfully"))
    }else{
        await Like.findByIdAndDelete(isLiked._id)

        return res.status(200)
        .json(new ApiResponse (200, {}, "Disliked Successfully"))
    }
  
    



})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    const userId = req.user._id
    //TODO: toggle like on video

  
    const isLikedComment = await Like.findOne({
        $and: [{comment : commentId},{likedBy: userId}]    
      });
    console.log("isLiked Comment is :", isLikedComment);
    
    if(!isLikedComment){
        await Like.create({
            comment: commentId,
            likedBy: userId
        })


        return res.status(200)
        .json(new ApiResponse (200, {}, "Comment Liked Successfully"))
    }else{
        await Like.findByIdAndDelete(isLikedComment._id)

        return res.status(200)
        .json(new ApiResponse (200, {}, "Comment Disliked Successfully"))
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet


}
)

const getLikedVideos = asyncHandler(async (req, res) => {
  
    //TODO: get all liked videos
    const userId = req.user._id
    console.log("userId: ", userId);

    //find a liked user where userId same and "Like model" have video property
    const getLikedVideos = await Like.find({
        $and: [
            {video: { $exists: true }},
            {likedBy: userId}
        ]
            
        
    })
    if(!getLikedVideos){
        return res
        .status(400)
        .json(new ApiError(400, "Nothing Any Liked Videos"))
    }

    // get ids of an videos which videos liked
    const videoIds =  getLikedVideos.map(doc => doc.video);
    const videos = await Video.find({ _id:  videoIds  });
    
    if(!videos){
        return res
        .status(400)
        .json(new ApiError(400, "Nothing Any Liked Videos"))
    }

    return res.status(200).
    json(new ApiResponse(200, videos, "Liked Videos Fetch Successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}



