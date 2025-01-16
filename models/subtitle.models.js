import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please enter subtitle title"],
      minLength: [4, "Title must be at least 4 characters"],
      maxLength: [80, "Title can't exceed 80 characters"],
    },
    description: {
      type: String,
      required: [true, "Please enter subtitle description"],
      minLength: [20, "Description must be at least 20 characters"],
    },
    poster: {
      public_id: {
        type: String,
        default: null,
      },
      url: {
        type: String,
        default: null,
      },
    },
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
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
  },
  { timestamps: true }
);

export const Subtitle = mongoose.model("Subtitle", schema);
