import mongoose from "mongoose";
import { User } from "./User.js";

const schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
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
      indexNo:{
        type:Number,
        required:true
      },
      title: {
        type: String,
        required: true,
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
      description: {
        type: String,
        required: true,
      },
      
    },
  ],

  views: {
    type: Number,
    default: 0,
  },
  numOfBlog: {
    type: Number,
    default: 0,
  },
  isview: {
    type: String,
    default: "public",
    enum: ["public", "private"],
  },

  createdBy: {
    type: String,
    required: [true, "Enter Course Creator Name"],
    default: User.name,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updateAt: {
    type: Date,
    default: Date.now,
  },
});

export const Blog = mongoose.model("Blog", schema);
