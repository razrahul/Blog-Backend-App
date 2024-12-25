import express from "express"

import {createBlog, addSubtitle, getAllBlogs, deleteBlog, deleteSubtitle, addFAQ} from "../controllers/blogController.js"
import { isAuthenticated, authorizeAdmin } from "../middlewares/auth.js"


import singleUpload  from "../middlewares/multer.js"

const router = express.Router()

// create Blog templete

router.route("/createblog").post(isAuthenticated, singleUpload, createBlog)

//GEt All Blogs
router.route("/blogs").get( getAllBlogs)

//Add subtitle
router.route("/blogs/:id")
        .delete(isAuthenticated, authorizeAdmin, deleteBlog)
        .post(isAuthenticated, singleUpload, addSubtitle)

// Add FAQ

router.route("/addfaq/:id").post(isAuthenticated, addFAQ)

// delete Subtitles

router.route("/deletesubtitle").delete(isAuthenticated, deleteSubtitle)


export default router;