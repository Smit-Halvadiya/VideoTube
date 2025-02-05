import mongoose from "mongoose"
import { Video } from "../models/videos.model.js"
import { User } from "../models/users.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getAllVideos = asyncHandler(async (req, res) => {
 



    const { page = 2, limit = 10, query, sortBy = 'createdAt', sortType = 'desc', userId } = req.query;
        
   

    // Parse pagination and sorting
    const skip = (page - 1) * limit;
    const sortOrder = sortType === 'asc' ? 1 : -1;  // Sorting direction (ascending or descending)

    // Build the filter query object
    let filterQuery = {};

    if (query) {
        filterQuery.title = { $regex: query, $options: 'i' };  // Case-insensitive search
    }

    if (userId) {
        filterQuery.userId = userId;  // Filter by userId if provided
    }

    // Fetch the videos based on filters, pagination, and sorting
    try {
        const videos = await Video.find(filterQuery)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ [sortBy]: sortOrder });

        // Optionally, you can also get the total count of videos (for pagination)
        const totalCount = await Video.countDocuments(filterQuery);

        // Send response with videos and total count for pagination
        res.status(200).json({
            success: true,
            data: videos,
            totalCount,
            page,
            limit
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error, unable to fetch videos.',
        });
    }
    
    

    
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    const { videoFile, thumbnail} = req.files
    // TODO: get video, upload to cloudinary, create video


    if(!title || !description || !videoFile || !thumbnail){
        throw new ApiError(401, "All Fields Are Required")
    }
    
    const videoFileLocalPath =  videoFile[0].path
    const thumbnailLocalPath =  thumbnail[0].path

    console.log(videoFileLocalPath, thumbnailLocalPath);
    
    const cloudinaryVideoFile = await uploadOnCloudinary(videoFileLocalPath)
    const cloudinaryThumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    
    console.log(cloudinaryVideoFile);

    const video = await Video.create({
        title,
        description,
        videoFile : cloudinaryVideoFile?.url,
        thumbnail : cloudinaryThumbnail?.url,
        isPublished: true,
        duration: cloudinaryVideoFile.duration,
        owner: req.user?._id
    })

    return res
    .status(201)
    .json(new ApiResponse(201,video, "video create successfully"))
    
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    console.log(videoId);
    const video = await Video.findById(videoId)
    

    if(!video){
        return res.status(401)
        .json(new ApiError(400, "video not found"))
    }

    return res.status(200)
    .json(new ApiResponse(201, video, "video fetch successfully"))



})

const updateVideo = asyncHandler(async (req, res) => {
     //TODO: update video details like title, description, thumbnail
    const { videoId } = req.params

    // console.log(videoId);
    
    const { title, description} = req.body
    const { file: thumbnail } = req;

    // console.log("hello: ", thumbnail);

    let cloudinaryThumbnail ="";

    if(thumbnail){
        const thumbnailLocalPath = thumbnail.path;
        console.log(thumbnailLocalPath);
        
        cloudinaryThumbnail = await uploadOnCloudinary(thumbnailLocalPath)
        console.log(cloudinaryThumbnail);
    }
    const video = await Video.findByIdAndUpdate(videoId, {
        $set: {
            title,
            description,
            thumbnail: cloudinaryThumbnail.url
        }
    }, 
    {
          new: true
    }
)
    
    if(!video){
        return res.status(401)
        .json(new ApiError(400, "video not found"))
    }

    return res.status(200)
    .json(new ApiResponse(201, video, "video fetch successfully"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    const video  = await Video.findByIdAndDelete(videoId)
    

    if(!video){
        return res.status(401)
        .json( new ApiError(400, "video not found"))
    }
    
    return res.status(200)
    .json(new ApiResponse(200, {}, "Video deleted Successfully"))


})

const togglePublishStatus = asyncHandler(async (req, res) => {

    //1
    // const { videoId } = req.params

    // const video = await Video.findById(videoId);
    // if(!video){
    //     return res.status(401)
    //     .json( new ApiError(400, "video not found"))
    // }
    
    // const changePublishStatus = await Video.findByIdAndUpdate(videoId, {
    //     $set: {
    //         isPublished: !video.isPublished
            
    //     }
    // },{
    //     new: true
    // })

    // return res.status(201)
    // .json(new ApiResponse(200, changePublishStatus, "change a video Publish Status" ))

    //2
    const { videoId } = req.params

    const video = await Video.findById(videoId);
    if(!video){
        return res.status(401)
        .json( new ApiError(400, "video not found"))
    }

    video.isPublished = !video.isPublished
    await video.save();
    

    return res.status(201)
    .json(new ApiResponse(200, video, "change a video Publish Status" ))


})



export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}