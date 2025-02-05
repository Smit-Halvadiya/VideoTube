import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express()

app.use(cors({
    origin: process.env.ORIGIN_NAME,    
    credentials: true
}))
app.use(express.json({limit: "16kb"}))
app.use(cookieParser())
app.use(urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))

//router

import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"
import likeRouter from "./routes/Like.routes.js"
import commentRouter  from "./routes/comment.routes.js";
import playlistRouter from "./routes/playlist.routes.js"
app.use("/api/v1/users", userRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/comment", commentRouter)
app.use("/api/v1/playlist", playlistRouter)


export { app }