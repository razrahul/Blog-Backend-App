import { Blog } from "../models/blog.models.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../Utils/errorHandler.js";
import getDataUri from "../Utils/dataUri.js";
import { v2 as cloudinary } from "cloudinary";
import { User } from "../models/user.models.js";

// Create Blog
export const createBlog = catchAsyncError(async (req, res, next) => {
  const { title, description, categoryId, companyId } = req.body;

  if (!title || !description || !categoryId || !companyId) {
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
    title,
    description,
    category: categoryId,
    company: companyId,
    createdBy: req.user._id,
    poster: {
      public_id: mycloud.public_id,
      url: mycloud.secure_url,
    },
  });

  const createdBlog = await Blog.findById(blog._id)
    .populate({
      path: "category",
      select: "name",
    })
    .populate({
      path: "company",
      select: ["companyName", "companyId"],
    })
    .populate({
      path: "createdBy",
      select: "name",
    });

  if (!createdBlog) {
    return next(new ErrorHandler("Failed to create blog", 500));
  }

  res.status(201).json({
    success: true,
    message: "Blog created successfully",
    blog: createdBlog,
  });
});

//Get All Blogs
export const getAllBlogs = catchAsyncError(async (req, res, next) => {
  const blogs = await Blog.find({ isdelete: false })
    .select("-isdelete")
    .sort({ createdAt: -1 })
    .populate({
      path: "category",
      select: "name",
    })
    .populate({
      path: "company",
      select: ["companyName", "companyId"],
    })
    .populate({
      path: "createdBy",
      select: "name",
    })
    .populate({
      path: "Subtitle",
      match: { isdelete: false }, // Filter subtitles where isdelete is false
      select: ["-isdelete", "-__v"],
      options: { sort: { createdAt: 1 } }, // Sort by createdAt in ascending order
    });

  res.status(200).json({
    success: true,
    message: "All Blogs successfully found",
    blogs,
  });
});

// TODO: Get Public Blogs for website => Complated

// Get All  Public Blogs for website
export const getAllPublicBlogs = catchAsyncError(async (req, res, next) => {
  const blogs = await Blog.find({ ispublic: true, isdelete: false })
    .select("-isdelete")
    .sort({ createdAt: -1 })
    .populate({
      path: "category",
      select: "name",
    })
    .populate({
      path: "company",
      select: ["companyName", "companyId"],
    })
    .populate({
      path: "createdBy",
      select: "name",
    })
    .populate({
      path: "Subtitle",
      match: { isdelete: false }, // Filter subtitles where isdelete is false
      select: ["-isdelete", "-__v"],
      options: { sort: { createdAt: 1 } }, // Sort by createdAt in ascending order
    });

  //=> not 100% aqurate to update count because fist gat all to show then count increase
  // Increment views count for each blog
  // for (const blog of blogs) {
  //   blog.views += 1;
  //   await blog.save(); // Save the updated views count
  // }

  res.status(200).json({
    success: true,
    message: "All Public Blogs successfully found",
    blogs,
  });
});

//Get All Blogs for only public
// export const getAllBlogs = catchAsyncError(async (req, res, next) => {
//   const blogs = await Blog.find({ isview: "public" }).sort({ createdAt: -1 });

//   res.status(200).json({
//     success: true,
//     blogs,
//   });
// });

//Get All deleted Blogs
export const getAllDeletedBlogs = catchAsyncError(async (req, res, next) => {
  const blogs = await Blog.find({ isdelete: true })
    .sort({ createdAt: -1 })
    .populate({
      path: "category",
      select: "name",
    })
    .populate({
      path: "company",
      select: ["companyName", "companyId"],
    })
    .populate({
      path: "createdBy",
      select: "name",
    })
    .populate({
      path: "Subtitle",
      select: "-__v",
      options: { sort: { createdAt: 1 } }, // Sort by createdAt in ascending order
    });

  res.status(200).json({
    success: true,
    message: "All deleted Blogs successfully found",
    blogs,
  });
});

