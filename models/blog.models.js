import mongoose from "mongoose";
import { User } from "./user.models.js";
import ErrorHandler from "../Utils/errorHandler.js";

const schema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please enter course title"],
      minLength: [4, "Title must be at least 4 characters"],
      maxLength: [80, "Title can't exceed 80 characters"],
    },
    poster: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    description: {
      type: String,
      required: [true, "Please enter Blog title"],
      minLength: [20, "Title must be at least 20 characters"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    Subtitle: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subtitle",
      },
    ],
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    views: {
      type: Number,
      default: 0,
    },
    numOfSubtitles: {
      type: Number,
      default: 0,
    },
    ispublic: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
  },
  { timestamps: true }
);

export const Blog = mongoose.model("Blog", schema);
