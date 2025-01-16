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
  getAllDeletedUsers,
  updateUserProfile,
  updateUserActivity,
  restoreUser,
  resetPassword,
} from "../controllers/userController.js";
import { isAuthenticated, authorizeAdmin } from "../middlewares/auth.js";
import { cheackUser } from "../middlewares/cheackUser.js";
import singleUpload from "../middlewares/multer.js";

const router = express.Router();


//TODO: Testing => receation of user is give error
//register
router.route("/register").post(isAuthenticated, authorizeAdmin, singleUpload,register)

//login
router.route("/login").post(login);

//logout
router.route("/logout").get(logout);

//profile

router.route("/me").get(isAuthenticated, cheackUser, getUserProfile);

    // TODO: Testing => complaete but password not working and create other options
// Update user profile
router.route("/me/update").put(isAuthenticated, singleUpload, updateUserProfile);

//  Get All Users
router
  .route("/admin/allusers")
  .get(isAuthenticated, authorizeAdmin, getAllUsers);

//Get All Deleted Users
router
  .route("/admin/deletedusers")
  .get(isAuthenticated, authorizeAdmin, getAllDeletedUsers);


//update user role &&d  delete user
router
  .route("/admin/user/:id")
        .put(isAuthenticated, authorizeAdmin, updateUserverification)
        .delete(isAuthenticated, authorizeAdmin, deleteUser);


// update user block
router.route("/admin/block/:id")
        .put(isAuthenticated, authorizeAdmin, updateUserBlockConformation);

        // TODO: Testing => complated
// Update user activity
router.route("/activity/:id")
  .put(isAuthenticated, updateUserActivity);

      // TODO: Testing => Complated
// Restore user
router.route("/admin/restore/:id")
  .put(isAuthenticated, authorizeAdmin, restoreUser);

//reset password
router.route("/resetpassword").post(isAuthenticated, resetPassword);

export default router;
