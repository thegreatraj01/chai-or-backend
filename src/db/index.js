import mongoose from "mongoose";
import { DBNAME } from "../constant.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.DATABASE_URL}/${DBNAME}`);
        console.log(`\n mongodb Connected  !! DB host  ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log(`MongoDb connection error: ${error}`);
        throw error;
    }
}


export default connectDB;