//Get Blog by ID
export const getBlogById = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  // Find the blog and ensure it's not marked as deleted
  const blog = await Blog.findOneAndUpdate(
    { _id: id, isdelete: false },
    { $inc: { views: 1 } }, // Increment the views count by 1
    { new: true } // Return the updated blog
  )
    .populate({
      path: "category",
      select: "name",
    })
    .populate({
      path: "company",
      select: ["companyName", "companyId"],
    })
    .populate({
      path: "createdBy",
      select: "name",
    })
    .populate({
      path: "Subtitle",
      match: { isdelete: false }, // Filter subtitles where isdelete is false
      select: ["-isdeleted", "-__v"],
      options: { sort: { createdAt: 1 } }, // Sort by createdAt in ascending order
    });

  // If blog is not found, throw a 404 error
  if (!blog) return next(new ErrorHandler("Blog not found", 404));

  res.status(200).json({
    success: true,
    message: "Blog successfully found",
    blog,
  });
});


// Update Blog
export const updateBlog = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { title, description, categoryId, companyId } = req.body;

  // Fetch the blog by ID
  const blog = await Blog.findOne({ _id: id, isdelete: false });
  if (!blog) return next(new ErrorHandler("Blog not found", 404));

  // Check if the blog is public then user role is SuperAdmin
  if (blog.ispublic) {
    // Fetch the current user and populate their role
    const user = await User.findById(req.user._id).populate({
      path: "role",
      select: "name",
    });

    if (!user || !user.role) {
      return next(new ErrorHandler("User role not found", 403));
    }

    // Restrict updates for public blogs if the user is not a SuperAdmin
    if (blog.ispublic && user.role.name !== "SuperAdmin") {
      return next(new ErrorHandler("You cannot update a public blog", 403));
    }
  }

  let mycloud = {
    public_id: blog.poster.public_id,
    url: blog.poster.url,
  };

  // If a new file is uploaded, process it via Cloudinary
  if (req.file) {
    const fileUri = getDataUri(req.file);
    if (blog.poster.public_id) {
      await cloudinary.uploader.destroy(blog.poster.public_id); // Delete old poster
    }
    const cloud = await cloudinary.uploader.upload(fileUri.content); // Upload new poster

    mycloud = {
      public_id: cloud.public_id,
      url: cloud.secure_url,
    };
  }

  // Update the blog fields if they are provided
  if (title) blog.title = title;
  if (description) blog.description = description;
  if (categoryId) blog.category = categoryId;
  if (companyId) blog.company = companyId;

  // Update the poster field
  blog.poster = {
    public_id: mycloud.public_id,
    url: mycloud.url,
  };

  blog.ispublic = false;
  blog.updatedBy = req.user._id;

  await blog.save();

  // Fetch the updated blog with populated fields
  const updatedBlog = await Blog.findOne({ _id: id, updatedBy: req.user._id })
    .select("-isdelete")
    .populate({
      path: "category",
      select: "name",
    })
    .populate({
      path: "company",
      select: ["companyName", "companyId"],
    })
    .populate({
      path: "createdBy",
      select: "name",
    })
    .populate({
      path: "Subtitle",
      match: { isdelete: false }, // Filter subtitles where isdelete is false
      select: ["-isdelete", "-__v"],
      options: { sort: { createdAt: 1 } }, // Sort by createdAt in ascending order
    });

  if (!updatedBlog) {
    return next(new ErrorHandler("Failed to update blog || Somrthings Went Worng", 500));
    
  }

  res.status(200).json({
    success: true,
    message: "Blog updated successfully",
    blog: updatedBlog,
  });
});

//update ispublic only for superadmin
//TODO: Some ispublic:false logic is missing => Completed
export const updateIsPublic = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  // Fetch the blog by ID
  const blog = await Blog.findOne({ _id: id, isdelete: false });

  if (!blog) return next(new ErrorHandler("Blog not found", 404));

  // if (!blog.ispublic) {
  //   // Check if the blog has at least five subtitles
  //   if (blog.numOfSubtitles < 5) {
  //     return next(
  //       new ErrorHandler("Blog must have at least five subtitle", 400)
  //     );
  //   }
  // }

  if (!blog.ispublic && blog.numOfSubtitles < 5) {
    return next(
      new ErrorHandler(
        "A blog must have at least five subtitles before being made public.",
        400
      )
    );
  }

  // Update the ispublic field
  blog.ispublic = !blog.ispublic;

  blog.updatedBy = req.user._id;

  // Save the updated blog
  await blog.save();

  res.status(200).json({
    success: true,
    message: `Blog ispublic: ${!blog.ispublic} updated successfully`,
    blog,
  });
});

