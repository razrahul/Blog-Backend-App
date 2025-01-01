import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
    },
    companyId: {
      type: String,
      default:null
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

companySchema.plugin(mongooseAggregatePaginate);

export const Company = mongoose.model("Company", companySchema);
