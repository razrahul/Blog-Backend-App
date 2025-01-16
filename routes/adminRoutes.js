import express from "express";
import { updateUserRoleAndCompany, restoreRole, restoreCompany, restoreCategory } from "../controllers/adminController.js";
import { isAuthenticated, authorizeAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Update user role and company
router.route("/user/:id/role-company").put(isAuthenticated, authorizeAdmin, updateUserRoleAndCompany);

//TODO: create restore role
//restore Role
router.route("/role/restore/:id").put(isAuthenticated, authorizeAdmin, restoreRole);

//TODO: create restore company => complete
//restore company
router.route("/company/restore/:id").put(isAuthenticated, authorizeAdmin, restoreCompany)


//TODO: create restore category=> complete
//restore category
router.route("/category/restore/:id").put(isAuthenticated, authorizeAdmin, restoreCategory)



export default router;
