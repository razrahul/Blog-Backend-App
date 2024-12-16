import express from "express";
import {
  register,
  login,
  logout,
  getUserProfile,
  getAllUsers,
  updateUserView,
  deleteUser,
  updateUserverification,
  updateUserBlockConformation,
} from "../controllers/userController.js";
import { isAuthenticated, authorizeAdmin,  } from "../middlewares/auth.js";
import { cheackUser } from "../middlewares/cheackUser.js";

const router = express.Router();

//register
router.route("/register").post(register);

//login
router.route("/login").post(login);

//logout
router.route("/logout").get(logout);

//profile

router.route("/me").get(isAuthenticated, getUserProfile);

//  routes for SuperAdmin
router
  .route("/admin/allusers")
  .get(isAuthenticated, authorizeAdmin, getAllUsers);


//update user role &&d  delete user
router
  .route("/admin/user/:id")
        .put(isAuthenticated, authorizeAdmin, updateUserverification)
        .delete(isAuthenticated, authorizeAdmin, deleteUser);

router
  .route("/admin/view/:id")
        .put(isAuthenticated, authorizeAdmin, updateUserView)

router.route("/admin/block/:id")
        .put(isAuthenticated, authorizeAdmin, updateUserBlockConformation);

export default router;
