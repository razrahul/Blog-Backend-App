import mongoose from "mongoose";
import { User } from "./User.js";
import ErrorHandler from "../Utils/errorHandler.js";

const schema = new mongoose.Schema({
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:User,
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
        unique: true,
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
      
    },{timestamps: true}
  ],

  FAQ:[
    {
      indexNo:{
        type:Number,
        unique:true,
      },
      question:{
        type:String,
        required:true,
      },
      answer:{
        type:String,
        required:true,
      },
    },{timestamps: true},
  ],

  views: {
    type: Number,
    default: 0,
  },
  numOfSubtitles: {
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
  },
  
},{timestamps: true});

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
