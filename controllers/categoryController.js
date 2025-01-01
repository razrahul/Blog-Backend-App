import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../Utils/errorHandler.js";
import { Category } from "../models/category.models.js";

// Create Category
export const createCategory = catchAsyncError(async (req, res, next) => {
  const { name } = req.body;

  if (!name) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

//   const existingCategory = await Category.findOne({ name });
//   if (existingCategory && !existingCategory.isdeleted) {
//     return next(new ErrorHandler("Category Already Exist", 409));
//   }

  // / Check if a Category with the given name exists 
  const existingCategory = await Category.findOne({ name });
  
  if (existingCategory) {
    // if isdeleted is false, then the Category already exists
    if (!existingCategory.isdeleted) {
      return next(new ErrorHandler("Category Already Exist", 409));
    } else {
      //if isdeleted is true, then reactivate the role || means isdeleted: true and updateBy : req.user._id
      // Reactivate the existing role
      existingCategory.isdeleted = false;
      existingCategory.updatedBy = req.user._id;
      await existingCategory.save();

      return res.status(200).json({
        success: true,
        message: "Category reactivated successfully",
        category: existingCategory,
      });
    }
  }

  const newCategory = await Category.create({
    name,
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    category: newCategory,
  });
});

// Get All Categories
export const getAllCategories = catchAsyncError(async (req, res, next) => {
  const categories = await Category.find({ isdeleted: false }).sort({
    name: 1,
  });

  res.status(200).json({
    success: true,
    categories,
  });
});

// Get All deleted Categories
export const getAllDeletedCategories = catchAsyncError(async (req, res, next) => {
  const categories = await Category.find({ isdeleted: true }).sort({
    name: 1,
  });

  res.status(200).json({
    success: true,
    categories,
  });
});

// Get Category by ID
export const getCategoryById = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category) return next(new ErrorHandler("Category not found", 404));

  if (category.isdeleted ) {
    return next(new ErrorHandler("Category not found", 404));
  }

  res.status(200).json({
    success: true,
    category,
  });
});

// Update Category
export const updateCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  let category = await Category.findById(id);
  if (!category) return next(new ErrorHandler("Category not found", 404));

  if (category.isdeleted) return next(new ErrorHandler("Category not found", 404));

  category.name = name || category.name;
  category.updatedBy = req.user._id;

  await category.save();

  res.status(200).json({
    success: true,
    message: "Category updated successfully",
    category,
  });
});

// Delete Category
export const deleteCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  let category = await Category.findById(id);
  if (!category) return next(new ErrorHandler("Category not found", 404));

  if (category.isdeleted) return next(new ErrorHandler("Category not found", 404));

  category.deletedBy = req.user._id;
  category.isdeleted = true;

  await category.save();

  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
});

// Change Activity Status
export const changeCategoryActivity = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  let category = await Category.findById(id);
  if (!category) return next(new ErrorHandler("Category not found", 404));

  if (category.isdeleted) return next(new ErrorHandler("Category not found", 404));

  category.isactive = !category.isactive;
  category.updatedBy = req.user._id;

  await category.save();

  res.status(200).json({
    success: true,
    message: "Category activity status updated successfully",
    category,
  });
});
