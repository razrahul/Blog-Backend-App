import express from "express";
import {
  createSubtitle,
  getAllSubtitles,
  getSubtitleById,
  updateSubtitle,
  deleteSubtitle,
  getAllDeletedSubtitles,
  restoreSubtitle
} from "../controllers/subtitleController.js";
import { isAuthenticated, authorizeAdmin } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";

const router = express.Router();

// create Subtitle
router.route("/subtitles/:blogId").post(isAuthenticated, singleUpload, createSubtitle)

// Get all Subtitles
router.route("/subtitles").get(getAllSubtitles);

// Get all Deleted Subtitles
router.route("/deletedsubtitles").get(isAuthenticated, authorizeAdmin, getAllDeletedSubtitles);

// Get, Update, Delete Subtitle by ID
router.route("/subtitles/:id")
  .get(getSubtitleById)
  // .put(isAuthenticated, singleUpload, updateSubtitle)
  .delete(isAuthenticated, authorizeAdmin, deleteSubtitle);


// update Subtitle id in Query
router.route("/updateSubtitle").put(isAuthenticated, singleUpload, updateSubtitle);

//restore Subtitle
router.route("/Subtitle/restore/:id").put(isAuthenticated, authorizeAdmin, restoreSubtitle);

export default router;
