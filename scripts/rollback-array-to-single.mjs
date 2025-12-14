// careful: this will set category to first element for array docs
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import { Blog } from "../models/blog.models.js";

async function run() {
  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  await Blog.updateMany({ category: { $type: "array" } }, [{ $set: { category: { $arrayElemAt: ["$category", 0] } } }]);
  await mongoose.disconnect();
  console.log("Rollback done (arrays -> first element).");
}
run().catch(e=>{console.error(e); process.exit(1);});
