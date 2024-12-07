import { Blog } from "../models/Blog.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../Utils/errorHandler.js";

export const createBlog = catchAsyncError( async (req , resp, next ) => {
  
    const {title, description,  category, createdBy } = req.body;
    
    if(! title || !description  || !category || !createdBy) return next( new ErrorHandler("Please fill all the fields", 400))

    const file = req.file;
    // console.log(file);

    const fileUri = getDataUri(file)

    const mycloud = await cloudinary.uploader.upload(fileUri.content)
    

    await Course.create({
        title, description, price, category , createdBy,
        poster:{
            public_id: mycloud.public_id,
            url:mycloud. secure_url,
        }

    })


     resp.status(200).json({
         success: true,
         message: "Blog Created Successfully. you can add Subtitle now",
     })
   
})