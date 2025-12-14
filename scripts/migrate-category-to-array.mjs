// scripts/migrate-category-to-array.mjs
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import { Blog } from "../models/blog.models.js"; // <-- adjust path if needed
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("Please set MONGODB_URI in your .env");
  process.exit(1);
}
const APPLY = process.argv.includes("--apply"); // pass --apply to actually modify
const DEFAULT_CATEGORY_ID = process.env.DEFAULT_CATEGORY_ID || null; // optional default

async function run() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log("Connected to DB");

  // preview docs with single (non-array) category
  const singleCount = await Blog.countDocuments({ category: { $exists: true }, $expr: { $not: { $isArray: "$category" } } });
  console.log(`Docs with single category (non-array): ${singleCount}`);

  const sample = await Blog.find({ category: { $exists: true }, $expr: { $not: { $isArray: "$category" } } })
    .select("_id title category")
    .limit(50)
    .lean();
  if (sample.length) {
    console.log("Sample docs (up to 50):");
    sample.forEach(d => console.log(d._id.toString(), "|", d.title || "<no-title>", "| category:", JSON.stringify(d.category)));
  }

  // preview docs missing/empty category
  const missingCount = await Blog.countDocuments({ $or: [{ category: { $exists: false } }, { category: null }, { category: { $size: 0 } }] });
  console.log(`Docs with missing/empty category: ${missingCount}`);

  if (!APPLY) {
    console.log("\nDry-run complete. To apply changes run:\n  node scripts/migrate-category-to-array.mjs --apply\n");
    await mongoose.disconnect();
    return;
  }

  // APPLY: convert single -> array
  console.log("Applying migration: converting single category -> array...");
  try {
    const res = await Blog.updateMany(
      { category: { $exists: true }, $expr: { $not: { $isArray: "$category" } } },
      [{ $set: { category: [{ $cond: [{ $eq: ["$category", null] }, null, "$category"] }] } }]
    );
    console.log("Pipeline update result:", res);
  } catch (err) {
    console.warn("Pipeline update failed — falling back to cursor update:", err.message);
    const cursor = Blog.find({ category: { $exists: true } }).cursor();
    let converted = 0;
    for await (const doc of cursor) {
      if (doc.category && !Array.isArray(doc.category)) {
        doc.category = [doc.category];
        await doc.save();
        converted++;
      }
    }
    console.log("Converted docs (cursor):", converted);
  }

  // Optionally fill missing docs with DEFAULT_CATEGORY_ID (if provided)
  if (DEFAULT_CATEGORY_ID) {
    const r = await Blog.updateMany(
      { $or: [{ category: { $exists: false } }, { category: null }, { category: { $size: 0 } }] },
      { $set: { category: [DEFAULT_CATEGORY_ID] } }
    );
    console.log("Filled missing/empty category docs with DEFAULT_CATEGORY_ID:", r.modifiedCount ?? r.nModified ?? r);
  } else {
    const remaining = await Blog.countDocuments({ $or: [{ category: { $exists: false } }, { category: null }, { category: { $size: 0 } }] });
    console.log("Remaining docs with missing/empty category after conversion:", remaining);
    if (remaining > 0) console.log("You can set DEFAULT_CATEGORY_ID in .env to auto-fill those and re-run with --apply.");
  }

  await mongoose.disconnect();
  console.log("Migration applied. Disconnected.");
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
