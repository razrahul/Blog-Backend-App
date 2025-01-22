import { User } from "../models/user.models.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import sendToken from "../Utils/sendToken.js";
import ErrorHandler from "../Utils/errorHandler.js";
import getDataUri from "../Utils/dataUri.js";
import { v2 as cloudinary } from "cloudinary";
import bcrypt from "bcrypt";
import {
  allfiled,
  invalid,
  logoutSuss,
  invalidPass,
} from "../Utils/message.js";
import { json } from "express";

export const register = catchAsyncError(async (req, res, next) => {
  const { name, username, email, number, password, roleId, companyId } =
    req.body;

  // if (!name || !email || !password)
  //   return next(new ErrorHandler(allfiled, 400));

  if (
    [name, email, username, password, number].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  let user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (user) {
    if (!user.isdelete) {
      return next(new ErrorHandler("User Already Exist", 409));
    } else {
      //TODO: create Reactivate User
      //if isdeleted is true, then reactivate the role || means isdeleted: true and updateBy : req.user._id
      // Reactivate the existing role
      if (password) {
        user.password = password;
      }

      user.isVerified = false;
      user.isdelete = false;
      user.updatedBY = req.user._id;

      const createUser = await User.findById(user._id).select(" -isdelete ")
        .populate({
          path: "role",
          select: "name",
        })
        .populate({
          path: "company", 
          select: ["companyName", "companyId"],
        });
        
      if (!createUser) {
        return next(
          new ErrorHandler(
            "Something went wrong while registering the user",
            501
          )
        );
      }

      res.status(201),
        json({
          success: true,
          message: "User reactivated Sccessfully, Password Updated",
          user: createUser,
        });
    }
  }

  // Default Cloudinary upload response if no file is provided
  let myCloud = {
    public_id: null,
    secure_url: null,
  };

  const file = req.file;
  // If file is uploaded, upload it to Cloudinary
  if (file) {
    const fileUri = getDataUri(req.file);
    myCloud = await cloudinary.uploader.upload(fileUri.content);
  }

  user = await User.create({
    name,
    username,
    email,
    number,
    password,
    role: roleId,
    company: companyId,
    createdBy: req.user._id,
    avatar: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });

  const createUser = await User.findById(user._id).select(" -isdelete ")
    .populate({
      path: "role",
      select: "name",
    })
    .populate({
      path: "company",
      select: ["companyName", "companyId"],
    });


  if (!createUser) {
    return next(
      new ErrorHandler("Something went wrong while registering the user", 501)
    );
  }

  res.status(200).json({
    success: true,
    message:
      "User registered successfully. Please contact Admin for verification.",
    user: createUser,
  });
});

//login controller

export const login = catchAsyncError(async (req, res, next) => {
  const { email, username, password } = req.body;

  if ((!email && !username) || !password) {
    return next(
      new ErrorHandler("Username or email and password are required", 400)
    );
  }

  const user = await User.findOne({
    $and: [
      { $or: [{ email }, { username }] }, // Match email or username
      { isdelete: false }, // Ensure isdelete is false
    ],
  })
    .select("+password -isdelete") // Include password for comparison and exclude isdelete from the result
    .populate({
      path: "role", // Populate the role field
      select: "name", // Select only the name field from the Role model
    })
    .populate({
      path: "company", // Populate the company field
      select: ["companyName", "companyId"], // Select only the companyName field from the Company model
    });

  if (!user) {
    return next(new ErrorHandler("User Not Found", 401));
  }

  if (!user.isVerified) {
    return next(
      new ErrorHandler("You are not verified, please contact Admin", 401)
    );
  }

  // if (!user.isactive) {
  //   return next(
  //     new ErrorHandler("You are not active, please contact Admin", 401)
  //   );
  // }

  if (user.isblocked) {
    return next(new ErrorHandler("You are blocked, please contact Admin", 401));
  }

  // Compare password to hash password
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Password", 401));
  }

  // Exclude password from the user object before sending the response
  user.password = undefined;

  sendToken(res, user, `Welcome Back, ${user.name}`, 200);
});

// user logout

export const logout = catchAsyncError(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.status(200).json({
    success: true,
    message: logoutSuss,
  });
});

//user profile

export const getUserProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({
    _id: req.user._id,
    isdelete: false,
    isVerified: true,
    isblocked: false,
  })
    .select("-isdelete ")
    .populate({
      path: "role", // Populate the role field
      select: "name", // Select only the name field from the Role model
    })
    .populate({
      path: "company", // Populate the company field
      select: ["companyName", "companyId"], // Select only the companyName field from the Company model
    });

  res.status(200).json({
    success: true,
    user,
  });
});

