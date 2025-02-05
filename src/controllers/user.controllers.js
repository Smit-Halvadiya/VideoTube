import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { User } from "../models/users.model.js";
import { emailRegex } from "../constant.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { options } from "../constant.js"
import jwt from "jsonwebtoken"


const generateAccessAndRefereshTokens = async (userId) => {
    try {


        const user = await User.findById(userId)
        console.log("User Is: ", user);

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        console.log("AccessToken:", accessToken);

        user.refreshToken = refreshToken
        await user.save({ ValidateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const userRegister = asyncHandler(async (req, res) => {

    const { username, email, fullName, password } = req.body;
    if ([username, email, fullName, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");

    }

    if (!emailRegex.test(email)) {
        throw new ApiError(409, "Email Address is Invaid")
    }

    const existuser = await User.findOne({
        $or: [
            { username },
            { email }
        ]
    })

    if (existuser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    console.log("Existed User: ", existuser)

    console.log("req.files: ", req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // console.log("avatarlocalpath", avatarLocalPath)


    let coverImageLocalPath;

    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files?.coverImage[0]?.path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    // console.log(coverImage)
    if (!avatar) {
        throw new ApiError(400, "avatar file is require");
    }




    const user = await User.create({
        email,
        username: username.toLowerCase(),
        fullName,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
        
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "User not Created, Pleace Try Again");

    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )
}
)

const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const { email, password } = req.body
    // console.log(email, "pass:", password);

    if (!password && !email) {
        throw new ApiError(400, "username or email is required")
    }


    const user = await User.findOne({ email })
    // console.log( user)
    if (!user) {
        throw new ApiError(404, "User does not exist")
    }


    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged In Successfully"
            )
        )

})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }


    try {

        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")

        }

        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)
        console.log("new Refresh Toeknnn:", refreshToken);


        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
        throw new ApiError(401, "All Fields Are Required")
    }

    if (newPassword !== confirmPassword) {
        throw new ApiError(401, "New and Confirm Password are not same")
    }

    if (oldPassword == newPassword || oldPassword == confirmPassword) {
        throw new ApiError(401, "not same to new or confirm Password")
    }

    const user = await User.findById(req.user._id)
    const isPasswordValid = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordValid) {
        throw new ApiError(401, "Old Password not correct! please Try Again!")
    }

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    user.password = newPassword
    await user.save({ ValidateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(201, {}, "Password Change Successfully"))


})

const getCurrentUser = asyncHandler(async (req, res) => {
    
    return res
    .status(200)
    .json(new ApiResponse(201, req.user, "User fetched successfully"))

})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
        throw new ApiError(401, "All Fields Are Required")
    }

    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            fullName,
            email
        },

    },
        {
            new: true //changes j thya hoe e response ma moklse (jo new true nai aapi to changes thae jase pn fronted ma old fullname and email moklse)
        }
    ).select("-password")

    if (!user) {
        throw new ApiError(401, "user not found");

    }

    return res
        .status(200)
        .json(new ApiResponse(201, user, "Account details updated successfully"))



})

const updateUserAvatar = asyncHandler(async (req, res) => {
    console.log(req.file);
    
    const avatarLocalPath = req.file?.path
    if(!avatarLocalPath){
        throw new ApiError(401, "Avatar not uploaded");
        
    }
    console.log(avatarLocalPath)

    const cloudinaryAvatar = await uploadOnCloudinary(avatarLocalPath)

    if(!cloudinaryAvatar.url){
        throw new ApiError(401, "Error while uploading on avatar");
        
    }
    console.log("cloudinaryAvatar: ", cloudinaryAvatar);
    
    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            avatar: cloudinaryAvatar.url
        }
    },
    {
        new: true
    }).select("-password")


    return res.
    status(200)
    .json(new ApiResponse(201, user, "Avatar image updated successfully"))
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    // console.log(req.file);
    
    const coverImageLocalPath = req.file?.path
    if(!coverImageLocalPath){
        throw new ApiError(401, "coverImage not uploaded");
        
    }
    // console.log(avatarLocalPath)

    const cloudinaryCoverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!cloudinaryCoverImage.url){
        throw new ApiError(401, "Error while uploading on coverImage");
        
    }
    // console.log("cloudinaryAvatar: ", cloudinaryAvatar);
    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            coverImage: cloudinaryCoverImage.url
        }
    },
    {
        new: true
    }).select("-password")


    return res.
    status(200)
    .json(new ApiResponse(201, user, "coverImage image updated successfully"))
})
export {
    userRegister,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
}