import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    const userId = req.user._id

    //TODO: create playlist
    if (!name || !description) {
        return res
            .status(401)
            .json(new ApiError(401, "All Fields Are required"))
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: userId
    })
    if (!playlist) {
        return res
            .status(401)
            .json(new ApiError(401, "Playlist not created"))
    }



    return res
        .status(201)
        .json(new ApiResponse(201, playlist, "Playlist Created Sucessfully"))
})



const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id
    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        return res
            .status(401)
            .json(new ApiError(401, "Playlist not found"))
    }

    return res
        .status(201)
        .json(new ApiResponse(201, playlist, "Playlist fetched Sucessfully"))


})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist


    if (!name || !description) {
        return res
            .status(401)
            .json(new ApiError(401, "All Fields are required"))
    }


    const updatePlaylist = await Playlist.findByIdAndUpdate(playlistId, {
        $set: {
            name,
            description
        }
    },
        {
            new: true
        }
    )

    if (!updatePlaylist) {
        return res
            .status(401)
            .json(new ApiError(401, "Playlist not Find"))
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatePlaylist, "Playlist are Successfully Updated"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist

    const playlist = await Playlist.findByIdAndDelete(playlistId)

    if (!playlist) {
        return res
            .status(401)
            .json(new ApiError(401, "Playlist not Find"))
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist are Successfully Deleted"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { videoId, playlistId } = req.params
    let updateOperation;
    let message;
    



    const videoInPlaylist = await Playlist.findOne({
        $and: [{ videos: videoId }, { _id: playlistId }]
    });
    

    //efficient way bcz db one time call
    if (videoInPlaylist) {
        updateOperation = { $pull: { videos: videoId } };
        message = "Video removed from Playlist Successfully";
      } else {
        updateOperation = { $push: { videos: videoId } };
        message = "Video added to Playlist Successfully";
      }

    console.log("updateOperation: ", updateOperation);

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        updateOperation,
        { new: true }
    );

    return res
        .status(201)
        .json(new ApiResponse(201, playlist, message))



    // if (!videoInPlaylist) {
    //     const playlist = await Playlist.findByIdAndUpdate(playlistId,
    //         { $push: { videos: videoId } }, {new: true}
    //     )



    // }else{
    //     const playlist = await Playlist.findByIdAndUpdate(playlistId,
    //         { $pull: { videos: videoId } }, {new: true}
    //     )


    //     return res
    //     .status(200)
    //     .json(new ApiResponse(200,playlist, "Video add to Playlist Successfully"))

    // }




})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist

})





const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}