// Update user Profile
export const updateUserProfile = catchAsyncError(async (req, res, next) => {
  const { name, email, number } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) return next(new ErrorHandler("User not Found", 404));

  //TODO: username and email donot replicate
  // const existeduser = await User.findOne({
  //   $or: [{ username }, { email }],
  // });
  // if (existeduser) return next(new ErrorHandler(`${username} ${email} Already Exist, Please try Other`, 409));

  // Only update if new values are provided and different from existing values
  if (name && name !== user.name) user.name = name;
  
  // Check if the new email already exists in the database (excluding the current user)
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
      return next(new ErrorHandler("Email already exists. Please use a different email.", 409));
    }
    user.email = email; // Update only if it's unique
  }
  if (number && number !== user.number) user.number = number;

  // if (password) {
  //   user.password = await bcrypt.hash(password, 10);
  // }

  if (req.file) {
    // Delete the old avatar from Cloudinary if it exists
    if (user.avatar.public_id) {
      await cloudinary.uploader.destroy(user.avatar.public_id);
    }

    const fileUri = getDataUri(req.file);
    const myCloud = await cloudinary.uploader.upload(fileUri.content);
    user.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }

  user.updatedBy = req.user._id;

  await user.save();
  // Find the updated user by matching _id and updatedBy
  const updatedUser = await User.findOne({
    _id: req.user._id,
    updatedBy: req.user._id, // Match both _id and updatedBy fields
  })
    .select("-isdelete ")
    .populate({
      path: "role",
      select: "name",
    })
    .populate({
      path: "company",
      select: ["companyName", "companyId"],
    });

  if (!updatedUser)
    return next(
      new ErrorHandler("Something went wrong, please try again", 404)
    );

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: updatedUser,
  });
});

// GEt all Users

export const getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.find({ isdelete: false })
    .populate({
      path: "role",
      select: "name",
    })
    .populate({
      path: "company",
      select: ["companyName", "companyId"],
    });

  res.status(200).json({
    success: true,
    message: "All Users",
    users,
  });
});

// Get All deleted Users
export const getAllDeletedUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.find({ isdelete: true })
    .populate({
      path: "role",
      select: "name",
    })
    .populate({
      path: "company",
      select: ["companyName", "companyId"],
    });

  res.status(201).json({
    success: true,
    message: "All Deleted Users",
    users,
  });
});

//update user view

export const updateUserView = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new ErrorHandler("User not Found", 404));

  //   if (user.isview === "public") user.isview = "private";
  //   else user.isview = "public";

  // Toggle the 'isview' value between "public" and "private"

  user.isview = user.isview === "public" ? "private" : "public";

  await user.save();

  res.status(200).json({
    success: true,
    message: " View Updated",
  });
});

//update user Activity

export const updateUserActivity = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({
    _id: req.params.id,
    isdelete: false,
  });

  if (!user) return next(new ErrorHandler("User not Found", 404));

  // Toggle the 'isactive' property
  user.isactive = !user.isactive;
  user.updatedBy = req.user._id;

  await user.save();

  res.status(200).json({
    success: true,
    message: "User activity status updated",
  });
});

// update user verification
export const updateUserverification = catchAsyncError(
  async (req, res, next) => {
    const user = await User.findOne({
      _id: req.params.id,
      isdelete: false,
    });

    if (!user) return next(new ErrorHandler("User not Found", 404));

    if (user.isblocked)
      return next(new ErrorHandler("User Blocked , Please Contact Admin", 402));

    // Toggle the 'isVerified' property
    user.isVerified = !user.isVerified;
    user.updatedBy = req.user._id;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Verification Updated",
    });
  }
);

// update user block conformation

export const updateUserBlockConformation = catchAsyncError(
  async (req, res, next) => {
    const user = await User.findOne({
      _id: req.params.id,
      isdelete: false,
    });

    if (!user) return next(new ErrorHandler("User not Found", 404));

    // Toggle the 'isblocked' property
    user.isblocked = !user.isblocked;
    user.updatedByr = req.user._id;

    await user.save();

    res.status(200).json({
      success: true,
      message: " Block Conformation Updated",
    });
  }
);

// delete user

export const deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({
    _id: req.params.id,
    isdelete: false,
  });

  if (!user) return next(new ErrorHandler("User not Found", 404));

  // await cloudinary.uploader.destroy(user.avatar.public_id)

  // cancel Susscripsion

  user.isdelete = true;
  user.deletedBy = req.user._id;

  await user.save();

  res.status(200).json({
    success: true,
    message: "User Deleted Sucessfully",
  });
});

// user restore
export const restoreUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({
    _id: req.params.id,
    isdelete: true,
  });

  if (!user) return next(new ErrorHandler("User not Found", 404));

  user.isVerified = false;
  user.isdelete = false;
  user.deletedBy = null;
  user.updatedBy = req.user._id;

  await user.save();

  const restoreUser = await User.findById(user._id)
    .select(" -isdelete ")
    .populate({
      path: "role",
      select: "name",
    })
    .populate({
      path: "company",
      select: ["companyName", "companyId"],
    });

  if (!restoreUser) {
    return next(
      new ErrorHandler("Something went wrong while restoring the user", 501)
    );
  }

  res.status(200).json({
    success: true,
    message: "User Restored Successfully",
    user: restoreUser,
  });
});

// // Reset Password
export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { password, newpassword } = req.body;

  // Check if all required fields are provided
  if (!password || !newpassword) {
    return next(
      new ErrorHandler("Current password and new password are required", 400)
    );
  }

  // Find the user and ensure the account is not deleted
  const user = await User.findOne({ _id: req.user._id, isdelete: false }).select("+password -isdelete") ;

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Verify the current password
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Incorrect current password", 401));
  }

  // Ensure the new password is not the same as the current password
  if(newpassword.toString() === password.toString()){
    return next(new ErrorHandler("New password cannot be the same as the current password", 400));
  }
  // const isSamePassword = await user.comparePassword(newpassword);
  // if (isSamePassword) {
  //   return next(new ErrorHandler("New password cannot be the same as the current password", 400));
  // }

  // Update the password and track who updated it
  user.password = newpassword; // `pre-save` middleware and model validation handle hashing and regex validation
  user.updatedBy = req.user?._id ;

  // Save the updated user record
  await user.save();

  // Respond with success
  res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
});
