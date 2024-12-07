import mongoose from "mongoose";
import validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    validate: validator.isEmail,
  },
  number: {
    type: Number,     //if no will most then type string and uncomment
    default: null,
    // required: [true, "Please enter your Mobile No"],
    // validate: {
    //   validator: function (v) {
    //     return /^\d{10}$/.test(v); // Validates exactly 10 digits
    //   },
    //   message: "Mobile number must be 10 digits",
    // },
  },
  avatar: {
    public_id: {
      type: String,
      default: null, 
    },
    url: {
      type: String,
      default: null, // Default to null if not provided
    },
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [6, "Password must be at least 6 characters"],
    select: false,
  },
  role: {
    type: String,
    enum: ["SuperAdmin","Admin", "Devloper","Contant Writer", "Desiner", "other"],
    default: "Admin",
  },
  isview: {
    type: String,
    enum: ["public", "private"],
    default: "public",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isblocked:{
    type:Boolean,
    default:false
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: String,
  resetPasswordExpire: String,
});

// Hash the password before saving
schema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Generate JWT token
schema.methods.getJWTToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
};

// Compare passwords to hash password
schema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export const User = mongoose.model("User", schema);
