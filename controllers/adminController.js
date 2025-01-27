import { User } from "../models/user.models.js";
import { Role } from "../models/role.models.js";
import { Company } from "../models/company.models.js";
import { Category } from "../models/category.models.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../Utils/errorHandler.js";

export const updateUserRoleAndCompany = catchAsyncError(async (req, res, next) => {
  const { roleId, companyId } = req.body;

  const user = await User.findOne({
    _id: req.params.id,
    isdelete: false,
  });

  if (!user) return next(new ErrorHandler("User not Found", 404));

  if (roleId) user.role = roleId;
  if (companyId) user.company = companyId;

  user.updatedBy = req.params.id;

  await user.save();

  const updatedUser = await User.findById(user._id).select(" -isdelete ")
    .populate({
      path: "role",
      select: "name",
    })
    .populate({
      path: "company",
      select: ["companyName", "companyId"],
    });
    
  if(!updatedUser) return next(new ErrorHandler("Somethine Went Wrong", 501))

  res.status(200).json({
    success: true,
    message: "User role and company updated successfully",
    user: updatedUser,
  });
});

//restore Role
export const restoreRole = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const role = await Role.findOne({
    _id: id,
    isdeleted: true,
  }); 

  if (!role) return next(new ErrorHandler("Role not Found", 404));

  role.isdeleted = false;
  role.deletedBy = null;

  role.updatedBy = req.user._id;

  await role.save();


  res.status(200).json({
    success: true,
    message: "Role restored successfully",
    role,
  });
});

//restore Company
export const restoreCompany = catchAsyncError(async (req, res, next) => {
  const company = await Company.findOne({
    _id: req.params.id,
    isdelete: true
  })

  if(!company) return next(new ErrorHandler("Company not Found", 404));

  company.isdelete = false;
  company.deletedBy = null;

  company.updatedBy = req.user._id;

  await company.save();

  res.status(200).json({
    success: true,
    message: "Company restored successfully",
    company
  })
});

//restore Category
export const restoreCategory = catchAsyncError(async (req, res, next) => {
  const category = await Category.findOne({
    _id: req.params.id,
    isdeleted: true
  })

  if(!category) return next(new ErrorHandler("Category not Found", 404));

  category.isdeleted = false;
  category.deletedBy = null;

  category.updatedBy = req.user._id;

  await category.save();

  res.status(200).json({
    success: true,
    message: "Category restored successfully",
    category,
  })
});
