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
  getPublicBlogByCompanyIdAndTitle,
  getAllPublicBlogsByCompanyIdLimited,
  getBlogWithNeighbors,
  searchBlogsByTitle,
  getMostViewedBlogs,
} from "../controllers/blogController.js";
import { isAuthenticated, authorizeAdmin } from "../middlewares/auth.js";

import singleUpload from "../middlewares/multer.js";

const router = express.Router();

// create Blog templete

router.route("/createblog").post(isAuthenticated, singleUpload, createBlog);

// ===== BLOG STATS (SABSE UPAR) =====
router.put("/blog/views/:id", updateBlogViews);
router.get("/blogs/mostviews", getMostViewedBlogs);

//GEt All Blogs
router.route("/blogs").get(isAuthenticated, getAllBlogs);

// GET /publicblogs/search?q=Digital&page=1
// or POST /publicblogs/search  with JSON body { q: "Digital" }  (query preferred)
router.get("/publicblogs/search", searchBlogsByTitle);

//Get All Public Blogs for website
router.route("/publicblogs").get(getAllPublicBlogs);


//get All Public Blogs by companyId limited for homepage {pagenation applyed 10 blogs each page}
router.route("/publicblogs/com/limited/:id").get(getAllPublicBlogsByCompanyIdLimited);

//get All Public Blogs by companyId
router.route("/publicblogs/com/:id").get(getAllPublicBlogsByCompanyId);



//// GET /publicblogs/:id/navigation?companyId=...   (companyId optional) to get blog with previous and next blogs
router.route("/publicblogs/:id/navigation").get(getBlogWithNeighbors);

//get public blog by id
router.route("/publicblogs/:id").get(getPublicBlogById);

//get All public Blogs by categoryId 
// router.route("/blogs/catId/:id").get(getAllBlogsByCategoryId);
//get All public Blogs by companyId and categoryId
router.route("/publicblogs/comId/catId").get(getAllPublicBlogsByCategoryId);

//get public blog by companyId and search by  title and category name
router.route("/publicblogs/comId/search/:id").post(getPublicBlogByCompanyIdAndTitle);

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



// //Add subtitle
// router.route("/blogs/:id")
//         .delete(isAuthenticated, authorizeAdmin, deleteBlog)
//         .post(isAuthenticated, singleUpload, addSubtitle)

// delete Subtitles

// router.route("/deletesubtitle").delete(isAuthenticated, deleteSubtitle)

export default router;
