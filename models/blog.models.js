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
      type: String,
      required: true,
    },

    Subtitle: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subtitle",
      },
    ],
    company:{
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

// Pre-save hook to set the indexNo for each new subtitle and FAQ
schema.pre("save", function (next) {
  const blog = this;

  // Set indexNo for new subtitles
  blog.Subtitle.forEach((subtitle, index) => {
    if (subtitle.isNew) {
      subtitle.indexNo = index + 1;
    }
  });

  next();
});

// Middleware to ensure unique indexNo in Subtitle array
schema.pre("save", function (next) {
  const indexNumbers = this.Subtitle.map((item) => item.indexNo);
  const hasDuplicates = indexNumbers.some(
    (index, i) => indexNumbers.indexOf(index) !== i
  );

  if (hasDuplicates) {
    return next(new ErrorHandler("Subtitle indexNo must be unique.", 400));
  }
  next();
});

export const Blog = mongoose.model("Blog", schema);
