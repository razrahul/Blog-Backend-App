import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import ErrorHandler from "../Utils/errorHandler.js";
import { catchAsyncError } from "./catchAsyncError.js";

// Middleware to check user authorization
export const cheackUser = catchAsyncError(async (req, res, next) => {
  // Get token from cookies
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("Access Denied: No token provided", 401));
  }

  // Verify token and decode user ID
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return next(new ErrorHandler("Access Denied: Invalid token", 401));
  }

 

  const user = await User.findById(decoded._id);

  if (!user) {
    // Expire the token immediately if user is not found
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    return next(new ErrorHandler("User not found. Token has been invalidated.", 404));
  }

  // Check if the user is blocked
  if (user.isblocked) {
    // Expire the token immediately
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    return next(new ErrorHandler("Access Denied: User is blocked. Please contact Admin.", 403));
  }

  // Check if the user is verified
  if (!user.isVerified) {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    return next(new ErrorHandler("Access Denied: User is not verified. Please contact Admin.", 403));
  }

  // Attach user to the request object for further use
  req.user = user;
  next();
});