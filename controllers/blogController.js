import { Blog } from "../models/Blog.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../Utils/errorHandler.js";
import getDataUri from "../Utils/dataUri.js";
import { v2 as cloudinary } from "cloudinary";

export const createBlog = catchAsyncError(async (req, res, next) => {
  const { title, description, category, createdBy } = req.body;

  if (!title || !description || !category) {
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

//Get All Blogs
export const getAllBlogs = catchAsyncError(async (req, res, next) => {
  const blogs = await Blog.find({ isview: "public" }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    blogs,
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

// delete Blogs By id

export const deleteBlog = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const blog = await Blog.findById(id);
  if (!blog) return next(new ErrorHandler("Blog not found", 404));

  await cloudinary.uploader.destroy(blog.poster.public_id);

  //   for (let i = 0; i < blog.subtitle.length; i++) {
  //     const singlesubtitle = blog.subtitle[i]

  //     await cloudinary.uploader.destroy(singlesubtitle.public_id)

  // }

  for (const subtitle of blog.Subtitle) {
    await cloudinary.uploader.destroy(subtitle.poster.public_id);
  }

  await blog.deleteOne();

  res.status(200).json({
    success: true,
    message: "Blog Deleted Successfully",
  });
});

//delete subtitle by id

export const deleteSubtitle = catchAsyncError(async (req, res, next) => {
  const { blogId, subtitleId } = req.query;

  // Find the blog
  const blog = await Blog.findById(blogId);
  if (!blog) return next(new ErrorHandler("Blog not found", 404));

  // Find the subtitle index
  const subtitleIndex = blog.Subtitle.findIndex(
    (subtitle) => subtitle._id.toString() === subtitleId
  );
  console.log(subtitleIndex);

  if (subtitleIndex === -1)
    return next(new ErrorHandler("Subtitle not found", 404));

  // Delete file from Cloudinary (only if it exists)
  const publicId = blog.Subtitle[subtitleIndex]?.poster?.public_id;
  if (publicId) {
    await cloudinary.uploader.destroy(publicId);
  }
  //find indexNo
  const indexno = blog.Subtitle[subtitleIndex].indexNo;
  console.log(publicId, indexno);

  // Remove the subtitle from the array
  blog.Subtitle.splice(subtitleIndex, 1);

  // Update the numOfBlog field
  blog.numOfBlog = blog.Subtitle.length;

  // Save the updated blog document
  await blog.save();

  // Respond to client
  res.status(200).json({
    success: true,
    message: `Subtitle ai index : ${indexno} Deleted Successfully`,
    numOfBlog: `Rest Of Subtitle: ${blog.numOfBlog}`,
  });
});