// Update Blog Views
export const updateBlogViews = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const blog = await Blog.findById(id);
  if (!blog) return next(new ErrorHandler("Blog not found", 404));

  blog.views += 1;
  await blog.save();

  res.status(200).json({
    success: true,
    message: "Blog views updated successfully",
    views: blog.views,
  });
});

// delete Blogs By id
export const deleteBlog = catchAsyncError(async (req, res, next) => {
  // const { id } = req.params;

  const blog = await Blog.findOne({
    _id: req.params.id,
    isdelete: false,
  });
  if (!blog) return next(new ErrorHandler("Blog not found", 404));

  // await cloudinary.uploader.destroy(blog.poster.public_id);

  //   for (let i = 0; i < blog.subtitle.length; i++) {
  //     const singlesubtitle = blog.subtitle[i]

  //     await cloudinary.uploader.destroy(singlesubtitle.public_id)

  // }

  // for (const subtitle of blog.Subtitle) {
  //   await cloudinary.uploader.destroy(subtitle.poster.public_id);
  // }

  blog.isdelete = true;
  blog.deletedBy = req.user._id;

  await blog.save();

  res.status(200).json({
    success: true,
    message: "Blog Deleted Successfully",
  });
});

// restore Blog
export const restoreBlog = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const blog = await Blog.findOne({ _id: id, isdelete: true });
  if (!blog) return next(new ErrorHandler("Blog not found", 404));

  blog.ispublic = false;
  blog.isdelete = false;
  blog.deletedBy = null;

  blog.updatedBy = req.user._id;

  await blog.save();

  const restoredBlog = await Blog.findOne({ _id: blog._id, isdelete: false })
    .populate({
      path: "category",
      select: "name",
    })
    .populate({
      path: "company",
      select: ["companyName", "companyId"],
    })
    .populate({
      path: "createdBy",
      select: "name",
    })
    .populate({
      path: "Subtitle",
      match: { isdelete: false }, // Filter subtitles where isdelete is false
      select: ["-isdelete", "-__v"],
      options: { sort: { createdAt: 1 } }, // Sort by createdAt in ascending order
    });

  if (!restoredBlog) {
    return next(
      new ErrorHandler("Failed to restore blog || Somthing Went Wrong", 500)
    );
  }

  res.status(200).json({
    success: true,
    message: "Blog restored successfully",
    blog: restoredBlog,
  });
});

// add Subtitle
export const addSubtitle = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { title, description } = req.body;

  if (!title || !description) {
    return next(
      new ErrorHandler("Title and Description must be provided", 400)
    );
  }

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

  // Create subtitle object
  const newSubtitle = {
    title,
    description,
    poster: {
      public_id: mycloud.public_id,
      url: mycloud.secure_url,
    },
  };

  // Add new subtitle to the blog
  blog.Subtitle.push(newSubtitle);

  // Update the number of subtitles
  blog.numOfBlog = blog.Subtitle.length;

  // Save the blog
  await blog.save();

  // Respond to the client
  res.status(200).json({
    success: true,
    message: `Subtitle added in Blog at IndexNo: ${blog.numOfSubtitles}`,
    blogId: id, // Return the blog's ID
    subtitle: newSubtitle, // Return the newly added subtitle
  });
});

//delete subtitle by id
export const deleteSubtitle = catchAsyncError(async (req, res, next) => {
  const { blogId, subtitleId } = req.query;

  const blog = await Blog.findById(blogId);
  if (!blog) return next(new ErrorHandler("Blog not found", 404));

  const subtitle = blog.Subtitle.find((item) => {
    if (item._id.toString() === subtitleId.toString()) return item;
  });

  if (!subtitle) return next(new ErrorHandler("Subtitle not found", 404));

  // Delete the poster from Cloudinary if it exists
  if (subtitle.poster?.public_id) {
    await cloudinary.uploader.destroy(subtitle.poster.public_id);
  }

  blog.Subtitle = blog.Subtitle.filter((item) => {
    if (item._id.toString() !== subtitleId.toString()) return item;
  });

  blog.numOfSubtitles = blog.Subtitle.length;

  await blog.save();

  res.status(200).json({
    success: true,
    message: "Subtitle deleted successfully.",
    remainingSubtitles: blog.numOfSubtitles,
  });
});
