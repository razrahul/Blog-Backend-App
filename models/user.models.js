import mongoose from "mongoose";
import validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      trim: true,
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },
    number: {
      type: Number,
      default: null,
      maxLength: [10, "Mobile number cannot exceed 10 digits"],
      required: [true, "Please enter your Mobile No"],
      validate: {
        validator: function (number) {
          return /^[6-9][\d]{9}$/.test(number);
        },
        message: "Mobile number must be 10 digits and Indian",
      },
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
      select: false,
      validate: {
        validator: function (password) {
          return /^(?=.*[A-Z])(?=.*[a-z])(?=.*[\d])(?=.*[\W_]).{8,}$/.test(
            password
          );
        },
        message:
          "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character",
      },
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isblocked: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isactive: {
      type: Boolean,
      default: true,
    },
    isdelete: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: String,
  },
  { timestamps: true }
);

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
