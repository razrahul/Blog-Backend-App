import { Blog } from "../models/Blog.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../Utils/errorHandler.js";
import getDataUri from "../Utils/dataUri.js";
import { v2 as cloudinary } from "cloudinary";

export const createBlog = catchAsyncError(async (req, res, next) => {
    const { title, description, category, createdBy } = req.body;
  
    if (!title || !description || !category ) {
      return next(new ErrorHandler("Please fill all the fields", 400));
    }
  
    const file = req.file;
    if (!file) return next(new ErrorHandler("Please upload a poster", 400));
  
    // Convert the uploaded file to Data URI
    const fileUri = getDataUri(file);
  
    // Upload to Cloudinary
    const mycloud = await cloudinary.uploader.upload(fileUri.content);
  
    // Save the blog with the user reference
    const blog = await Blog.create({
      user: req.user.id, // Assuming req.user contains the logged-in user (from authentication middleware)
      title,
      description,
      category,
      createdBy,
      poster: {
        public_id: mycloud.public_id,
        url: mycloud.secure_url,
      },
    });
  
    res.status(201).json({
      success: true,
      message: "Blog Created Successfully. You can add Subtitle now.",
      blog, // Optionally return the created blog
    });
  });

  
 // add Subtitle
 export const addSubtitle = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { indexNo, title, description } = req.body;

  // Fetch the blog
  const blog = await Blog.findById(id);
  if (!blog) return next(new ErrorHandler("Blog not found", 404));

  // Default Cloudinary upload response if no file is provided
  let mycloud = {
    public_id: null,
    secure_url: null,
  };

  // If file is uploaded, process it

  const file = req.file;

  if (file) {
    const fileUri = getDataUri(req.file);
    mycloud = await cloudinary.uploader.upload(fileUri.content);
  }

  // Add new subtitle to the blog
  blog.Subtitle.push({
    indexNo,
    title,
    description,
    poster: {
      public_id: mycloud.public_id,
      url: mycloud.secure_url,
    },
  });

  // Update the number of subtitles
  blog.numOfBlog = blog.Subtitle.length;
  blog.updateAt = Date.now();

  // Save the blog
  await blog.save();

  // Respond to the client
  res.status(200).json({
    success: true,
    message: `Subtitle added in Blog at IndexNo: ${indexNo}`,
  });
});
