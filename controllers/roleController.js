import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../Utils/errorHandler.js";
import { Role } from "../models/role.models.js";

// Create Role
export const createRole = catchAsyncError(async (req, res, next) => {
  const { name } = req.body;

  if (!name) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  // const existingRole = await Role.findOne({ name });
  // console.log(existingRole && !existingRole.isdeleted);
  
  // if (existingRole && !existingRole.isdeleted) return next(new ErrorHandler("Role Already Exist", 409));

  // Check if a role with the given name exists and is not deleted
  // const existingRole = await Role.findOne({ name, isdeleted: false });
  // if (existingRole) return next(new ErrorHandler("Role Already Exist", 409))

  // / Check if a role with the given name exists 
  const existingRole = await Role.findOne({ name });
  
  if (existingRole) {
    // if isdeleted is false, then the role already exists
    if (!existingRole.isdeleted) {
      return next(new ErrorHandler("Role Already Exist", 409));
    } else {
      //if isdeleted is true, then reactivate the role || means isdeleted: true and updateBy : req.user._id
      // Reactivate the existing role
      existingRole.isdeleted = false;
      existingRole.updatedBy = req.user._id;
      await existingRole.save();

      return res.status(200).json({
        success: true,
        message: "Role reactivated successfully",
        role: existingRole,
      });
    }
  }

  const newRole = await Role.create({
    name,
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Role created successfully",
    role: newRole,
  });
});

// const roles = await Role.find({ isactive: true, isdeleted: false }).sort({name: 1,});

//isactive : true, filter in frontend , for select user registation

// Get All Roles
export const getAllRoles = catchAsyncError(async (req, res, next) => {
  const roles = await Role.find({ isdeleted: false }).sort({
    name: 1,
  });

  res.status(200).json({
    success: true,
    roles,
  });
});

// Get All Deleted Roles
export const getAllDeletedRoles = catchAsyncError(async (req, res, next) => {
  const roles = await Role.find({ isdeleted: true }).sort({ name: 1 });

  res.status(200).json({
    success: true,
    roles,
  });
});



// Get Role by ID
export const getRoleById = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const role = await Role.findById(id);
  if (!role) return next(new ErrorHandler("Role not found", 404));

  if (role.isdeleted )
    return next(new ErrorHandler("Role not found", 404));

  res.status(200).json({
    success: true,
    role,
  });
});

// Update Role
export const updateRole = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  let role = await Role.findById(id);
  if (!role) return next(new ErrorHandler("Role not found", 404));

  if (role.isdeleted) return next(new ErrorHandler("Role not found", 404));

  //   role={
  //     name: name || role.name,
  //     updatedBy: req.user._id,
  //   }

  role.name = name || role.name;
  role.updatedBy = req.user._id;

  await role.save();

  res.status(200).json({
    success: true,
    message: "Role updated successfully",
    role,
  });
});

// Delete Role
export const deleteRole = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  let role = await Role.findById(id);
  if (!role) return next(new ErrorHandler("Role not found", 404));

  if (role.isdeleted) return next(new ErrorHandler("Role not found", 404));

  role.deletedBy = req.user._id;
  role.isdeleted = true;

  await role.save();

  res.status(200).json({
    success: true,
    message: "Role deleted successfully",
  });
});

// isactive change

export const changeActivity = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  let role = await Role.findById(id);
  if (!role) return next(new ErrorHandler("Role not found", 404));

  if (role.isdeleted) return next(new ErrorHandler("Role not found", 404));

  role.isactive = !role.isactive;
  role.updatedBy = req.user._id;

  await role.save();

  res.status(200).json({
    success: true,
    message: "Role updated successfully",
    role,
  });
});
