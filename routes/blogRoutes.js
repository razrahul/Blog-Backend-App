import express from "express"

import {createBlog, addSubtitle} from "../controllers/blogController.js"
import { isAuthenticated, authorizeAdmin } from "../middlewares/auth.js"


import singleUpload  from "../middlewares/multer.js"

const router = express.Router()

// create Blog templete

router.route("/createblog").post(isAuthenticated, singleUpload, createBlog)

//Add subtitle
router.route("/blogs/:id").post(isAuthenticated, singleUpload, addSubtitle)


export default router;