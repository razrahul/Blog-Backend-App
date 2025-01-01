import express from 'express';
import { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory, changeCategoryActivity, getAllDeletedCategories } from '../controllers/categoryController.js';
import { isAuthenticatedUser, isAuthenticated, authorizeAdmin, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

// Create Category
router.route('/category').post(isAuthenticated, createCategory);

// Get All Categories
router.route('/categories').get(isAuthenticated, getAllCategories);

// Get All deleted Categories
router.route('/categories/deleted').get(isAuthenticated, getAllDeletedCategories);

// Get Category by ID
router.route('/category/:id').get(isAuthenticated, getCategoryById);

// Update Category
router.route('/category/:id').put(isAuthenticated, updateCategory);

// Delete Category
router.route('/category/:id').delete(isAuthenticated, deleteCategory);

// Change Activity Status
router.route('/category/activity/:id').patch(isAuthenticated, changeCategoryActivity);

export default router;
