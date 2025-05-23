import app from "./App.js"
import {connectDB} from "./config/database.js"
import cloudinary from "cloudinary";
import logger from "./logger/winston.logger.js";

connectDB();

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
    api_key: process.env.CLOUDINARY_CLIENT_API,
    api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
})


const Port = process.env.PORT;

app.listen(Port, () => {
    // console.log(`Server is running on port ${Port}`)
    logger.info("⚙️  Server is running on port: " + process.env.PORT);
})



