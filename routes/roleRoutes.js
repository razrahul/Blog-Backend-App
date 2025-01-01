import express from 'express';
import { createRole, getAllRoles, getRoleById, updateRole, deleteRole, changeActivity, getAllDeletedRoles } from '../controllers/roleController.js';
import { isAuthenticatedUser, isAuthenticated, authorizeAdmin, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

// Create Role
router.route('/role').post(isAuthenticated, createRole);

// Get All Roles
router.route('/roles').get(isAuthenticated, getAllRoles);

// Get All Deleted Roles
router.route('/roles/deleted').get(isAuthenticated, getAllDeletedRoles);

// Get Role by ID
router.route('/role/:id').get(isAuthenticated, getRoleById);

// Update Role
router.route('/role/:id').put(isAuthenticated, updateRole);

// Delete Role
router.route('/role/:id').delete(isAuthenticated, deleteRole);

// Change Activity Status
router.route('/role/activity/:id').patch(isAuthenticated, changeActivity);

export default router;