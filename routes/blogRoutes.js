import express from "express";

import {
  createBlog,
  addSubtitle,
  getAllBlogs,
  getAllDeletedBlogs,
  getBlogById,
  deleteBlog,
  deleteSubtitle,
  updateBlog,
  updateIsPublic,
  getAllPublicBlogs,
  restoreBlog,
  updateBlogViews,
  getAllPublicBlogsByCategoryId,
  getAllPublicBlogsByCompanyId,
  getPublicBlogById,
} from "../controllers/blogController.js";
import { isAuthenticated, authorizeAdmin } from "../middlewares/auth.js";

import singleUpload from "../middlewares/multer.js";

const router = express.Router();

// create Blog templete

router.route("/createblog").post(isAuthenticated, singleUpload, createBlog);

//GEt All Blogs
router.route("/blogs").get(isAuthenticated, getAllBlogs);

//Get All Public Blogs for website
router.route("/publicblogs").get(getAllPublicBlogs);

//get public blog by id
router.route("/publicblogs/:id").get(getPublicBlogById);

//get All Public Blogs by companyId
router.route("/publicblogs/com/:id").get(getAllPublicBlogsByCompanyId);

//get All public Blogs by categoryId 
// router.route("/blogs/catId/:id").get(getAllBlogsByCategoryId);
//get All public Blogs by companyId and categoryId
router.route("/publicblogs/comId/catId").get(getAllPublicBlogsByCategoryId);

//Get All deleted Blogs
router
  .route("/deletedblogs")
  .get(isAuthenticated, authorizeAdmin, getAllDeletedBlogs);

//Get Blog by ID
router.route("/blogs/:id").get(getBlogById);

//Update Blog
router.route("/blogs/:id").put(isAuthenticated, singleUpload, updateBlog);

//Delete Blog
router.route("/blogs/:id").delete(isAuthenticated, authorizeAdmin, deleteBlog);

// update Blog ispublic status
router
  .route("/admin/public/:id")
  .put(isAuthenticated, authorizeAdmin, updateIsPublic);

// restore Blog
router
  .route("/blog/restore/:id")
  .put(isAuthenticated, authorizeAdmin, restoreBlog);

// update Blog views
router.route("/blog/views/:id").put(updateBlogViews);

// //Add subtitle
// router.route("/blogs/:id")
//         .delete(isAuthenticated, authorizeAdmin, deleteBlog)
//         .post(isAuthenticated, singleUpload, addSubtitle)

// delete Subtitles

// router.route("/deletesubtitle").delete(isAuthenticated, deleteSubtitle)

export default router;
