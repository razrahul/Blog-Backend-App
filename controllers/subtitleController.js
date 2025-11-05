import { Subtitle } from "../models/subtitle.models.js";
import { Blog } from "../models/blog.models.js";
import { User } from "../models/user.models.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../Utils/errorHandler.js";
import getDataUri from "../Utils/dataUri.js";
import { v2 as cloudinary } from "cloudinary";

// Create Subtitle
export const createSubtitle = catchAsyncError(async (req, res, next) => {
  const { blogId } = req.params;
  const { title, description } = req.body;

  if (!title || !description) {
    return next(
      new ErrorHandler("Title and Description must be provided", 400)
    );
  }

  // Find the blog by ID
  const blog = await Blog.findById(blogId);
  if (!blog) {
    return next(new ErrorHandler("Blog not found", 404));
  }

  let myCloud = { public_id: null, secure_url: null };

  // If a file is uploaded, process it
  const file = req.file;
  if (file) {
    const fileUri = getDataUri(file);
    myCloud = await cloudinary.uploader.upload(fileUri.content);
  }

  // Create the subtitle
  const subtitle = await Subtitle.create({
    title,
    description,
    blog: blogId,
    createdBy: req.user._id,
    poster: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });

  // Add the subtitle ID to the blog
  blog.Subtitle.push(subtitle._id);
  blog.numOfSubtitles = blog.Subtitle.length;
  await blog.save();

  res.status(201).json({
    success: true,
    message: "Subtitle created successfully",
    blogId: blogId,
    subtitle,
  });
});

// Get All Subtitles
export const getAllSubtitles = catchAsyncError(async (req, res, next) => {
  const subtitles = await Subtitle.find({ isdelete: false })
    .sort({ createdAt: 1 })
    .select("-isdelete");

  res.status(200).json({
    success: true,
    message: "All Subtitles fonud",
    subtitles,
  });
});

// Get Subtitle by ID
export const getSubtitleById = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const subtitle = await Subtitle.findOne({ _id: id, isdelete: false }).select(
    "-isdelete"
  );

  if (!subtitle) {
    return next(new ErrorHandler("Subtitle not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Subtitle found",
    subtitle,
  });
});

// Get All Deleted Subtitles
export const getAllDeletedSubtitles = catchAsyncError(
  async (req, res, next) => {
    const subtitles = await Subtitle.find({ isdelete: true })
      .sort({ createdAt: 1 })
      .select("-isdelete");

    res.status(200).json({
      success: true,
      message: "All Deleted Subtitles fonud",
      subtitles,
    });
  }
);

// Update Subtitle
export const updateSubtitle = catchAsyncError(async (req, res, next) => {
  const { blogId, subtitleId } = req.query;

  if (!blogId || !subtitleId) {
    return next(new ErrorHandler("blogId and subtitleId are required", 400));
  }
  if (!req.user?._id) {
    return next(new ErrorHandler("Unauthorized", 401));       
  }

  const subtitle = await Subtitle.findOne({ _id: subtitleId, isdelete: false });
  if (!subtitle) return next(new ErrorHandler("Subtitle not found", 404));

  const blog = await Blog.findOne({ _id: blogId, isdelete: false });
  if (!blog) return next(new ErrorHandler("Blog not found", 404));

  // if blog is public, only SuperAdmin can update
  if (blog.ispublic) {
    const user = await User.findById(req.user._id).populate({ path: "role", select: "name" });
    if (!user?.role?.name) return next(new ErrorHandler("User role not found", 403));
    if (user.role.name !== "SuperAdmin") {
      return next(new ErrorHandler("You cannot update a public blog", 403));
    }
  }

  // Partial updates
  const { title, description } = req.body || {};
  if (title != null) subtitle.title = title;
  if (description != null) subtitle.description = description;

  // Optional file (use optional chaining for safety)
  if (req.file) {
    if (subtitle.poster?.public_id) {
      await cloudinary.uploader.destroy(subtitle.poster.public_id).catch(() => {});
    }
    const fileUri = getDataUri(req.file); // ensure multer memoryStorage is used
    const myCloud = await cloudinary.uploader.upload(fileUri.content);
    subtitle.poster = { public_id: myCloud.public_id, url: myCloud.secure_url };
  }

  subtitle.updatedBy = req.user._id;
  await subtitle.save();

  return res.status(200).json({
    success: true,
    message: "Subtitle updated successfully",
    subtitle, // <-- client should use data.subtitle
  });
});


// Delete Subtitle
export const deleteSubtitle = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const subtitle = await Subtitle.findOne({ _id: id, isdelete: false });

  if (!subtitle) return next(new ErrorHandler("Subtitle not found", 404));

  // if (subtitle.poster.public_id) {
  //   await cloudinary.uploader.destroy(subtitle.poster.public_id);
  // }

  subtitle.isdelete = true;
  subtitle.deletedBy = req.user._id;

  await subtitle.save();

  res.status(200).json({
    success: true,
    message: "Subtitle deleted successfully",
  });
});

// Restore Subtitle
export const restoreSubtitle = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const subtitle = await Subtitle.findOne({ _id: id, isdelete: true });

  if (!subtitle) return next(new ErrorHandler("Subtitle not found", 404));

  subtitle.isdelete = false;
  subtitle.deletedBy = null;

  subtitle.updatedBy = req.user._id;

  await subtitle.save();

  const restoreSubtitle = await Subtitle.findOne({ _id: subtitle._id, isdelete: false });

  if (!restoreSubtitle) return next(new ErrorHandler("Somthing Went Wrong", 500));

  res.status(200).json({
    success: true,
    message: "Subtitle restored successfully",
    subtitle: restoreSubtitle,
  });
});

//Note: parmenet Delete Blog time delete in id from in blog model
