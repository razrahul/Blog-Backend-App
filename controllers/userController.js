import { User } from "../models/User.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { sendToken } from "../utils/sendToken.js";
import ErrorHandler from "../Utils/errorHandler.js";
import {
  allfiled,
  invalid,
  logoutSuss,
  invalidPass,
} from "../Utils/message.js";

export const register = catchAsyncError(async (req, res, next) => {
  const { name, email, number, password, role } = req.body;

  const file = req.file;

  if (!name || !email || !password)
    return next(new ErrorHandler(allfiled, 400));

  let user = await User.findOne({ email });
  if (user) return next(new ErrorHandler("USer Already Exist", 409));
  // upload file on cloudanary

  // const fileUri = getDataUri(file);

  // const myCloud = await cloudinary.uploader.upload(fileUri.content)

  user = await User.create({
    name,
    email,
    number,
    password,
    role,
    //  avatar:{
    //     public_id: myCloud.public_id,
    //     url: myCloud.secure_url,
    //  }
  });
  sendToken(res, user, "Register Suessfully ", 201);
});

//login controller

export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) return next(new ErrorHandler(allfiled, 400));

  const user = await User.findOne({ email }).select("+password");

  // console.log(admin);

  if (!user) return next(new ErrorHandler(invalid, 401));

  //compare passward to hash password
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) return next(new ErrorHandler(invalidPass, 401));

  // Compare passwords (plain-text comparison)
  // if (admin.password !== password) {
  //     return next(new ErrorHandler("Invalid email or only password", 401));
  // }

  // if(!isPasswordMatched ) return next(new ErrorHandler("Invalid  Password", 401))

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
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
});

// admin controller

export const getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.find({});

  res.status(200).json({
    success: true,
    message: "All Users",
    users,
  });
});



// update user verification  
export const updateUserverification  = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new ErrorHandler("User not Found", 404));

  // Toggle the 'isVerified' property
  user.isVerified = !user.isVerified;

  await user.save();

  res.status(200).json({
    success: true,
    message: " verification Updated",
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


// update user block conformation

export const updateUserBlockConformation  = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new ErrorHandler("User not Found", 404));

  // Toggle the 'isblocked' property
  user.isblocked = !user.isblocked;

  await user.save();

  res.status(200).json({
    success: true,
    message: " Block Conformation Updated",
  });
});


// delete user

export const deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new ErrorHandler("User not Found", 404));

  // await cloudinary.uploader.destroy(user.avatar.public_id)

  // cancel Susscripsion

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User Deleted Sucessfully",
  });
});
