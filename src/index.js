import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: './.env'
})

connectDB()
    .then(() => {
        app.on('error', (err) => {
            console.log(err);
            throw err;
        });

        app.listen(process.env.PORT || 8000, () => console.log(` server is listening on ${process.env.PORT}`));
    })
    .catch((err) => console.log(`database connection failed from index.js ${err} `))











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