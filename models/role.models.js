import mongoose, { Schema } from "mongoose";
import { User } from "../models/user.models.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const roleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isactive: {
      type: Boolean,
      default: true,
    },
    isdeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

roleSchema.plugin(mongooseAggregatePaginate);

export const Role = mongoose.model("Role", roleSchema);
