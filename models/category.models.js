import mongoose, { Schema } from "mongoose";
import { User } from "./user.models.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
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

categorySchema.plugin(mongooseAggregatePaginate);

export const Category = mongoose.model("Category", categorySchema);
