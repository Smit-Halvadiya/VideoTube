import mongoose from "mongoose"
import {DB_NAME} from "../constant.js"


const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MONGODB CONNECTION !! DB HOST: ${connectionInstance.connection.host} AND  ${process.env.MONGODB_URI}/${DB_NAME}`);
    } catch (error){
        console.log("MONGODB CONNECTION ERROR", error)
        process.exit(1);
    }
    

}

export default connectDB;