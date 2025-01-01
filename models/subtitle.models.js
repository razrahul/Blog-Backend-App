import mongoose from "mongoose";
import { User } from "./User";

const subtitleSchems = new mongoose.Schema(
  {
    indexNo: {
      type: Number,
      default: 0, 
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
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    updateddBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    deletedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    isactive:{
        type:Boolean,
        default: true
    },
    isdelete:{
        type:Boolean,
        default:false
    }
  },
  { timestamps: true }
);

export const Subtitle = mongoose.model("Subtitle", subtitleSchems);
