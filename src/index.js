import dotenv from "dotenv";
import express from "express";
import connectDB from "./db/index.js";

dotenv.config();



connectDB();











 /* ;(async () => {
    try {
        await mongoose.connect(`${process.env.DATABASE_URL}/${DBNAME}`);
        app.on('error', (err) => {
            console.log(err);
            throw err;
        });

        app.listen(process.env.PORT, () => {
            console.log(`app is listening on port  ${process.env.PORT}`)
        });
    } catch (error) {
        console.log(error);
        throw err;
    }
})()
*/