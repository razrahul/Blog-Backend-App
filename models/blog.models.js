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
    category: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    }],
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
      min: 0,
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

// keep subtitle count accurate
schema.pre("save", function (next) {
  if (this.Subtitle) this.numOfSubtitles = this.Subtitle.length;
  next();
});

// --- BACKWARD COMPAT: if someone sends single id, coerce to array ---
schema.pre("validate", function (next) {
  if (this.isModified("category")) {
    if (this.category && !Array.isArray(this.category)) {
      this.category = [this.category];
    }
    if (Array.isArray(this.category)) {
      this.category = this.category.filter((c) => c !== null && c !== undefined && c !== "");
    }
  }
  next();
});

// --- STRICT VALIDATOR: ensure at least one category present ---
schema.path("category").validate(function (val) {
  return Array.isArray(val) && val.length > 0;
}, "Please provide at least one category");

// virtual for convenience (optional usage)
schema.virtual("primaryCategory").get(function () {
  if (!this.category) return null;
  return Array.isArray(this.category) ? this.category[0] : this.category;
});

// 🚀 optimize pagination query
schema.index({ company: 1, isdelete: 1, ispublic: 1, createdAt: -1 });
schema.index({ category: 1 });

export const Blog = mongoose.model("Blog", schema);
