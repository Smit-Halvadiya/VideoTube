import dotenv from "dotenv";
dotenv.config({
    path: './.env'
})
import connectDB from "./db/index.js";
import { app } from "./app.js"

connectDB()
.then(() => {
    app.on("Error", (error) => {
        console.log("Error: ", error);
        throw error;
    })
    app.listen(`${process.env.PORT}`, () => {
        console.log(`server is running at port: ${process.env.PORT}`);
        
    })
})
.catch((error) => {
    console.log("ERROR: ", error);
    
})



